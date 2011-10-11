var config= {
	http_server_port: 8880,
	https_server_port: 8443,
	proxy_server_port: 8833,
	frontend_server_port: 8080	
};
if(typeof module != "undefined") {
	module.exports?(module.exports= config):null;
}
