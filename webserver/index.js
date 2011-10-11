#!/bin/node
var createServer= require("http").createServer;
var url= require("url");
var sys= require("sys");
var Buffer= require
var path= require("path");
var fs= require("fs");
var Buffer= require("buffer").Buffer;
var httpserver= exports;
var mime= require("../util/fu.js").mime;


var FileHash= {};
var RouterHash= {};
//静态文件目录
var publicPath= path.resolve(__dirname,"../public");

var _server= createServer(function(req, res){
	var target= url.parse(req.url).pathname;
	var handlers= [staticHandler,customHandler];
	handlers.some(function(handler) {
		return handler.call(httpserver, target, req, res);
	});
});
httpserver.router= function(path, func) {
	RouterHash[path]= func;
};
httpserver.on= function() {
	_server.on.apply(_server, Array.prototype.concat.apply([],arguments));
};
httpserver.listen = function (port, host) {
  _server.listen(port, host);
  sys.log("front-end UI server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};
var customHandler= function(target, req, res) {
	var func;
	if(func= RouterHash[target]) {
		return func(req, res);
	}
};
var staticHandler= function(target, req, res) {
	var body;
	if(body= FileHash[target]) {
		var content_type = mime.lookupExtension(path.extname(target));
   		var headers = {
		    "Content-Length": body.length,
			"Content-Type": content_type
        };
		res.writeHead(200, headers);
	    res.end(body);
		return true;
	}
};
httpserver.staticHandler= staticHandler;

var loadPublicFiles= function(_path) {
	var files= fs.readdirSync(_path);
	for(var i=0;i<files.length;i++) {
		var joinPath= path.resolve(_path, files[i]);
		var stat= fs.statSync(joinPath);
		if(stat.isFile()) {
			console.info("file:", joinPath);
			var data= fs.readFileSync(joinPath);
			var key= joinPath.substring(publicPath.length);
			FileHash[key]= data;
			(function(p, k){
				var joinPath= p;
				var key= k;
				//hot loading
				fs.watchFile(joinPath, function (curr, prev) {
					if(curr.mtime!=prev.mtime) {
						var data= fs.readFileSync(joinPath);
						FileHash[key]= data;
					}
				});
			})(joinPath, key);		
		}else if(stat.isDirectory()) {
			loadPublicFiles(joinPath);
		}
	}
};

console.info("loading static files to memory...");
loadPublicFiles(publicPath);
console.info("loading static files to memory finished.");






