	var J= Jet();
	var $D = J.dom,
        $E = J.event,
        $S = J.string,
        $V= q.view,
        $M= q.model,
        $C= q.controller,
        $CL= q.collection,
        $F= q.func;

	
	var websocket;
	var needInit= true;
	var channel= (function(){
		var _hashMap= {};
		var _seq= 414912;
		var _getSeq= function() {
			return _seq++;
		};
		var _send= function(option) {
			websocket.send(JSON.stringify(option));
		};
		var call= function(command, param, func) {
			var seq= _getSeq();
			_send({
				type: "callback",
				command: command,
				param: param,
				seq: seq
			});
			if(func) {
				_hashMap[seq]= func;
			}
			
		}
		var on= function(command, param, func) {
			
		};
		var off= function() {};
		var router= function(data) {
			switch(data.type) {
				case "callback":
					var seq= data.seq;
					if(_hashMap[seq]) {
						_hashMap[seq](data.result);
					}
					delete _hashMap[seq];
					break;
				case "event":
					break;
			}
		};
		return {
			call: call,
			on: on,
			off: off,
			router: router
		}
	})();
	var socketInit= function(callback) {
		websocket= new WebSocket('ws://localhost:'+ config.frontend_server_port);
		websocket.onopen= function(){
			console.info("open, websocket.readyState:", websocket.readyState);
			if(websocket.readyState == 1) {
				websocket.send("say hello from client");
				if(needInit) {
					needInit= false;
					callback();
				}
			}
		};
		websocket.onerror= function() {
			console.info("error, websocket.readyState:", websocket.readyState);
		};
		websocket.onclose= function() {
			console.info("close, websocket.readyState:", websocket.readyState);
			socketInit();//keep online
		};
		websocket.onmessage= function(data) {
			if(data.data) {
				//if not empty
				try {
					var _data= JSON.parse(data.data);
					switch(_data.type) {
						case "system":
							if(_data.command == "reset") {
								//socketInit();
							}
							break;
						case "flow":
							fire("dispatch", _data.result);
							break;
						default:
							channel.router(_data);
							//fire("dispatch", JSON.parse(data.data));
					}
				}catch(e) {
					console.info("error", e, data.data);
				}
			}
		};

	};
	
	socketInit();
	
    var modules= [];

    var fire= function() {
        var message= arguments[0];
        for(var i=0;i<modules.length;i++) {
			if(modules[i]["observers"] && modules[i]["observers"][message]) {
				modules[i]["observers"][message].apply(null,[].slice.call(arguments).slice(1));
            }
        }
	};
	//popup
	var ComponentPopup= function() {
		
	};
	
	//navigator
	var navigatorModule= function() {
		var on= false;
		var NavigatorView= $V.extend({
			target: "head",
			events: {
				".~proxy_switcher>* click": function(e, view) {
					if(on) {
						view.setOff();
					}else {
						view.setOn();
					}
				},
				".~setting click": function(e, view) {
					fire("startConfig");
				}
			},
			setViewOn: function() {
				$D.addClass($D.id("proxy_switcher"), "on");
				on= true;
			},
			setViewOff: function() {
				$D.removeClass($D.id("proxy_switcher"), "on");
				on= false;
			},
			setOn: function() {
				var _this= this;
				channel.call("setProxyOn", null, function(data) {
					if(data == 1) {
						_this.setViewOn();
					}
				});				
			},
			setOff: function() {
				var _this= this;
				channel.call("setProxyOff", null, function(data) {
					if(data == 0) {
						_this.setViewOff();
					}
				});				
			},
			getInitalData: function() {
				var _this= this;
				channel.call("getProxyState", null, function(data) {
					if(data == 1) {
						_this.setViewOn();
					}
				});
			}
		});
		var c= (new NavigatorView({}));
		c.render();
		c.getInitalData();
		
		return {
			observers: {
				dispatch: function(data) {
					if(data.proxySetting) {
						//console.info(data.seq, data);				
						
					}				
				}
			}
		}
	};
	var httpListModule= function() {
		var lastItem;
        var HttpListView= $V.extend({
			init: function(data) {
				
            },
            target: "dataflow",
			container: ["div",{"class":"flowitem"}],
			template: '\
					<div class="result code_<%=code%>" title="<%=seq%>"><%=code%></div>\
					<div class="type"><%=method%></div>\
					<div class="host"><%=host%></div>\
					<div class="ip"><%=address%></div>\
					<div class="url"><a target="_blank" onclick="return false;" href="<%=path%>"><%=path%></a></div>\
					',
			events: {
				'.~flowitem>* click': function(e, view) {
					//alert(view.getData().seq);
					fire("dataflowSeleted", view.getData())
					channel.call("requestDetail", view.getData().seq, function(data){
						var dom= e.target;
						if(lastItem) {
							$D.removeClass(lastItem, "selected");
						}
						$D.addClass(dom, "selected");
						lastItem= dom;
						fire("requestDetail", data);
						
					});
					
				},
			}
		});
        var HttpListModel= $M.extend({
        });
        var HttpListCollection= $CL.extend({
            model: HttpListModel,
            key: "seq"
        });
        var HttpListController= $C.extend({
            collection: HttpListCollection,
            view: HttpListView,
            fetch: function(data) {
                this.feed(data);
            },
            viewObserver: {
			},
			scroll2Bottom: function() {
				var container= $D.id("dataleft");
				if(container.scrollHeight-container.scrollTop- container.offsetHeight<30) {
					container.scrollTop= container.scrollHeight;
				}
			}
        });
		var httpList= new HttpListController({});
		return {
			observers: {
				dispatch: function(data) {
					if(data.seq) {
						//console.info(data.seq, data);				
						httpList.bite(data);
						httpList.scroll2Bottom();
					}				
				}
			}
		}
	
	};
	var fileExplorer= function() {
		var lastDirectory= "/";
		var isShow= false;
		var explorView= $V.extend({
		    target: "explorer_body",
			container: ["div"],
			template: '<div class="<%= type%>">\
				<div class="icon"></div>\
				<div class="name" title="<%= name%>"><%= name%></div>\
				</div>',
			events: {
				"@ @click": function(e, view) {
					if(view.getData().type== "directory") {
						fire("showFileExplorer", [lastDirectory, view.getData().name]);
					}else{
						var fullPath= lastDirectory!="/"?(lastDirectory + "/" + view.getData().name):("/"+ view.getData().name);
						fire("setRulefullPath", fullPath)
					}
				}
			}
		});
		var explorModel= $M.extend({
		});
		var explorCollection= $CL.extend({
		    model: explorModel,
		    key: "key", //name + type
		});
		var explorController= $C.extend({
		    collection: explorCollection,
		    view: explorView,
		    viewObserver: {
			},
			show: function() {
				if(!isShow) {
					$D.show($D.id("explorer"));
					isShow= true;
				}
			},
			hide: function() {
				if(isShow) {
					$D.hide($D.id("explorer"));
					isShow= false;
				}
			},
			explor: function(dir) {
				var _this= this;
				this.pukeAll();
				channel.call("explor", dir, function(data){
					$D.id("explorer_path").innerHTML= data.directory;
					_this.feed(data.filesList);
					lastDirectory= data.directory;
				});
			}
		});
		var explorer= new explorController({});
		$E.on($D.id("explorer_up_button"), "click", function() {
			fire("showFileExplorer", [lastDirectory, "../"]);
		});
		$E.on($D.id("explorer_close_button"), "click", function() {
			explorer.hide();
		});
		return {
			observers: {
				showFileExplorer: function(directory) {
					directory= directory || lastDirectory;
					explorer.show();
					explorer.explor(directory);
				}
			}
		}
	}
	var configModule= function() {
		var ruleView= $V.extend({
		    target: "rule_body",
			container: ["div", {
				class:"host_item"
			}],
			template: '\
				<div class="item left"><input value="<%= match %>" /></div>\
				<div class="item right"><input value="<%= filePath%>" /></div>\
				<div class="minus">-</div>\
			',
			events: {
				".~minus click": function(e, view) {
					channel.call("updateRule", {
							command: "remove",
							data: view.getData()
						},	
						function() {
							rulemodule.puke(view.getData().match);
						}
					);
				}
			}
		});
		var ruleModel= $M.extend({
		});
		var ruleCollection= $CL.extend({
		    model: ruleModel,
		    key: "match"
		});
		var ruleController= $C.extend({
		    collection: ruleCollection,
		    view: ruleView,
		    fetch: function(data) {
		        this.feed(data);
		    },
		    viewObserver: {
			}
		});
		var rulemodule= new ruleController({});	
		var init= (function() {
			$E.on($D.id("setting_close_button"), "click", function() {
				$D.hide($D.id("setting_pad"));
				isClose= true;
			});
			
			var file= $D.id("file");
			
			$E.on(file, "click", function(e) {
				fire("showFileExplorer");
			});
			
			$E.on($D.id("rule_plus"), "click", function() {
				var filePath= $D.id("filepath").value;
				if(filePath) {
					var match= $D.id("rule_match_input").value;
					if(match) {
						var data= {
							filePath: filePath,
							match: match
						}
						channel.call("updateRule", {
								command: "add",
								data: data
							},	
							function() {
								rulemodule.bite(data);
							}
						);
					}
				}
			
			});
		})();
		
		var isClose= true;
		var initial= false;
		return {
			observers: {
				startConfig: function(data) {
					var setting_button= $D.id("setting_button");
					var setting_pad= $D.id("setting_pad");
					var explorer= $D.id("explorer");
					if(isClose) {
						var left,top;
						left= setting_button.offsetLeft;
						top= setting_button.offsetTop+20;
						$D.setStyle(setting_pad, "left", left+"px");
						$D.setStyle(setting_pad, "top", top+"px");
						$D.setStyle(explorer, "left", left+60+"px");
						$D.setStyle(explorer, "top", top+90+"px");
						$D.show(setting_pad);
						isClose= false;
					}else {
						$D.hide(setting_pad);
						isClose= true;
					}
					if(!initial) {
						channel.call("getConfigInitial", null, function(data) {
							rulemodule.feed(data.ruleData);
							initial= true;
						});
					}
				},
				dataflowSeleted: function(data) {
					if(!isClose) {
						var url= data.host + data.path;
						$D.id("rule_match_input").value= url;
					}
				},
				setRulefullPath: function(fullpath) {
					$D.id("filepath").value= fullpath;
				}
			}
		}		
	}
	var httpDetailModule= function() {
        var HttpDetailView= $V.extend({
			init: function(data) {
				
            },
            target: "dataright",
			container: ["div", {
				class: "box detailbox"
			}],
			template: '\
				<div class="toolbar">\
					<div class="buttons">\
						<div class="button push" style="display:none;"></div>\
						<div class="button pop"></div>\
						<div class="button close"></div>\
					</div>\
				</div>\
				<div class="content">\
					<div class="lable">\
						<span>REQUEST</span>\
						<div id="request_headers_button" class="button selected">head</div>\
						<div id="request_body_button" class="button">body</div>\
					</div>\
					<div class="bodywrap">\
						<div id="request_content_area" class="body text">\
							<%= request_headers %>\
						</div>\
					</div>\
					<div class="lable">\
						<span>RESPONSE</span>\
						<div id="response_headers_button" class="button selected">head</div>\
						<div id="response_body_button" class="button">body</div>\
					</div>\
					<div class="bodywrap">\
						<div id="response_content_area" class="body text">\
							<%= response_headers %>\
						</div>\
					</div>\
				</div>\
					',
			events: {
				"#response_body_button click": function(e, view) {
					view.select("response", "body")
				},
				"#response_headers_button click": function(e, view) {
					view.select("response", "headers")
				},
				"#request_body_button click": function(e, view) {
					view.select("request", "body")
				},
				"#request_headers_button click": function(e, view) {
					view.select("request", "headers")
				},
				".~close click": function(e, view) {
					$D.hide(view.target);
					adjustLayout();
					httpDetail.isClose= true;
				}
			},
			select: function(type1, type2, html) {
				var body= (this.getData()[type1+"_"+type2] || "");
				$D.addClass($D.id(type1+"_"+type2+"_button"), "selected");
				$D.removeClass($D.id(type1+"_"+(type2=="body"?"headers":"body")+"_button"), "selected");
				$D.id(type1+"_content_area").innerHTML= body;
			}
 		});
        var HttpDetailModel= $M.extend({
        });
        var HttpDetailCollection= $CL.extend({
            model: HttpDetailModel,
            key: "seq"
        });
        var HttpDetailController= $C.extend({
            collection: HttpDetailCollection,
            view: HttpDetailView,
            fetch: function(data) {
                this.feed(data);
			},
			isClose: true,
            viewObserver: {
			}
        });
		var httpDetail= new HttpDetailController({});
		return {
			observers: {
				requestDetail: function(data) {
					if(httpDetail) {
						$D.show($D.id("dataright"));
						$D.setStyle($D.id("dataright"), "width", (document.body.clientWidth-60)/2 +"px");
						$D.setStyle($D.id("dataleft"), "width", (document.body.clientWidth-60)/2 +"px");
						httpDetail.isClose= false;
					}
					request_headers= "";
					for(var k in data.request.header) {
						if(data.request.header.hasOwnProperty(k)) {
							request_headers += "<p>" + k + " : " + data.request.header[k] +"</p>";
						}
					}
					response_headers= "";
					for(var k in data.response.header) {
						if(data.response.header.hasOwnProperty(k)) {
							response_headers += "<p>" + k + " : " + data.response.header[k] +"</p>";
						}
					}
					
					httpDetail.bite({
						request_headers: request_headers, 
						response_headers: response_headers,
						response_body: $S.encodeHtmlSimple(data.response.body),
						request_body: $S.encodeHtmlSimple(data.request.body)
					});
				}
			}
		}
	
	};
	var adjustLayout= function() {
		$D.setStyle($D.id("dataleft"), "height",document.body.scrollHeight-75 + "px");
		$D.setStyle($D.id("dataright"), "height",document.body.scrollHeight-75 + "px");
		$D.setStyle($D.id("dataleft"), "width",document.body.clientWidth-60 + "px");
	};
	window.addEventListener("resize",adjustLayout);
	window.addEventListener("load",function(){
		//load module
		socketInit(function(){
			modules.push(httpListModule= httpListModule());
			modules.push(httpDetailModule= httpDetailModule());
			modules.push(navigatorModule= navigatorModule());
			modules.push(configModule= configModule());
			modules.push(fileExplorer= fileExplorer());
			adjustLayout();
		});
	});