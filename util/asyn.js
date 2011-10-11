var Asyn= function(func) {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee(func);
	}
	this._callback= [];
	if(func) {
		this._callback.push(func);
	}
	this._state= "init";
};

Asyn.prototype= {
	next: function(func) {
		if(this._state=="init" || this._state=="next") {
			this._callback.push(func);
			this._state="next"
		}
		//TODO (new Asyn()).combine().combine().next();
		return this;
	},
	combine: function(func) {
	},
	do: function() {
		var _this= this;
		var next= function(result) {
			var func= _this._callback.shift();
			if(func) {
				result != undefined ?func(result, next):func(next);
			}
		};
		next();
	}
};

module.exports= {
	Asyn: Asyn
}