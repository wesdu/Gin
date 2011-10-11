var net = require('net');
var sys = require('sys');
var fs = require('fs');
var events = require('events');
var websocket= require('./websocket');
var webserver= require('./webserver');
var _https= require('./https');
var tls= require("tls");
var dns= require('dns');
var spawn = require('child_process').spawn;
var local_port = 8833;

var routerlist = [];
//检查匹配规则
var routerFile= './router.yaml';
fs.watchFile(routerFile, function(c,p) { update_router_rules(); });
function update_router_rules() {
	routerlist = fs.readFileSync(routerFile).toString().split('\n')
			  .filter(function(rx) { return rx.length })
			  .map(function(rx) { 
				  rx= rx.split(" ");
				  return {
				      r: RegExp(rx[0]),
				  	  f: rx[1]
				  } 
			  });
}
update_router_rules();
function check_rules(url) {
	for(var i in routerlist) {
		if(routerlist[i].r.test(url)) {
			return fs.readFileSync('./'+routerlist[i].f).toString();
		}
	}
	return false;
}
	 	//var html= check_rules(req.host+req.path);
		/*
		//如果命中替换规则
		if(html) {
			responseHeader= new Buffer(['HTTP/1.1 200 OK\r\n',
					'Expires: Fri, 25 May 2010 17:49:45 GMT\r\n',
					'Cache-Control: no-cache\r\n',
					'Content-Type: text/html; charset=UTF-8\r\n',
					'Connection: close\r\n\r\n'].join(''));
			client.write(responseHeader);
			responseHeader= responseHeader.toString("utf8");
			responseBody= html;
			client.resume();
			client.write(html);
			client.end();
		}else {
		*/
function unzip(header, callback) {
	var body= new Buffer(0);
	var gunzip = spawn('gunzip', ['-c']);
	gunzip.stdout.on('data', function(data){
		body= header_add(body, data);
	});
	gunzip.on('exit', function(code) {
		if(callback) {
			callback(body);
		}
	});
    gunzip.stdin.encoding = 'binary';    
    gunzip.stdin.end(header);
}
//在本地创建一个server监听本地local_port端口
var proxy= net.createServer(function (client)
{
    //首先监听浏览器的数据发送事件，直到收到的数据包含完整的http请求头
	console.info("socket on");
	client.setNoDelay(true);
    client.on('data',function(trunk) {
		decoder.data(trunk, false, client);	
	});
	client.on("end", function() {
		decoder.flush();	
	});

});
proxy.listen(local_port);
console.log('Proxy server running at localhost:'+local_port);

//处理各种错误
/*
process.on('uncaughtException', function(err)
{
    console.log("err",err);
});
*/





/**
* 从请求头部取得请求详细信息
* 如果是 CONNECT 方法，那么会返回 { method,host,port,httpVersion}
* 如果是 GET/POST 方法，那么返回 { metod,host,port,path,httpVersion}
*/
function parse_request(header) {
    //sys.log(header.toString());
}
function parse_response(header) {
	var s = header.toString('utf8');
	var arr = s.match(/^HTTP\/\d\.\d\s(\d{3})/);
	if (arr && arr[1]) {
		return {code: arr[1]};
	}
    return false;
}
function ifGzip(headString) {
	return headString.indexOf("gzip") != -1;
}


/**
* 两个header对象加起来
*/
function buffer_add(buf1,buf2)
{
    var b = new Buffer(buf1.length + buf2.length);
    buf1.copy(b);
    buf2.copy(b, buf1.length);
    return b;
}

