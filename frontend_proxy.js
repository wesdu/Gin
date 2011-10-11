var net = require('net');
var sys = require('sys');
var fs = require('fs');
var websocket= require('./websocket');
var webserver= require('./webserver');
var tls= require("tls");
var dns= require('dns');
var spawn = require('child_process').spawn;
var Browser= require('./browser').Browser;
var http_server= require("./http-http");
var https_server= require("./net-https");
var config= require("./config.js");
var Asyn= require("./util/asyn.js").Asyn;
var channel= require("./util/channel.js");

//在本地创建一个server监听本地local_port端口
var proxy= net.createServer(function (client)
{
    //首先监听浏览器的数据发送事件，直到收到的数据包含完整的http请求头
    var buffer = new Buffer(0);
	
	client.setNoDelay(true);
	client.on('error', function(){

	});
    client.on('data',function(data)
    {
		buffer = buffer_add(buffer, data);
        if (buffer_find_body(buffer) == -1) return;
        var req = parse_request(buffer, client);
        if (req === false) return;
		client.pause();	
		client.removeAllListeners('data');
        relay_connection(req);
    });
    function relay_connection(req)
    {
		var connCallBack= function() {
			client.on("data", function(data){
				server.write(data);
			});
			server.on("data", function(data){
				try {
					client.write(data);
				}catch(e) {
					server.removeAllListeners("data");
					console.info("ooops");
				}
			});
			server.on("end", function() {
				client.end();
			});
			client.on("end", function() {
			});
			client.resume();
			if (req.method == 'CONNECT') {
				//server.setNoDelay(true);
			}
			else {
				//输出修改后的请求头
				server.write(buffer);
			}
		};	
		//建立到目标服务器的连接
		if(req.method == "CONNECT") {
			var server = net.createConnection(config.https_server_port, "localhost", connCallBack);
		}else {
			var server = net.createConnection(config.http_server_port, "localhost", connCallBack);
		}
    }
});
//proxy.maxConnections= 10000;
proxy.listen(config.proxy_server_port);

sys.log('Proxy server running on localhost:'+config.proxy_server_port);



if(process.argv[2]!="-debug")	{
	//处理各种错误
	process.on('uncaughtException', function(err)	{
    	console.log("err",err);
	});
}else {
	sys.log("debug mode");
}





/**
* 从请求头部取得请求详细信息
* 如果是 CONNECT 方法，那么会返回 { method,host,port,httpVersion}
* 如果是 GET/POST 方法，那么返回 { metod,host,port,path,httpVersion}
*/
function parse_request(buffer) {
    //sys.log(buffer.toString());
	var s = buffer.toString('utf8');
    var method = s.split('\n')[0].match(/^([A-Z]+)\s/)[1];
    if (method == 'CONNECT')
    {
        var arr = s.match(/^([A-Z]+)\s([^\:\s]+)\:(\d+)\sHTTP\/(\d\.\d)/);
        if (arr && arr[1] && arr[2] && arr[3] && arr[4])
            return { method: arr[1], host:arr[2], port:arr[3],httpVersion:arr[4] };
    }
    else
    {
        var arr = s.match(/^([A-Z]+)\s([^\s]+)\sHTTP\/(\d\.\d)/);
        if (arr && arr[1] && arr[2] && arr[3]) {
            var host = s.match(/Host\:\s+([^\n\s\r]+)/)[1];
            if (host) {
                var _p = host.split(':',2);
                return { method: arr[1], host:_p[0], port:_p[1]?_p[1]:80, path: arr[2],httpVersion:arr[3] };
            }
        }
    }
    return false;
}

/**
* 两个buffer对象加起来
*/
function buffer_add(buf1,buf2)
{
    var re = new Buffer(buf1.length + buf2.length);
    buf1.copy(re);
    buf2.copy(re,buf1.length);
    return re;
}

/**
* 从缓存中找到头部结束标记("\r\n\r\n")的位置
*/
function buffer_find_body(b)
{
    for(var i=0,len=b.length-3;i<len;i++)
    {
        if (b[i] == 0x0d && b[i+1] == 0x0a && b[i+2] == 0x0d && b[i+3] == 0x0a)
        {
            return i+4;
        }
    }
    return -1;
}

//duplicate config.js to static file for front end
spawn('cp', ['./config.js', './public']);

webserver.router("/", function(req, res) {
	webserver.staticHandler("/gin.html", req, res);
});
websocket.extend(webserver).listen(config.frontend_server_port);


