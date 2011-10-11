	//here the webq_framework
	/**
	 * @namespace q
	 */
(function(){
	var q={};
	//mvc
	q.model= {},
	q.view= {},
	q.controller= {},
	q.collection= {};
	var $D = Jet().dom,
		$E = Jet().event,
		$S = Jet().string,
		$F = {};
	$S.template=  function(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
          cache[str] = cache[str] ||
            template(document.getElementById(str).innerHTML) :
          
          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
            
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
            
            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',(typeof $1==\"undefined\"?\"\":$1),'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");
        
        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
	$F.each= function(object,func) {
		var result;
		for(var k in object) {
			if(object.hasOwnProperty(k)) {
				if(result=func(k,object[k],object)) {
					return result;
				}
			}
		}
	};
	$F.arrayIndexOf= function(a,elt) {
		var len = a.length;

		var from = Number(arguments[2]) || 0;
		from = (from < 0)
			 ? Math.ceil(from)
			 : Math.floor(from);
		if (from < 0)
		  from += len;

		for (; from < len; from++)
		{
		  if (from in a &&
			  a[from] === elt)
			return from;
		}
		return -1;
	};
	var MicroEvent  = function(){};
	MicroEvent.prototype = {
		bind    : function(event, fct){
			this._events = this._events || {};
			this._events[event] = this._events[event]   || [];
			this._events[event].push(fct);
		},
		unbind  : function(event, fct){
			this._events = this._events || {};
			if( event in this._events === false  )  return;

			this._events[event].splice($F.arrayIndexOf(this._events[event],fct), 1);
		},
		trigger : function(event /* , args... */){
			this._events = this._events || {};
			if( event in this._events === false  )  return;
			for(var i = 0; i < this._events[event].length; i++){
				this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
			}
		}
	};
	MicroEvent.mixin = function(destObject){
		var props   = ['bind', 'unbind', 'trigger'];
		for(var i = 0; i < props.length; i ++){
			destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
		}
	};
	q.view= function(options) {
		this.init(options);
	};
	q.model= function(options) {
		this.init(options);
	};
	q.collection= function(options) {
		this.init(options);
	};
	q.controller= function(options) {
		this.init(options);
	};
	q.view.eventParser= function() {
		this.init();
	};
	/*
	var _findPapa= function(dom,selector) {
		var max=4,id=selector.substr(1),type=selector.charAt(0),fun;

		fun= ({"#":function(dom,id) {
			return dom.id==id;
		},".":function(dom,id){
			return $D.hasClass(dom,id)
		}})[type];

		return function () {
			if(fun(dom,id)) {
				return dom;
			}else if(max>0) {
				max--;
				if(dom.parentNode) {
					dom= dom.parentNode;
				}else {
					max= 0;
				}
				return arguments.callee();
			}
			return null;
		}
	};
	*/
	q.view.eventParser.prototype= {
		init: function() {
			var _this= this;
			this.op= [
				{
					".": function(word,target) {
						return target.className==word;
					},
					"+": function(word,target) {
						return target.getAttribute(word);
					},
					"#": function(word,target) {
						return target.id==word;
					},
					".~": function(word,target) {
						return $D.hasClass(target,word);
					}
				},
				{
					">": function(word,e) {
						var p,wordP,wordS,s;
						s= word.split(">");
						wordP= s[0];
						wordS= s[1];
						//通配符支持
						if( (wordS=="*"?true:_this.match(wordS,e)) && 
						    (p= _this.operate(_this.detectAncestor, wordP, e)())) {//检测符合特征的祖先节点
							return _this.packEvent(e, p);
						}
						return false;
					}
				},
				{
					"!": function(word,e) {
						word= word.substr(1);
						return !_this.match(word,e);
					}
				},
				{
					"&&": function(word,e) {
						var wordL,wordR,s;
						s= word.split("&&");
						wordL= s[0];
						wordR= s.slice(1).join("");
						if(_this.match(wordL,e)) {
							if(wordR.indexOf("&&")==-1) {
								return _this.match(wordR,e);
							}else {
								return arguments.callee(wordR,e);
							}
						}
						return false;
					}
				}
			];
			//优先级从下往上递减,对应于this.op
			this.op2Level= [
			    [".","#","+",".~"],//第一级操作符
    			">",//第二级操作符
    			"!",//第三级操作符
    			"&&"//第四级操作符
			];
		},
		//寻找符合特征的祖先节点
		detectAncestor: function(word, e, func) {
			//if over 5...sorry.
			//I think you should never touch the limit.
			var max=5;
			var target= e.target;
			return function () {
				if(func(word,target)) {
					return target;
				}else if(max>0) {
					max--;
					if(target.parentNode) {
						target= target.parentNode;
					}else {
						max= 0;
					}
					return arguments.callee();
				}
				return null;
			}
		},
		//用于对target跟特征的匹配
		//因为e.target并不总是我们期待的target
		detect: function(word, e, func) {
			var target= e.target;
			if(target.nodeType!=1) {//ipad下总是发生
				target= target.parentNode;
				if(func(word,target)) {
					return this.packEvent(e,target);
				}
			}else {
				return func(word,target);
			}
			return false;
		},
		packEvent: function(e, target) {
			return [true,
					{
						target: target,
						oTarget: e.target,
						stopPropagation: function(){
						   e.stopPropagation();
						},
						preventDefault: function(){
							e.preventDefault();
						},
						pageX: e.pageX,
						pageY: e.pageY
					}
			];
		},
		operate: function(func,word,e) {
			var p,
				i=3;//("..#").length=3 由长至短检查是否有对应的第一级操作符
			while(i>0) {
				if(p= this.op[0][word.substr(0,i)]) {
					var result= null;
					if(result= func(word.substr(i),e,p)) {
						return result;
					}
				}
				i--;
			}
			return false;
		},
		//按照层级进行匹配
		match: function(word,e) {
			var p;
			//level > 0
			for(var len=this.op2Level.length;len>0;len--) { //这里稍耗性能
				var sig= this.op2Level[len];
				if(word.indexOf(sig) != -1 ) {
					return this.op[len][sig](word,e,p);
				}
			}
			//level 0
			return this.operate(this.detect,word,e);
		},
		//拆解并列条件（并列条件以","号分隔）
		router: function(story/* .aa,.~bb,#cc,.aa>.dd */,e/* event */,p) {
			var words= story.split(",");
			for(p= words.length-1;p>=0;p--) {
				if(result= this.match(words[p],e)) {
					return result;
				}
			}
			return false;
		},
		//总入口
		parse: function(story,func,e) {
			var result= this.router(story,e);
			if(result.length==2) {
				func(result[1]);
			}else if(result){
				func(e);
			}
		}
	};
	q.view.eventParser= new q.view.eventParser();
	q.view.prototype= {
		init: function(data,option) {
			if(option) {
				this.initOption(option);
			}
			if(data) {
				this._data= data;
			}
		},
		getData: function() {
		    return this._data;
		},
		initOption: function(option) {
			//option for view
			//not in prototype
		    this.target= option.target||this.target;
			this.beforeRender= option.beforeRender||this.beforeRender;
		},
		afterInit: function() {

		},
		render: function() {
			var _this= this;
			if(this.target && typeof this.target == "string" ) {
				this.target= $D.id(this.target);
			}
			if((this.template||this.html) && this.target) {
				if(this.template) {
					//initial dom...
					var html= $S.template(this.template,this._data); 
				}else if(this.html) {
					var html= this.html;
				}
				if(this.container) {
					this.container;
					var f= this.container.pop();
					if(typeof f!="function") {
						this.container.push(f);
						f= null;
					}
					this.el= $D.node.apply(null,this.container);
					//this.el.id= this.getId();
					if(f) {
						f(this.el,this);
						this.container.push(f);
					}
					this.el.innerHTML= html;
					this.beforeRender(this.el);
					this.target.appendChild(this.el);
				}else {
					this.el= this.target;
					this.beforeRender(this.el);
					this.el.innerHTML= html;
				}
				//initial event...
				if(this.events) {
					this.initEvents();
				}

				this.incrId();
			//only binding events 
			}else if(this.target && this.events) {
				this.el= this.target;
				this.initEvents();
			}
		},
		beforeRender: function() {

		},
		afterRender: function() {

		},
		update: function(data) {
			if(data) {
			    this._data= data;
			}
			this.removeEvents();
			var _this= this;
			if(this.template && this.target) {
				//initial dom...
				var html= $S.template(this.template,this._data);
				if(this.container) {
					this.container;
					var f= this.container.pop();
					if(typeof f!="function") {
						this.container.push(f);
						f= null;
					}
					//this.el= $D.node.apply(null,this.container);
					if(f) {
						f(this.el,this);
						this.container.push(f);
					}
					this.beforeRender(this.el);
					this.el.innerHTML= html;
					//this.target.appendChild(this.el);
				}else {
					this.el= this.target;
					this.beforeRender(this.el);
					this.el.innerHTML= html;
				}
				//initial event...
				if(this.events) {
					this.initEvents();
				}
			}
		},
		hash: {"#":"id", ".":"className", "@":"el","!":"!"},
		eventsNotBubble: {
			"blur":1,
			"focus":1,
			"change":1
			//"mouseenter":1,//onlyIE
			//"mouseleave":1
		},
		initEvents: function() {
			if(this.events) {
    			var events= {},
    				_this=this,
    				hash= this.hash,
    				eventsNotBubble= this.eventsNotBubble;
    			$F.each(this.events,function(k,v) {
    				if(typeof v=="string") {
    					v= _this.observers[v];
    				}
    				var temp= v;
    				v= function(e) {
    					//e.stopPropagation();
    					Array.prototype.push.call(arguments,_this);
    					temp.apply(this,arguments);
    				};
    				var arg= k.split(" ");
    				var targets= arg[0],event= arg[1];
    				events[event]= events[event]||[];
    				events[event].push([targets,v]);
    				this._events= events;
    			});
    			$F.each(events,function(k,v) {
    				//so weak...
    				//like blur or @click
    				if(eventsNotBubble[k]||(k.charAt(0)=="@")) {
    					for(var len=v.length-1;len>=0;len--) {
    						var targets= v[len][0].split(",");
    						for(var l=targets.length-1;l>=0;l--) {
    							type= hash[targets[l].charAt(0)];
    							if(type=="id") {
    								$E.on($D.id(targets[l].substr(1)),k,v[len][1]);
    							}else if(type=="el") {
    								$E.on(_this.el,k.substr(1),v[len][1]);
    							}
    						}
    					}
    				}else {
    					$E.on(_this.el,k,function(e) {
    						//e.stopPropagation();
    						var dom= e.target;
    						var not=null;
    						for(var len=v.length-1;len>=0;len--) {
    							q.view.eventParser.parse(v[len][0],v[len][1],e);
    						}
    
    					});
    				}
    			});
			}
		},
		removeEvents: function() {
			if(this.events) {
    			var _this= this,
    				hash= this.hash,
    				eventsNotBubble= this.eventsNotBubble;
    			$F.each(this.events,function(k,v) {
    				if(eventsNotBubble[k]) {
    					for(var len=v.length-1;len>=0;len--) {
    						var targets= v[len][0].split(",");
    						for(var l=targets.length-1;l>=0;l--) {
    							type= hash[targets[l].split("")[0]];
    							if(type=="id") {
    								$E.off($D.id(targets[l].substr(1)));
    							}else if(type=="el"){
    								$E.off(_this.el);
    							}
    						}
    					}
    				}
    			});
    			$E.off(_this.el);
			}
		},
		id: function(id) {
			//a cache layer
			this._domsCache= this._domsCache||{};
			if(this._domsCache[id]) {
				return this._domsCache[id];
			}else {
				return (this._domsCache[id]=$D.id(id))
			}
		},
		destory: function() {
			delete this._domsCache;
			this.removeEvents();
			this.el.parentNode.removeChild(this.el);
		},
		_id: 0,
		incrId: function() {
			//return this.constructor.prototype._id++;
		},
		getCount: function() {
			//return this.constructor.prototype._id;
		},
		setId: function(id) {
			this.__id= id;
		},
		getId: function(id) {
			return this.__id;
		},
		show: function() {
			this.isShow= true;
			$D.show(this.el);
		},
		hide: function() {
			this.isShow= false;
			$D.hide(this.el);
		}
	};
	q.controller.prototype= {
		init: function() {
			if(this.collection) {
				var _this= this;
				this._hash= {};
				this.collection= new this.collection(); 
				this.key= this.collection.key;
				this.collection.bind("add",function(item,option) {
					_this.add(item,option);
				});
				this.collection.bind("update",function(item,option) {
					_this.update(item,option);
				});
				this.collection.bind("remove",function(id) {
					_this.remove(id);
				});
			}
		},
		//吞入大量数据
		/**
		 * 喂食
		 * {Object} data 数据
		 * {Bool} silent 是否延迟渲染，默认不延迟
		 */
		feed: function(data,silent) {
			var _this= this;
			if(silent) {
				this._feedSilent(data);
			}else {
				this.collection.init(data);
			}
		},
		_feedSilent: function(data) {
			var _this= this;
			$F.each(data,function(k,v) {
				_this.collection.addSilent(v);
			});
		},
		//吞入一个数据并渲染
		bite: function(data,option) {
			this.collection.add(data,option);
		},
		puke: function(id) { //:)
			this.collection.remove(id);
		},
		pukeAll: function() {
		    var _this= this;
		    $F.each(this._hash,function(id,view){
		        _this.collection.remove(id);
		    });
		    this._hash= {};
		},
		render: function(data,option) {
			var _this= this;
			if(Object.prototype.toString.call(data) == "[object Array]") {
    			$F.each(data,function(k,v) {
    				_this.add(v,option);
    			});
			}else {
			    _this.add(data,option);
			}
		},
		find: function(id) {
			return this._hash[id];
		},
		add: function(item,option) {
			var _this= this;
			var view= new this.view(item,option);
			view.setId(item[this.key]);
			this._hash[view.getId()]= view;
			$F.each(this.viewObserver,function(k,v) {
				var temp= v;
				v= function() {
					Array.prototype.push.call(arguments,_this);
					temp.apply(this,arguments);
				};
				view.bind(k,v);
			});
			view.afterInit();
			view.render();
			view.afterRender();
		},
		update: function(item,option) {
			this.find(item[this.key]).update(item,option);
		},
		remove: function(id) {
			this.find(id).destory();
			delete this._hash[id];
		}
	};
	q.collection.prototype= {
		init: function(data) {
			if(data) {
				var _this= this;
				$F.each(data,function(k,v) {
					_this.add(v);
				});
			}else {
				this._hash= {};
				this._queue= [];
			}
		},
		findAll: function() {
			return this._queue;
		},
		key: undefined,
		groupBy: undefined,
		find: function(id) {
			return this._hash[id];
		},
		addSilent: function(data, option) {
			var item= new this.model(data);
			var id= item[this.key];
			this._hash[id]= item;
			this._queue.push(id);
			if(this.groupBy) {
				this.group(item[this.groupBy],id);
			}
		},
		add: function(data,option) {
			if(!this._hash[data[this.key]]) {
				var item= new this.model(data);
				var id= item[this.key];
				this._hash[id]= item;
				this._queue.push(id);
				if(this.groupBy) {
				    this.group(item[this.groupBy],id);
				}
				this.trigger("add",item,option);
			}else {
				this.update(data,option);
			}
		},
		update: function(data,option) {
			var item= this.find(data[this.key]);
			$F.each(data,function(k,v) {
				item.setter(k,v);
			});
			this.trigger("update",item,option);
		},
		getFirst: function() {
			return this.find(this._queue[0])[this.key];
		},
		getLast: function() {
			return this.find(this._queue[this._queue.length-1])[this.key];
		},
		getLength: function() {
			return this._queue.length;
		},
		insertBefore: function(id) {
			var i= $F.arrayIndexOf(this._queue,id);
			if(i>-1) {
				var item= this._queue.splice(i,1);
				this._queue.unshift(id);
			}
		},
		remove: function(id) {
			delete this._hash[id];
			var i= $F.arrayIndexOf(this._queue,id);
			if(i>-1) {
				this._queue.splice(i,1);
			}
			this.trigger("remove",id);
		},
		filter: function(object) { //basic filter
			var result=[];
			$F.each(this._hash,function(key,value) {
				var detect= false;
				$F.each(object,function(k,v) {
					v= v.toLowerCase();
					if(String(value[k]).toLowerCase().indexOf(v)!=-1) {
						detect= true;
					}
					return detect;
				});
				if(detect) {
					result.push(value);
				}
			});
			return result;
		},
		group: function(k, id) {
		    this._groupHash= this._groupHash||{};
		    this._groupHash[k]= this._groupHash[k]||[];
		    this._groupHash[k].push(id);
		},
		findByGroup: function(k) {
		    var group= this._groupHash[k];
		    var result= [];
		    if(group) {
		        for(var i=0;i<group.length;i++) {
		        	var item= this.find(group[i]);
		        	if(item) {
		                result.push(item)
		        	}
		        }
		    }
		    return result;
		},
		map: function(func) {
			$F.each(this._hash,function(key,value){
				func(key,value);
			});
		}
	};
	q.model.prototype= {
		init: function(data) {
			var _this= this;
			if(data) {
				$F.each(data,function(k,v) {
					_this.setter(k,v);
				});
			}
		},
		setter: function(k,v) {
			this[k]= this.map[k]?this.map[k](k,v,this):v;
			var xss= this.xss[k];
			if(xss) {
				this[xss]= $S.encodeHtmlSimple(v);
			}
			return this;
		},
		getter:function(k) {
			return this[k];
		},
		xss: {},
		map: {},
		toString: function() {
			var j={};
			$F.each(this,function(k,v) {
				j[k]= v;
			});
			return q.json.stringify(j);
		}
	};
	MicroEvent.mixin(q.view);
	MicroEvent.mixin(q.controller);
	MicroEvent.mixin(q.collection);
	MicroEvent.mixin(q.model);

	var extend= function(options) {
		var func= function() {
			//有参数才执行init
			if(arguments[0]) {
				this.init.apply(this,[].slice.call(arguments));
			}
		},p;
		p= func.prototype= new this;
		for(var k in options) {
			if(options.hasOwnProperty(k)) {
				if(k=="init") {
					var tempf1= options["init"];
					var tempf2= p["init"];
					delete p["init"];
					p["init"]= function() {
						var args= [].slice.call(arguments);
						tempf2.apply(this,args);
						tempf1.apply(this,args);
					}
				}else {
					p[k]= options[k];
				}
			}
		}
		p.constructor= func;
		return  func;
	};
	q.controller.extend= q.collection.extend= q.model.extend= q.view.extend= extend;
	window.q= q;
})();
