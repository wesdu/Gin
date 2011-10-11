var http= require("http");
var sys= require("sys");
var config= require("./config");
var Browser= require("./browser").Browser;
var unzip= require("./util/command.js").unzip;
var script= require("./script.js");

var requestDetail= {};

function buffer_add(buf1,buf2)
{
    var re = new Buffer(buf1.length + buf2.length);
    buf1.copy(re);
    buf2.copy(re,buf1.length);
    return re;
}

function upperFirstLetter(headerObj) {
	var result= {};
	for(var k in headerObj) {
		var v= headerObj[k];
		result[k.replace(/(^|\-)(\w)/g, function(letter){
          return letter.toUpperCase();
        })]= v;
	}
	return result;
}
function server_cb(request, response) {
	var ResponseBufferString= "";
	var ResponseBuffer= new Buffer(0);
	var browser= new Browser();
    var ip = request.connection.remoteAddress;
    sys.log(ip + ": " + request.method + " " + request.url);
    var host = request.headers['host'].split(':');
	var headers= upperFirstLetter(request.headers);
	if(headers["Proxy-Connection"]) {
		headers["Connection"]= headers["Proxy-Connection"];
		delete headers["Proxy-Connection"];
	}
	var options= {
		port: host[1] || 80,
		host: host[0],
		method: request.method, 
		path: request.url.replace(/(http\:\/\/[^\/]*\/)(.*)/,"/$2"), 
		headers: headers 
	};
	requestDetail[browser.getSeq()]= {};
	requestDetail[browser.getSeq()].request= {
		header: headers,
		body: "",
	}
	//if there's a replace rule
	var file= script.checkRule(request.url);
	if(file) {
		var statusCode= 200;
		browser.io({
			//method: options.method,
			//host: options.host,
			//path: options.path,
			address: "",
			code: statusCode
		});
		var resData= requestDetail[browser.getSeq()].response= {};
		var headers= {
				'Expires': 'Fri, 25 May 2010 17:49:45 GMT',
				'Cache-Control': 'no-cache',
				'Content-Type': file.type+'; charset=UTF-8',
				'Connection': 'close'
		};
		resData.header= headers;
		resData.body= file.content;
		//send
		response.writeHead(statusCode, headers);
		response.end(new Buffer(file.content, file.encode), 'binary');
	}else {
		var proxy_request = http.request(options);
		proxy_request.end();
		proxy_request.addListener('response', function(proxy_response) {
			browser.io({
				//method: options.method,
				//host: options.host,
				//path: options.path,
				address: proxy_response.client.remoteAddress,
				code: proxy_response.statusCode
			});
	        proxy_response.addListener('data', function(chunk) {
				ResponseBuffer= buffer_add(ResponseBuffer, chunk);
	            ResponseBufferString += chunk.toString("utf8");
				response.write(chunk, 'binary');
	        });
	        proxy_response.addListener('end', function() {
				//unzip(new Buffer(ResponseBufferString))
				var resData= requestDetail[browser.getSeq()].response= {};
				if(proxy_response.headers["content-encoding"] == "gzip") {
					unzip(ResponseBuffer, function(buffer) {
						resData.body= buffer.toString("utf8");
					});
				}else {
					resData.body= ResponseBufferString;
				}
				resData.header= proxy_response.headers;
	            response.end();
	        });
	        response.writeHead(proxy_response.statusCode, proxy_response.headers);
	    });
	    request.addListener('data', function(chunk) {
			console.info("request", chunk.toString("utf8"));
			requestDetail[browser.getSeq()].request.body += chunk.toString();
	        proxy_request.write(chunk, 'binary');
	    });
	    request.addListener('end', function() {
	        proxy_request.end();
	    });
	}
	browser.io({
		method: options.method,
		host: options.host,
		path: options.path
	});

}
sys.log("Starting the http backend proxy server on port " + config.http_server_port);
http.createServer(server_cb).listen(config.http_server_port);

module.exports= {
	getDetail: function(seq) {
		return requestDetail[seq];
	}
}
