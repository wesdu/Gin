var path= require("fs");
var fs= require("fs");
var path= require("path");
var mime= require("./util/fu.js").mime;

var ruleHash= [];
var hostHash= [];

function addRule(ruleData) {
	removeRule(ruleData);
	ruleHash.push(ruleData);
}
function removeRule(ruleData) {
	for(var i=0;i<ruleHash.length;i++) {
		if(ruleHash[i].match == ruleData.match) {
			ruleHash.splice(i,1);
			break;
		}
	}	
}

function updateRule(callback, ruleObj) {
	//ruleHash= ruleObj;
	if(ruleObj.command == "remove") {
		removeRule(ruleObj.data);
	}else if(ruleObj.command == "add") {
		addRule(ruleObj.data);
	}
	dumpRule(callback);
}
function dumpRule(callback) {
	var jsonString= JSON.stringify(ruleHash, null, 4);
	console.info(jsonString);
	var fd= fs.openSync(__dirname + "/script/rule.yaml", "w")
	var code= fs.writeSync(fd, jsonString);
	if(code) {
		callback();
	}
}
function updateHost(callback, hostObj) {
	
}
function dumpHost(callback) {
	var jsonString= JSON.stringify(hostHash, null, 4);
	
	var code= fs.writeSync(__dirname + "/script/host.yaml", jsonString);
	if(code) {
		callback();
	}
}
function getAll(callback) {
	try {
		var ruleString= fs.readFileSync(__dirname + "/script/rule.yaml").toString("utf8");
		ruleHash= JSON.parse(ruleString);
	}catch(e) {
		console.info("getAll", e);
	}
	if(callback) {
		callback({
			ruleData:ruleHash
		});
	}
}
function file2string(filePath) {
	var ext= path.extname(filePath).slice(1);
	var result= "";
	if(ext == "qzmin") {
		var qzmin= JSON.parse(fs.readFileSync(filePath).toString("utf8"));
		var fileArray= qzmin.projects[0].include;
		console.info(fileArray);
		fileArray.map(function(file) {
			console.info(filePath, file);
			var absolutePath= path.resolve(path.dirname(filePath), file);
			result += fs.readFileSync(absolutePath).toString("utf8");
		});
	}else {
		result += fs.readFileSync(filePath).toString("utf8");
	}
	var obj= {
		type: mime.lookupExtension("."+ext, "text/html"),
		content: result
	}
	return obj;
};
// return file content string
function checkRule(url) {
	var result;
	ruleHash.some(function(item, index, all){
		var match= item.match;
		var filePath= item.filePath;
		console.info(url, match);
		if(match.slice(0,4).toLowerCase() == "reg:") {
			var testCase= RegExp(match.slice(4));
			if(testCase.test(url)) {
				return (result=file2string(filePath));
			}
		}else {
			if(url.indexOf(match) != -1) {
				return (result=file2string(filePath));
			}
		}
	});
	return result;
}

getAll();

module.exports= {
	updateHost: updateHost,
	updateRule: updateRule,
	getAll: getAll,
	checkRule: checkRule
}