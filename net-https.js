var https= require("https");
var net= require("net");
var http= require("http");
var path= require("path");
var fs= require("fs");
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
var options = {
  key: fs.readFileSync(path.resolve(__dirname,'./d-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname,'./d-cert.pem'))
};
var proxy= https.createServer(options, function (req, res) {
	var ResponseBufferString= "";
	var ResponseBuffer= new Buffer(0);
	var browser= new Browser();
    var ip = req.connection.remoteAddress;
    sys.log(ip + ": " + req.method + " " + req.url);
    var host = req.headers['host'].split(':');
	
	var headers= req.headers;
	var options = {
	  	host: req.headers.host,
	  	path: req.url,
	  	method: req.method,
		headers: upperFirstLetter(headers)
	};
	requestDetail[browser.getSeq()]= {};
	requestDetail[browser.getSeq()].request= {
		header: headers,
		body: "",
	}
	var file= script.checkRule(options.host + options.path);
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
		res.writeHead(statusCode, headers);
		res.end(new Buffer(file.content, file.encode), 'binary');
	}else {
		req.on("data", function(d) {
			backEnd.write(d);
		});
		req.on("end", function() {
			backEnd.end();
		});
		var backEnd= https.request(options, function(serverResponse) {
			browser.io({
				//method: options.method,
				//host: options.host,
				//path: options.path,
				address: serverResponse.client.socket.remoteAddress,
				code: serverResponse.statusCode
			});
			res.connection.setNoDelay(true);
			res.writeHead(serverResponse.statusCode, serverResponse.headers);		
			serverResponse.on('data', function (chunk) {
				ResponseBuffer= buffer_add(ResponseBuffer, chunk);
	            ResponseBufferString += chunk.toString("utf8");
				res.write(chunk);
			});
			serverResponse.on('end', function() {
				var resData= requestDetail[browser.getSeq()].response= {};
				if(serverResponse.headers["content-encoding"] == "gzip") {
					unzip(ResponseBuffer, function(buffer) {
						resData.body= buffer.toString("utf8");
					});
				}else {
					resData.body= ResponseBufferString;
				}
				resData.header= serverResponse.headers;
				res.end();
			});
			serverResponse.on("error", function() {
			});
		});
	}
	browser.io({
		method: options.method,
		host: options.host,
		path: options.path
	});
})
proxy.on("connection", function(client) {
	client.write(new Buffer("HTTP/1.1 200 Connection established\r\nConnection: keep-alive\r\n\r\n"));
});
proxy.listen(config.https_server_port);
sys.log("Starting the https backend proxy server on port "+ config.https_server_port);

module.exports= {
	getDetail: function(seq) {
		return requestDetail[seq];
	}
}
