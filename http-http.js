var https= require("https");
var net= require("net");
var http= require("http");
/*
https.get({ host: 'github.com', path: '/' }, function(res, req) {
  res.on('data', function(d) {
    //process.stdout.write(d);
  });
  console.info(res.connection.);

}).on('error', function(e) {
  console.error(e);
};
*/
var fs = require('fs');

http.createServer(function (req, res) {
	//console.info(req);
	//console.info(req.headers);
	//res.connection.setKeepAlive(true);
	//res.connection.setNoDelay();
	//req.connection.setNoDelay(true);
	console.info("url", req.url);
	var log= function(a,b,c) {
		if(host==("ptlogin2.qq.com"))
			console.info(a,b);
	}
	
	
	//res.resume();
	var headers= req.headers;
	//delete headers["accept-encoding"];
	headers["connection"]= headers["proxy-connection"];
	delete headers["proxy-connection"];
	//delete headers["referer"];
	//delete headers["connection"];
	var host= req.headers.host;
	var url= req.url;
	var path= url.substr(url.indexOf(host)+host.length);
	var options = {
	  	host: host,
	  	path: path,
	  	method: req.method,
		headers: headers,
		agent: false
	};
	log(options);
	req.on("data", function(d) {
		log("req", d.toString());
		backEnd.write(d);
	});
	req.on("end", function() {
		backEnd.end();
	});
	var backEnd= http.request(options, function(serverResponse) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		//serverResponse.setEncoding('utf8');
		res.writeHead(serverResponse.statusCode, serverResponse.headers);		
		
		serverResponse.on('data', function (chunk) {
			log("chunk");
			res.write(chunk);
		});
		
		serverResponse.on('end', function() {
			res.end();
		});


	});
	backEnd.on("error", function(err,err){ console.info(err,err)});

}).listen(8888);
console.info("https server listening on port 8888");