//The Decoder
var Decoder= (function() {
	var _request_cache= new Buffer(0),
		reqSeed= 0;
	//trunk in but not emit
	//trunk in
	var _websocketIO= function(type,data) {
		websocket.io({
			seq: reqSeed,
			type: type,
			data: data
		});
	};
	var flush= function() {
		if(_request_cache) {
			_websocketIO("postbody", _request_cache);
		}
	}
	var content_length= 0;
	var _detect= function(s) {
		if(content_length && _request_cache.length >= content_length) {
			
		}
		var match= s.match(/^([A-Z]+)\s([^\s]+)\sHTTP\/(\d\.\d)\r\n/);
		console.info("match", match);
		var httpsMatch= s.match(/^([A-Z]+)\s([^\:\s]+)\:(\d+)\sHTTP\/(\d\.\d)/);
		var tail= '\r\n\r\n';
		var _endSplit= s.split(tail);
		console.info("end", _endSplit);
		if(_endSplit.length > 1) {
			_endSplit.forEach(function(item, i) {
				
			});
		}
		if(match && _endSplit.length > 1) {
			var head= match[0],
				method= match[1],
				path= match[2],
				version= match[3];
			var _headSplit= s.split(head);
			var afterHead= _headSplit[1],
				beforeHead= _headSplit[0];
			var headConent= afterHead.split(tail)[0]
					.replace('Proxy-Connection: keep-alive','Connection: keep-alive');
				head= head.replace(/(http\:\/\/[^\/]*\/)(.* HTTP\/1\.1)/,"/$2");
			var host = headConent.match(/Host\:\s+([^\n\s\r]+)/)[1].split(":");
			content_length= headConent.match(/Content-Length\:\s+(\d+)/);
			content_length= content_length?content_length[1]||0:0;
			var afterTail= afterHead.split(tail)[1];
			//post body
			if(beforeHead) {
				_websocketIO("postbody", beforeHead);
			}
			_websocketIO("request", (head+headConent+tail).toString("utf8"));
			_request_cache= new Buffer(afterTail);
			if(content_length && _request_cache.length >= content_length) {
																				
			}
			reqSeed++;
			console.info("detect");
			_request_cache= new Buffer(0);
			return {
				method: method,
				host: host[0],
				port: host[1]||80,
				version: version,
				bin: new Buffer(beforeHead+head+headConent+tail+afterTail, "utf8")
			}
		}else if(httpsMatch && _endSplit.length > 1) {
			return { 
				method: httpMatch[1],
				host: httpMatch[2],
				port: httpMatch[3],
				version: httpMatch[4],
			}
		}
	};
	var data= function(trunk, noEmit, client, callback) {
		_request_cache= buffer_add(_request_cache, trunk);
		console.info(_request_cache.toString("utf8"))
		var request= _detect(_request_cache.toString("utf8"));
		if(!noEmit && request ) {
			httpStart(request, client);
		}
	};

	var f= function() {
		//events.EventEmitter.call(this);
	};	
	//sys.inherits(f, events.EventEmitter);
	f.prototype.data= data;
	f.prototype.flush= flush;
	return f;
})();
var decoder= new Decoder();
var httpStart= function(req,client) {
	//start connect to server
	client.pause();
	client.removeAllListeners('data');

	var connCallBack= function() {
		client.on("data", function(trunk){
			//replace header
			if(req.method!= "CONNECT") {
				trunk= new Buffer(trunk.toString("utf8").replace('Proxy-Connection: keep-alive','Connection: keep-alive')
					.replace(/(http\:\/\/[^\/]*\/)(.* HTTP\/1\.1)/,"/$2"), "utf8");
			};
			server.write(trunk);
		});
		server.on("data", function(data){
			try {
				client.write(data);
			}catch(e) {
				console.info("ooops")
				server.removeAllListeners("data");
				client.end();
			}
		});
		client.resume();
		server.on("end", function() {
			client.end();
		});
		if (req.method == 'CONNECT') {
			server.setNoDelay(true);
		}
		else {
			//输出修改后的请求头
			server.setNoDelay(true);
			server.setKeepAlive(true);
			server.write(req.bin);	
		}
		
	};
	//建立到目标服务器的连接
	if(req.method == "CONNECT") {
		var server = net.createConnection(8433,"localhost", connCallBack);
	}else {
		console.info("conn", req.port, req.host);
		var server = net.createConnection(req.port,req.host, connCallBack);
	}

		
};

webserver.router("/", function(req, res) {
	webserver.staticHandler("/gin.html", req, res);
});
websocket.extend(webserver).listen(8080);
/*
process.on('uncaughtException', function(err)
{
    console.log("err",err);
});
*/

