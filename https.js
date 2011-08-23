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

var options = {
  key: fs.readFileSync('./d-key.pem'),
  cert: fs.readFileSync('./d-cert.pem')
};
https.createServer(options, function (req, res) {
	//console.info(req);
	//console.info(req.headers);

	var log= function(a,b,c) {
		if(headers.host== "github.com")
			console.info(a,b);
	}
	
	
	//res.resume();
	var headers= req.headers;
	delete headers["accept-encoding"];
	var options = {
	  	host: req.headers.host,
	  	path: req.url,
	  	method: req.method,
		headers: headers
	};
	log(options);
	//client post
	req.on("data", function(d) {
		log("req", d.toString());
		backEnd.write(d);
	});
	req.on("end", function() {
		backEnd.end();
	});
	var backEnd= https.request(options, function(serverResponse) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		//res.setEncoding('utf8');
		//serverResponse.setNoDelay();
		var headers= serverResponse.headers;
		if(headers) {
			for(var k in headers) {
				res.setHeader(k, headers[k]);	
			}
		}
		res.writeHead(serverResponse.statusCode);		

		serverResponse.on('data', function (chunk) {
			log("chunk", chunk.toString());
			res.write(chunk);
		});
		
		serverResponse.on('end', function() {
			res.end();
		});


	});
	
	
	/*
	https.get({ host: 'github.com', path: '/' }, function(r) {  
		r.on('data', function(d) {
			res.write(d);
		});
		r.on('end', function() {
			res.end();
		});
	});
	*/

}).on("connection", function(client) {
	client.write(new Buffer("HTTP/1.1 200 Connection established\r\nConnection: close\r\n\r\n"));
}).listen(8433);
console.info("https server listening on port 8433");

