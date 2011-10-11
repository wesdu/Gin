var path= require("path");
var fs= require("fs");
/*
var files= {
	directory: "/usr/bin"
	filesList: [
		{
			name: "node",
			type: "file",
		},
		{
			name: "xxx",
			type: "directory"
		}
	]
}
*/
var photoType= "|jpg|jpeg|gif|png|bmp|";
var isPhoto= function(name) {
	name= "|" + path.extname(name).slice(1) + "|";
	return name!="||" && photoType.indexOf(name) != -1;
};
var explorer= function(directory, callback) {
	var result={};
	result.directory= directory;
	result.filesList= [];
	fs.readdir(directory, function(err, data){
		if(!err) {
			for(var i=0;i<data.length;i++) {
				var fullPath= path.resolve(directory, data[i]);
				var stats= null;
				try {
					stats= fs.statSync(fullPath);
				}catch(e) {
					
				}
				if(stats) {
					if(stats.isDirectory()) {
						var item= {
							name: data[i],
							type: "directory"
						};
					
						item.key= fullPath + item.type;
						result.filesList.push(item);
					
					}else if(stats.isFile()) {
						if(isPhoto(data[i])) {
							var item= {
								name: data[i],
								type: "photo"
							};
						}else {
							var item= {
								name: data[i],
								type: "file"
							};
						}
					
						item.key= fullPath + item.type;
						result.filesList.push(item);
					}
				}
			}
			callback(result);
			
		}
	})
};

module.exports= {
	explor: function(callback, param) {
		if(param.push) {
			param= path.resolve.apply(path, param);
		}
		explorer(param, callback)
	}
};