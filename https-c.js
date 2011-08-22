var https = require('https');
var net= require('net');

var options = {
  host: 'localhost',
  port: 8433,
  path: '/',
  method: 'GET'
};
	console.info("connect");
	var req = https.request(options, function(res) {
	  //console.log("statusCode: ", res.statusCode);
	  //console.log("headers: ", res.headers);

	  res.on('data', function(d) {
		process.stdout.write(d);
	  });
	});
	req.end();

