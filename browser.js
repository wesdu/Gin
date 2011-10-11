var websocket= require('./websocket');

var seq= 0;
var Browser= function() {
	this.init.call(this, seq);
	seq++;
}
Browser.prototype= {
	init: function(seq) {
		this.seq= seq;
	},
	io: function(obj) {
		obj.seq= this.seq;
		var result= JSON.stringify({
			type: "flow",
			result: obj
		});
		console.info(result);
		websocket.io(result);
	},
	getSeq: function() {
		return this.seq;
	}
};

module.exports= {
	Browser: Browser
};
