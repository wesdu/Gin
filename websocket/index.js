var http= require("http"),
	path= require("path"),
	Crypto= require("crypto"),
	Buffer= require("buffer").Buffer;

var websocket= {
	init: function(ws) {
		this.ws= ws;
	},
	io: function(data) {
		if(this.ws) {
			this.ws.write(data);
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
	//这里只考虑了单个连接的情况
	server.on("upgrade", function(req, socket, upgradeHead) {
		websocket.init(new tinyWebSocketServer(server, req, socket, upgradeHead));
	});
};
var tinyWebSocketServer= function(server, req, socket, upgradeHead) {
	this.server= server;
	this.req= req;
	this.socket= socket;
	this.upgradeHead= upgradeHead; 
	this.init();
};
tinyWebSocketServer.prototype= {
	init: function() {
		 	var ver= this.checkVersion();
			var _this= this;
			switch(ver) {
				case "draft76":
					this.socket.on("data", function(data){
						_this.onData(data);
					});
					this["handshake_"+ver]();
					break;
				case "draft75":
					//todo
					break;
				default:

			}
		  },
	loop: function() {
			  var _this= this;
			  setInterval(function(){
				  _this.write((new Date()).toString());
			  },3000);
		},
	write: function(data) {
			   var byteLen= Buffer.byteLength(data, "utf8"),
			       bytes= new Buffer(byteLen + 2);
			   bytes[0]= 0x00;
			   bytes.write(data, 1, "utf8");
			   bytes[byteLen + 1]= 0xFF;
			   this.socket.write(bytes);
		   },
	onData: function(data) {
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
							this.write(trunk.toString("utf8", 0, trunk.length));
						}else {
							this.frameData= this.frameData||[];
							this.frameData.push(data[i]);
						}
						
					}else if(this.o === 1) {
						//error happend
						this.o= 0;
					}
				}	
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
					return "draft75";
				  },
	pack: function(num) {
			  var result= "";
			  result+= String.fromCharCode(num >> 24 & 0xFF);
			  result+= String.fromCharCode(num >> 16 & 0xFF);
			  result+= String.fromCharCode(num >> 8 & 0xFF);
			  result+= String.fromCharCode(num & 0xFF);
			  return result;
		  },
	handshake_draft75: function() {
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

