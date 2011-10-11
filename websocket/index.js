var http= require("http"),
	path= require("path"),
	Crypto= require("crypto"),
	Buffer= require("buffer").Buffer,
	emitter= require("../util/emitter.js");


var _ws;
var websocket= {
	init: function(ws) {
		_ws= ws;
	},
	io: function(data) {
		//这里只考虑了单个连接的情况
		//可以改造为支持多个连接
		if(_ws) {
			_ws.write(data);
		}
	},
	extend: function(httpServer) {
		wsMiddleWare(httpServer);
		return httpServer;
	}
};

module.exports= websocket;

var wsMiddleWare= function(server) {
	//有连接还会产生tinyWebSocketServer实例
	server.on("upgrade", function(req, socket, upgradeHead) {
		websocket.init(new tinyWebSocketServer(server, req, socket, upgradeHead));
	});
};
var tinyWebSocketServer= function(server, req, socket, upgradeHead) {
	var _this= this;
	this.server= server;
	this.req= req;
	this.socket= socket;
	socket.setNoDelay(true);
	this.socket.on("close", function(){
		_this.destory();
	});
	this.socket.on("error", function(){
		_this.destory();
	});
	this.upgradeHead= upgradeHead; 
	this.buffer= null;
	this.init();
};
tinyWebSocketServer.prototype= {
	init: function() {
		var ver= this.checkVersion();
		var _this= this;
		switch(ver) {
			case "draft76":
			case "draftlatest":
				//todo
				this.socket.on("data", function(data){
					_this.onData(data);
				});
				this["handshake_"+ver]();
				/*
				setTimeout(function(){
					_this.socket.destroy();
				}, 30000);
				*/
				break;
			default:

		}
		//this.testloop();
		console.info("websocket connected!");
	},
	destory: function() {
		console.info("socket die.");
		//clearTimeout(this._ttt);
	},
	testloop: function() {
		//for test
	  	var _this= this;
		var i= 0;
	  	this._ttt= setInterval(function(){
	  		websocket.io(i++);
	  	},100);
	},
	write: function(data) {
	   	data= (typeof data == "string")?data: JSON.stringify(data);
		/*
	   	var byteLen= Buffer.byteLength(data, "utf8"),
	       	bytes= new Buffer(byteLen);
	   	bytes.write(data, 0, "utf8");
		var _bytes= this.encodePacket(bytes);
		*/
		var _bytes= this.frame(data);
	   	this.socket.write(_bytes);
   	},
	messageHandler: function(data) {
		emitter.emit("websocket", data.toString("utf-8"));
	},
	frame: function(str, opcode) {
		opcode= opcode||0x81;
		var dataBuffer = new Buffer(str)
		    , dataLength = dataBuffer.length
		    , startOffset = 2
		    , secondByte = dataLength;
		  if (dataLength > 65536) {
		    startOffset = 10;
		    secondByte = 127;
		  }
		  else if (dataLength > 125) {
		    startOffset = 4;
		    secondByte = 126;
		  }
		  var outputBuffer = new Buffer(dataLength + startOffset);
		  outputBuffer[0] = opcode;
		  outputBuffer[1] = secondByte;
		  dataBuffer.copy(outputBuffer, startOffset);
		  switch (secondByte) {
		  case 126:
		    outputBuffer[2] = dataLength >>> 8;
		    outputBuffer[3] = dataLength % 256;
		    break;
		  case 127:
		    var l = dataLength;
		    for (var i = 1; i <= 8; ++i) {
		      outputBuffer[startOffset - i] = l & 0xff;
		      l >>>= 8;
		    }
		  }
		  return outputBuffer;
	},
	onData: function(data) {
		var buffer= this.buffer;
		if(buffer){
		    var newbuf = new Buffer(buffer.length+data.length);
		    buffer.copy(newbuf);
		    data.copy(newbuf,buffer.length);
		    buffer = newbuf;
		}else{
		    buffer = data;
		}
		var ret;
		while((ret = this.decodePacket(buffer,this.messageHandler))>0){
		    buffer = buffer.slice(ret);
		};
		/*
		var trunk;
		for(var i=0, len= data.length; i< len; i++) {
			if(!this.o) {
				if(data[i] & 0x80 === 0x80) {
					this.o= 1;						
				}else {
					this.o= -1;
				}
			}else if(this.o === -1) {
				if(data[i] === 0xFF) {
					trunk= new Buffer(this.frameData);
					this.o= 0;
					this.frameData= [];
					//this.write(trunk.toString("utf8", 0, trunk.length));
					console.info(trunk.toString("utf8"));
				}else {
					this.frameData= this.frameData||[];
					this.frameData.push(data[i]);
				}
				
			}else if(this.o === 1) {
				//error happend
				this.o= 0;
			}
		}
		*/
	},
	checkVersion: function() {				
		var headers= this.req.headers;
		if(headers["sec-websocket-key1"] &&
			headers["sec-websocket-key2"]) {
			if(this.upgradeHead.length>=8) {
				return "draft76";
			}
			return null;
		}
		return "draftlatest";
	},
	decodePacket:function(buffer,callback){
		if(buffer.length<2)return 0;
		var offset = 0;
		var fin,op,mask,len,key,data;
		var tmp = buffer.readUInt8(offset++);
		fin = tmp >> 7;
		op = tmp & 0x0F;
		tmp = buffer.readUInt8(offset++);
		mask = tmp >>7;
		len = tmp & 0x7F;
		if(len==126){
		    if(buffer.length-offset<2)return 0;
		    len = buffer.readUInt16BE(offset);
		    offset += 2;
		}else if(len == 127){
		    if(buffer.length-offset<8)return 0;
		    // Note: due to leak of 64bit integer support, read only low 32bits of length here.
		    offset += 4
		    len = buffer.readUInt32BE(offset);
		    offset += 4;
		}
		//            console.info("fin   : "+fin);
		//            console.info("op    : "+op);
		//            console.info("mask  : "+mask);
		//            console.info("length: "+len);
		if(mask){
		    if(buffer.length-offset<4)return 0;
		    key = buffer.readUInt32BE(offset);
		    offset += 4;
		}
		if(buffer.length-offset<len)return 0;
		buffer = buffer.slice(offset,offset+len);
		if(key!=undefined){
		    this.mask(buffer,key);
		}
		callback(buffer);
		return offset+len;
	},
	mask: function(buffer,key){
		var offset = 0;
		while(offset+4<buffer.length){
		    var val = buffer.readUInt32BE(offset);
		    val = val ^ key;
		    buffer.writeUInt32BE(val,offset);
		    offset += 4;
		}
		if(offset==buffer.length)return;
		var tmpBuf = new Buffer(4);
		tmpBuf.writeUInt32BE(key,0);
		while(offset<buffer.length){
		    var val = buffer.readUInt8(offset);
		    key = tmpBuf.readUInt8(offset%4);
		    val = val ^ key;
		    buffer.writeUInt8(val,offset);
		    offset ++;
		}
	},
	encodePacket: function(packet){
        var len = 2;
        if(packet.length>0xFFFF){
            len += 8;
        }else if(packet.length>126){
            len += 2;
        }
        len += packet.length;
        var ret = new Buffer(len);
        len = 0;
        ret.writeUInt8(0x81,len++);
        if(packet.length>0xFFFF){
            ret.writeUInt8(127,len++);
            ret.writeUInt32BE(0,len);
            ret.writeUInt32BE(packet.length,len+4);
            len += 8;
        }else if(packet.length>126){
            ret.writeUInt8(126,len++, false);
            ret.writeUInt16BE(packet.length,len);
            len += 2;
        }else{
            ret.writeUInt8(packet.length,len++);
        }
        packet.copy(ret,len);
        return ret;
    },
	decodePacket:function(buffer,callback){
		if(buffer.length<2)return 0;
        var offset = 0;
        var fin,op,mask,len,key,data;
        var tmp = buffer.readUInt8(offset++);
        fin = tmp >> 7;
        op = tmp & 0x0F;
        tmp = buffer.readUInt8(offset++);
        mask = tmp >>7;
        len = tmp & 0x7F;
        if(len==126){
            if(buffer.length-offset<2)return 0;
            len = buffer.readUInt16BE(offset);
            offset += 2;
        }else if(len == 127){
            if(buffer.length-offset<8)return 0;
            // Note: due to leak of 64bit integer support, read only low 32bits of length here.
            offset += 4
            len = buffer.readUInt32BE(offset);
            offset += 4;
        }
		//            console.info("fin   : "+fin);
		//            console.info("op    : "+op);
		//            console.info("mask  : "+mask);
		//            console.info("length: "+len);
        if(mask){
            if(buffer.length-offset<4)return 0;
            key = buffer.readUInt32BE(offset);
            offset += 4;
        }
        if(buffer.length-offset<len)return 0;
        buffer = buffer.slice(offset,offset+len);
        if(key!=undefined){
            this.mask(buffer,key);
        }
        callback(buffer);
        return offset+len;
    },
	pack: function(num) {
		var result= "";
	  	result+= String.fromCharCode(num >> 24 & 0xFF);
	  	result+= String.fromCharCode(num >> 16 & 0xFF);
	  	result+= String.fromCharCode(num >> 8 & 0xFF);
	  	result+= String.fromCharCode(num & 0xFF);
		return result;
	},
	handshake_draftlatest: function() {
		var key= this.req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
		var response_key = Crypto.createHash('sha1').update( key ).digest('base64');
		var res= 'HTTP/1.1 101 WebSocket Protocol Handshake\r\n'+
			'Upgrade: WebSocket\r\n'+
			'Connection: Upgrade\r\n'+
			'Sec-WebSocket-Accept: '+ response_key +'\r\n\r\n';
		this.socket.write(res, "binary");
	},
	handshake_draft76: function() {
		//ignore wss
	   var host= this.req.headers.host.split(":");
	   var port= host[1];
	   host= host[0];
	   if(!port || port==80) {
		   //ignore wss
	       port= "";
	   }else {
	   	   port= ":"+ port;
	   }
	   var location= "ws://"+host+port+this.req.url;
	   var res= 'HTTP/1.1 101 WebSocket Protocol Handshake\r\n'+
				'Upgrade: WebSocket\r\n'+
				'Connection: Upgrade\r\n'+
				'Sec-WebSocket-Origin: '+this.req.headers.origin+'\r\n'+
				'Sec-WebSocket-Location: '+location;
	   var strkey1= this.req.headers["sec-websocket-key1"],
		   strkey2= this.req.headers["sec-websocket-key2"],
		   numkey1= parseInt(strkey1.replace(/[^\d]/g,""),10),
		   numkey2= parseInt(strkey2.replace(/[^\d]/g,""),10),
		   spaces1= strkey1.replace(/[^\ ]/g, "").length,
		   spaces2= strkey2.replace(/[^\ ]/g, "").length;
	   var hash= Crypto.createHash("md5"),
		   key1= this.pack(parseInt(numkey1 / spaces1)),
		   key2= this.pack(parseInt(numkey2 / spaces2));
	   hash.update(key1);
	   hash.update(key2);
	   hash.update(this.upgradeHead.toString("binary"));
	   res+= "\r\n\r\n";
	   res+= hash.digest("binary");
	   this.socket.write(res, "binary");

	}

}

