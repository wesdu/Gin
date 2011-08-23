var net = require('net');
var sys = require('sys');
var fs = require('fs');
var websocket= require('./websocket');
var webserver= require('./webserver');
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
function unzip(buffer, callback) {
	var body= new Buffer(0);
	var gunzip = spawn('gunzip', ['-c']);
	gunzip.stdout.on('data', function(data){
		body= buffer_add(body, data);
	});
	gunzip.on('exit', function(code) {
		if(callback) {
			callback(body);
		}
	});
    gunzip.stdin.encoding = 'binary';    
    gunzip.stdin.end(buffer);
}
var reqNo= 0;
//在本地创建一个server监听本地local_port端口
var sss= net.createServer(function (client)
{
    //首先监听浏览器的数据发送事件，直到收到的数据包含完整的http请求头
    var buffer = new Buffer(0);
	var response = new Buffer(0);
	var seq, req, requestHeader, responseHeader, responseBody;
	
	client.setNoDelay(true);
	client.on('error', function(){
		//client.end();

	});
    client.on('data',function(data)
    {
		buffer = buffer_add(buffer, data);
		console.info("first", data);
        if (buffer_find_body(buffer) == -1) return;
        req = parse_request(buffer, client);
        if (req === false) return;
		seq= ++reqNo;
		req.seq= seq;
		client.pause();	
		client.removeAllListeners('data');
		websocket.io(JSON.stringify(req));
        relay_connection(req);
    });
    function relay_connection(req)
    {
        //如果请求不是CONNECT方法（GET, POST），那么替换掉头部的一些东西
        if (req.method != 'CONNECT')
        {
            //先从buffer中取出头部
            var _body_pos = buffer_find_body(buffer);
            if (_body_pos < 0) _body_pos = buffer.length;
            var header = buffer.slice(0,_body_pos).toString('utf8');
            //替换connection头
			/*
            header = header.replace(/(proxy\-)?connection\:.+\r\n/ig,'')
                    .replace(/Keep\-Alive\:.+\r\n/i,'')
					.replace("\r\n",'\r\nConnection: close\r\n');
			*/
			header = header.replace('Proxy-Connection: keep-alive','Connection: keep-alive');
            //替换网址格式(去掉域名部分)
			
            if (req.httpVersion == '1.1')
            {
                var url = req.path.replace(/http\:\/\/[^\/]+/,'');
                if (url.path != url) header = header.replace(req.path,url);
            }
		
            buffer = buffer_add(new Buffer(header,'utf8'),buffer.slice(_body_pos));
        }else {
		}

		requestHeader= buffer.toString();
		
	 	var html= check_rules(req.host+req.path);
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
			//server.setKeepAlive(true)
			var connCallBack= function() {
				console.info("connected!!!");
				var req2,buffer2= new Buffer(0),isKeepAlive;
				client.on("data", function(data){
				   	try {	
						client.setKeepAlive(true);
						server.setKeepAlive(true);
					}catch(e) {
						console.info(e);
					}
					//client.setNoDelay(true);
					//console.info("request", seq, data.toString("utf8"));
					/*
					buffer2 = buffer_add(buffer2, data);
					if (buffer_find_body(buffer2) == -1) return;
					req2 = parse_request(buffer2);
					if (req2 === false) return;
					if (req2.method != 'CONNECT')
					{
						//先从buffer中取出头部
						var _body_pos = buffer_find_body(buffer2);
						if (_body_pos < 0) _body_pos = buffer2.length;
						var header = buffer2.slice(0,_body_pos).toString('utf8');
						//替换connection头
						header = header.replace(/(proxy\-)?connection\:.+\r\n/ig,'')
								.replace(/Keep\-Alive\:.+\r\n/ig,'')
								.replace("\r\n",'\r\nConnection: close\r\n');
						//替换网址格式(去掉域名部分)
						
						if (req2.httpVersion == '1.1')
						{
							var url = req2.path.replace(/http\:\/\/[^\/]+/,'');
							if (url.path != url) header = header.replace(req2.path,url);
						}
					
						var buffer = buffer_add(new Buffer(header,'utf8'),buffer2.slice(_body_pos));
					}
					if(buffer.toString().split("\r\n\r\n").length>2) {
						isKeepAlive= true;
						console.info(seq);
					}
					*/
					if (req.method == 'CONNECT') {
						//字符串化再buffer回来估计导致二进制数据变化了
						buffer2= buffer_add(buffer2, data);
					}else {
						var temp= data.toString("utf8").replace('Proxy-Connection: keep-alive','Connection: keep-alive')
							.replace(/(http\:\/\/[^\/]*\/)(.* HTTP\/1\.1)/,"/$2");
						data= new Buffer(temp, "utf8");
					}
					console.info("request", seq, data);
					server.write(data);
				});
				
				//client.setKeepAlive(true);
				server.on("data", function(data){
					//console.info("response", seq, data.toString());
					//var _body_pos = buffer_find_body(buffer2);
					//buffer2 = buffer_add(buffer2, data);
					//console.info("data",seq,data);
					if(data.toString('utf8').indexOf("Connection: close") != -1) {
						try {
							client.setKeepAlive(false);
							server.setKeepAlive(false);
						}catch(e) {
							console.info(e);
						}
					}
					try {
						client.write(data);
					   	
					}catch(e) {
						console.info("ooops", seq);
						server.removeAllListeners("data");
						client.end();
					}
					//client.end();
					//response= buffer_add(response, data);
				});
				var resHeadObj= {};
				var responseWS= function() {
					resHeadObj.state= "response";
					resHeadObj.seq= seq;
					resHeadObj.head= responseHeader;
					resHeadObj.body= responseBody;
					websocket.io(JSON.stringify(resHeadObj));
				};
				server.on("end", function() {
					var pos= buffer_find_body(response);
					//console.info("end", seq, response.toString())
					/*
					responseHeader= response.slice(0, pos);
					resHeadObj= parse_response(responseHeader);
					responseHeader= responseHeader.toString("utf8");
					if(ifGzip(responseHeader)) {
						unzip(response.slice(pos), function(bin) {
							responseBody= bin.toString("utf8");
							responseWS();
						});
					}else {
						responseBody= response.slice(pos).toString("utf8");
						responseWS();
					}
					*/
					client.end();
					//client.destory();
				});
				client.on("end", function() {
					console.info("client end", seq);
				});
				
				//client.setKeepAlive(true);
				client.resume();
				
				if (req.method == 'CONNECT') {
					//client.write(new Buffer("HTTP/1.1 200 Connection established\r\nConnection: keep-alive\r\n\r\n"));
					//server.write(buffer);
				}
				else {
					//输出修改后的请求头
					console.info("header", seq, buffer.toString("utf8"));
					server.setNoDelay(true);
					server.write(buffer);
				}
				
			};
			var connCallBack2= function() {
				//client.setKeepAlive(true);
				console.info("connected!!!");
				var req2,buffer2= new Buffer(0),isKeepAlive;
				client.on("data", function(data){
					server.write(data);
				});
				server.on("data", function(data){
					try {
						client.write(data);
					   	
					}catch(e) {
						console.info("ooops", seq);
					}
				});
				server.on("end", function() {
					client.end();
				});
				client.on("end", function() {
					console.info("client end", seq);
				});
				client.resume();
				if (req.method == 'CONNECT') {
					//client.write(new Buffer("HTTP/1.1 200 Connection established\r\nConnection: keep-alive\r\n\r\n"));
					//server.write(buffer);
					server.setNoDelay(true);
				}
				else {
					//输出修改后的请求头
					console.info("header", seq, buffer.toString("utf8"))
					server.write(buffer);
				}
			};	
			//建立到目标服务器的连接
			if(req.method == "CONNECT") {
				var server = net.createConnection(8433,"localhost", connCallBack2);
				//var server = net.createConnection(req.port,req.host, connCallBack);	
			}else {
				var server = net.createConnection(req.port,req.host, connCallBack);
				//server = net.createConnection(8880,"localhost", connCallBack);
			}

		}
			
    }
});
sss.maxConnections= 1000;
sss.listen(local_port);

console.log('Proxy server running at localhost:'+local_port);


//处理各种错误

process.on('uncaughtException', function(err)
{
    console.log("err",err);
});





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
function parse_response(buffer) {
	var s = buffer.toString('utf8');
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

webserver.router("/", function(req, res) {
	webserver.staticHandler("/gin.html", req, res);
});
websocket.extend(webserver).listen(80);

