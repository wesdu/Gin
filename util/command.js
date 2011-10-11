var spawn = require('child_process').spawn;
var config= require("../config.js");
var Asyn= require("./asyn.js").Asyn;

//should be in util.js
function buffer_add(buf1,buf2)
{
    var re = new Buffer(buf1.length + buf2.length);
    buf1.copy(re);
    buf2.copy(re,buf1.length);
    return re;
}

function doCommand(command, options, callback) {
	var data= "";
	var childprocess = spawn(command, options);
	childprocess.stdout.on('data', function(buf){
		data+= buf.toString();
	});
	childprocess.on('exit', function(code) {
		if(callback) {
			callback(data);
		}
	});
    childprocess.stdin.encoding = 'binary';    
    childprocess.stdin.end();
}
//networksetup -getwebproxy AirPort
//networksetup -listnetworkserviceorder

function unzip(buffer, callback) {
	var body= new Buffer(0);
	var gunzip = spawn('gunzip', ['-c']);
	gunzip.stdout.on('data', function(data){
		body= buffer_add(body, data);
	});
	gunzip.on('exit', function(code) {
		if(callback) {
			callback(body);
		}
	});
    gunzip.stdin.encoding = 'binary';    
    gunzip.stdin.end(buffer);
}

var netWorkProxyState= (function(){
	var hasAirPort= false;
	
	var doGetProxyState= function(options, result, next) {
		var bool= 1;
		doCommand("networksetup", options, function(data){
			if(data.indexOf("Error") == -1) {
				hasAirPort= true;
				var datas= data.split("\n");
				var hash= {};
				datas.forEach(function(item){
					hash[item.split(":")[0]]= item.split(": ")[1];
				});
				console.info(hash);
				(hash.Enabled == "No" )? (bool= bool & 0) : null;
				(hash.Port != config.proxy_server_port) ? (bool= bool & 0) : null;
				next(result & bool);
			}else {
				next(result & 1);
			}
		});
	};
	
	var getNetWorkProxyState= function(callback) {
		Asyn(function(next) {
			doGetProxyState(["-getwebproxy", "AirPort"], 1, next);
		}).next(function(data, next) {
			doGetProxyState(["-getsecurewebproxy", "AirPort"], data, next);
		}).	next(function(data, next) {
			doGetProxyState(["-getwebproxy", "Ethernet"], data, next);
		}).	next(function(data, next) {
			doGetProxyState(["-getsecurewebproxy", "Ethernet"], data, next);
		}).next(function(data) {
			//TODO
			
			if(data) {
				console.info("seems ok");
			}else {
				console.info("seems not");
			}
			if(hasAirPort) {
				console.info("has AirPort");
			}
			callback(data);
		}).do();
	};
	
	var doSetProxyState= function(options, next) {
		doCommand("networksetup", options, function(data){
			next(1);
		});
	};
	
	var setNetWorkProxyOn= function(callback) {
		Asyn(function(next) {
			doSetProxyState(["-setwebproxy", "AirPort", "127.0.0.1", config.proxy_server_port], next);
		}).next(function(data, next) {
			doSetProxyState(["-setsecurewebproxy", "AirPort", "127.0.0.1", config.proxy_server_port], next);
		}).	next(function(data, next) {
			doSetProxyState(["-setwebproxy", "Ethernet", "127.0.0.1", config.proxy_server_port], next);
		}).	next(function(data, next) {
			doSetProxyState(["-setsecurewebproxy", "Ethernet", "127.0.0.1", config.proxy_server_port], next);
		}).next(function(data) {
			getNetWorkProxyState(callback);
		}).do();		
	};

	var setNetWorkProxyOff= function(callback) {
		Asyn(function(next) {
			doSetProxyState(["-setwebproxystate", "AirPort", "off"], next);
		}).next(function(data, next) {
			doSetProxyState(["-setsecurewebproxystate", "AirPort", "off"], next);
		}).	next(function(data, next) {
			doSetProxyState(["-setwebproxystate", "Ethernet", "off"], next);
		}).	next(function(data, next) {
			doSetProxyState(["-setsecurewebproxystate", "Ethernet", "off"], next);
		}).next(function(data) {
			getNetWorkProxyState(callback);
		}).do();
	};

	return {
		get: getNetWorkProxyState,
		on: setNetWorkProxyOn,
		off: setNetWorkProxyOff
	}
})();



module.exports= {
	getProxy: netWorkProxyState.get,
	proxyOn: netWorkProxyState.on,
	proxyOff: netWorkProxyState.off,
	unzip: unzip
};


switch (process.argv[2]) {
	case "-getproxy":
		netWorkProxyState.get();
		break;
	case "-proxyon":
		netWorkProxyState.on(); 
		break;
	case "-proxyoff":
		netWorkProxyState.off();
		break;
}