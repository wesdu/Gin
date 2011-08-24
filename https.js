var https= require("https");
var net= require("net");
var http= require("http");
var fs = require('fs');

var options = {
  key: fs.readFileSync('./d-key.pem'),
  cert: fs.readFileSync('./d-cert.pem')
};
https.createServer(options, function (req, res) {
	var headers= req.headers;
	delete headers["accept-encoding"];
	var options = {
	  	host: req.headers.host,
	  	path: req.url,
	  	method: req.method,
		headers: headers
	};
	req.on("data", function(d) {
		backEnd.write(d);
	});
	req.on("end", function() {
		backEnd.end();
	});
	var backEnd= https.request(options, function(serverResponse) {
		res.connection.setNoDelay(true);
		res.writeHead(serverResponse.statusCode, serverResponse.headers);		
		serverResponse.on('data', function (chunk) {
			try {
				res.write(chunk);
			}catch(e) {
			
			}
		});
		serverResponse.on('end', function() {
			res.end();
		});
	});
}).on("connection", function(client) {
	client.write(new Buffer("HTTP/1.1 200 Connection established\r\nConnection: close\r\n\r\n"));
}).listen(8433);
console.info("https server listening on port 8433");

