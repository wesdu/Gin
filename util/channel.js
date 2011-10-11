var emitter= require("./emitter.js");
var command= require("./command.js");
var websocket= require('../websocket');
var http_server= require("../http-http");
var https_server= require("../net-https");
var script= require("../script.js");
var fileExplorer= require("./fileExplorer.js");

var router= function(data) {
	switch(data.type) {
		case "callback":
			doCallback(data);
			break;
		case "on":
			break;
		case "off":
			break;
		default:
			console.info("Sorry?")
	}
};
var callbackHashMap= {
	getProxyState: command.getProxy,
	setProxyOn: command.proxyOn,
	setProxyOff: command.proxyOff,
	requestDetail: function(callback, param) {
		var data= http_server.getDetail(param) || https_server.getDetail(param) ;
		if(data) {
			callback(data);
		}
	},
	updateRule: script.updateRule,
	updateHost: script.updateHost,
	explor: fileExplorer.explor,
	getConfigInitial: script.getAll
}
var doCallback= function(data) {
	var callback= function(result) {
		websocket.io({
			seq: data.seq,
			result: result,
			type: "callback"
		});
	};
	callbackHashMap[data.command]?callbackHashMap[data.command](callback, data.param) : null;
};
emitter.on("websocket", function(data) {
	console.info("get", data);
	try {
		data= JSON.parse(data);
	}catch(e) {
		
	}
	router(data);
});