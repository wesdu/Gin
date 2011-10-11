var https= require("https");
var net= require("net");
var http= require("http");
var fs = require('fs');
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
  key: fs.readFileSync('./d-key.pem'),
  cert: fs.readFileSync('./d-cert.pem')
};
var proxy= https.createServer(options, function (req, res) {
	var headers= req.headers;
	delete headers["accept-encoding"];
	var options = {
	  	host: req.headers.host,
	  	path: req.url,
	  	method: req.method,
		headers: upperFirstLetter(headers)
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
			res.write(chunk);
		});
		serverResponse.on('end', function() {
			res.end();
		});
		serverResponse.on("error", function() {
		});
	});
})
proxy.on("connection", function(client) {
	client.write(new Buffer("HTTP/1.1 200 Connection established\r\nConnection: keep-alive\r\n\r\n"));
});
proxy.listen(8433);
console.info("Starting the https backend proxy server on port 8433");

