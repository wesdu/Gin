if(typeof(progress) == 'function'){
    progress("jet.all.js loaded");
}
/**    
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * http://code.google.com/p/j-et/
 *
 * @version    1.0
 * @author    Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * 
 */

/**    
 * @description
 * Package: jet
 *
 * Need package:
 * no.
 * 
 */

/**
 * 1.[JET core]: JET 微内核
 */
;(function(){
    var version = "1.0",
        mark = "JxMark",
        topNamespace = this,
        undefined,
        
        // 将顶级命名空间中可能存在的 Jx 对象引入
        Jx = topNamespace.Jx,
        
        VERSIONS = {},
        PACKAGES = {},
        
        DEBUG = {
            NO_DEBUG: 0,
            SHOW_ALL: 1
        },
        
        option = {
            debug: 1
        },
        
        /**
         * @ignore
         */
        out = function(msg,tag,type){
            msg = String(msg);
            //type = type||"";
            //type = (typeof type == "undefined")?0:type;
            if(option.debug){
                if(this.console){
                    if(this.console.out){
                        this.console.out(msg,tag,type);
                    }else{
                        alert(msg+" - 消息类型["+type+"]");
                    }
                    
                }
            }
            return msg;
        };

    try{
        // 判断Jx名字空间是否已经存在
        if(typeof Jx === "undefined" || (Jx.mark && Jx.mark === mark)){
            
            // 如果已经有Jx对象则记录已有的信息
            if(Jx){
                VERSIONS = Jx.VERSIONS;
                PACKAGES = Jx.PACKAGES;
            }
            
            /**
             * 【Jx 对象原型】
             * 
             * @class Jx
             * @constructor Jx
             * @global
             * 
             * @since version 1.0
             * @description Jx 对象原型的描述
             * 
             * @param {Number} ver 要使用的 Jx 的版本号，当前是1.0
             * @param {Boolean} isCreateNew 是否创建一个新的 Jx 实例，默认为 false 不创建新的 Jx 实例，只返回同一版本在全局中的唯一一个实例，注意：除非特殊需要，否则一般不要创建新的 Jx 实例
             * @return {Object} 返回对应版本的 Jx 对象
             * 
             * @example
             * //代码组织方式一(传统)：
             * var J = new Jx();
             * J.out(J.version);    //输出当前Jx的版本
             * 
             * @example
             * //代码组织方式二(推荐)：
             * Jx().$package(function(J){
             *     J.out(J.version);    //输出当前Jx的版本
             * };
             * //注：此种方式可以利用匿名函数来防止变量污染全局命名空间，尤其适合大型WebApp的构建！
             * 
             * @example
             * //范例：
             * Jx().$package("tencent.alloy", function(J){
             *     var $ = J.dom.id,
             *     $D = J.dom,
             *     $E = J.event,
             *     $H = J.http;
             *     this.name = "腾讯WebQQ";
             *     J.out(this.name);
             * };
             * 
             */
            Jx = function(ver, isCreateNew){
                var J = this;

                if(isCreateNew){
                    // 如果是第一次执行则初始化对象
                    this._init();
                }else{
                    if(ver){
                        ver = String(ver);
                        try{
                            if(Jx.VERSIONS[ver]){
                                J = Jx.VERSIONS[ver];
                            }else{
                                J = Jx.VERSIONS[Jx.DEFAULT_VERSION];
                                throw new Error("没有找到 JET version " + ver + ", 所以返回默认版本 JET version " + Jx.DEFAULT_VERSION + "!");
                            }
                        }catch(e){
                            //J.out(e.fileName+";"+e.lineNumber+","+typeof e.stack+";"+e.name+","+e.message, 2);
                            J.out("A.错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
                        }
                    }else{
                        J = Jx.VERSIONS[Jx.DEFAULT_VERSION];
                    }
                }
                return J;
            };
            
            Jx.prototype = {
                /**
                 * 当前 Jx 的版本号，此版本是 1.0 <br/>
                 * Version 1.0
                 * 
                 * @description {Num} 当前 Jx 的版本号！
                 * @constant
                 * @type Number
                 */
                version: version,
                
                DEBUG: DEBUG,
                
                /**
                 * Jx 配置
                 * @ignore
                 */
                option: option,
                
                /**
                 * Jx 的初始化方法
                 * initialize method
                 * 
                 * @private
                 * @param {Object} o config 对象
                 */
                _init: function(){
                    this.constructor = Jx;
                    //return true;
                },
            
                /**
                 * 创建一个命名空间，创建的命名空间将会在 window 根命名空间下。
                 * Create a new namespace, the top namespace is window.
                 * 
                 * @since version 1.0
                 * @description 可以一次性连续创建命名空间
                 * 
                 * @param {String} name 命名空间名称
                 * @returns {Object} 返回对最末命名空间的引用
                 * 
                 * @example
                 * //在全局环境中创建tencent.alloy名字空间, $namespace完成的操作相当于在全局环境中执行如下语句：
                 * //var tencent = {};
                 * //tencent.alloy = {};
                 * 
                 * J.$namespace("tencent.alloy");
                 * 
                 * //注：Jx的$namespace方法与其他JS框架的namespace的方法不同，其他框架如YUI是在其YAHOO对像下创
                 * //建命名空间，而Jx的$namespace测试直接在顶级命名空间window的下边直接创建命名空间。
                 * 
                 */
                $namespace: function(name) {
                    var i,
                        ni,
                        nis = name.split("."),
                        ns = window;

                    for(i = 0; i < nis.length; i=i+1){
                        ni = nis[i];
                        ns[ni] = ns[ni] || {};
                        ns = ns[nis[i]];
                    }

                    return ns;
                },
    
                /**
                 * 创建一个 Javascript 代码包
                 * 
                 * @param {String} name 要创建的包的名字空间
                 * @param {Function} func 要创建的包的包体
                 * @returns {Mixed} 返回任何自定义的变量
                 * 
                 * @example
                 * //创建一个匿名package包：
                 * Jx().$package(function(J){
                 *     //这时上下文对象this指向全局window对象
                 *     alert("Hello world! This is " + this);
                 * };
                 * 
                 * @example
                 * //创建一个名字为tencent.kinvix的package包：
                 * Jx().$package("tencent.kinvix", function(J){
                 *     //这时上下文对象this指向window对象下的tencent.kinvix对象
                 *     alert("Hello world! This is " + this);
                 * };
                 * 
                 * 
                 * 
                 */
                $package: function(){
                    var name = arguments[0],
                        func = arguments[arguments.length-1],
                        ns = topNamespace,
                        returnValue;
                        if(typeof func === "function"){
                            if(typeof name === "string"){
                                ns = this.$namespace(name);
                                if(Jx.PACKAGES[name]){
                                    //throw new Error("Package name [" + name + "] is exist!");
                                }else{
                                       Jx.PACKAGES[name] = {
                                        isLoaded: true,
                                        returnValue: returnValue
                                    };
                                }
                                ns.packageName = name;
                            }else if(typeof name === "object"){
                                ns = name;
                            }
                            
                            returnValue = func.call(ns, this);
                        }else{
                            throw new Error("Function required");
                        }
    
                },
                
                /**
                 * 检查一个 Javascript 模块包是否已经存在
                 * 
                 * @param {String} name 包名
                 * @return {Object} 如果已加载则返回包对象，否则返回 undefined
                 * 
                 * @example
                 * //创建一个匿名package包：
                 * Jx().$package(function(J){
                 *     // 输出undefined
                 *     J.out(J.checkPackage("tencent.kinvix"));
                 * };
                 * 
                 * 
                 * @example
                 * //创建一个名字为tencent.kinvix的package包：
                 * Jx().$package("tencent.kinvix", function(J){
                 *     //这时上下文对象this指向window下的tencent.kinvix对象
                 *     alert("Hello world! This is " + this);
                 * };
                 * 
                 * Jx().$package(function(J){
                 *     // J.checkPackage("tencent.kinvix")结果返回的将是tencent.kinvix的引用
                 *     var kinvix = J.checkPackage("tencent.kinvix");
                 *     if(kinvix){
                 *         J.out("tencent.kinvix包已加载...");
                 *     }
                 * };
                 * 
                 */
                checkPackage: function(name){
                    return Jx.PACKAGES[name];
                },
                
                /**
                 * 标准化 Javascript 的核心输出方法，注意：在不同的Javascript嵌入宿主中会覆盖此方法！
                 * 
                 * @method out
                 * @function
                 * 
                 * @param {String} msg 要输出的信息
                 * @param {Number} type 输出信息的类型
                 * @return {String} msg 返回要输出的信息
                 * 
                 * @example
                 * //创建一个匿名package包：
                 * Jx().$package(function(J){
                 *     // 向Jx的控制台输出信息,在不同的js宿主中具体实现细节会不同,但不会影响out方法的使用;
                 *     J.out("Hello, world!");
                 * };
                 * 
                 */
                out: out,
                
                /**
                 * 我就是传说中的debug哥！
                 * 
                 * @method debug
                 * @function
                 * 
                 * @see 想知道我到底是谁吗?请参考J.console.debug
                 */
                debug: function(){},
                profile : function(){},
                warn : function(){},
                error : function(){},
                
                startTime: +new Date(),
                
                /**
                 * 关于 Jx
                 * 
                 * @return {String} 返回 Jx 的 about 信息
                 */
                about: function(){
                    return this.out("JET (Javascript Extend Tools)\nversion: " + this.version + "\n\nCopyright (c) 2009, All rights reserved.");
                },
                
                /**
                 * Jx 对象转化为字符串的方法
                 * 
                 * @ignore
                 * @return {String} 返回 Jx 对象串行化后的信息
                 */
                toString: function(){
                    return "JET version " + this.version + " !";
                }
            };

            /**
             * Jx 版本库对象
             * 
             * @ignore
             * @type Object
             */
            Jx.VERSIONS = VERSIONS;
            
            /**
             * 记录加载的包的对象
             * 
             * @ignore
             * @type Object
             */
            Jx.PACKAGES = PACKAGES;

            /**
             * 创建一个当前版本 Jx 的实例
             * 
             * @ignore
             * @type Object
             */
            Jx.VERSIONS[version] = new Jx(version, true);
        
            /**
             * Jx 默认版本的版本号，默认将会是最后一个加载的Jx版本
             * 
             * @constant
             * @type Number
             */
            Jx.DEFAULT_VERSION = version;
            /**
             * Jx 对象验证标记
             * 
             * @ignore
             * @description 用于验证已存在的Jx对象是否是本框架某子版本的Jx对象
             * @type String
             */
            Jx.mark = mark;
            
            // 让顶级命名空间的 Jx 对象引用新的 Jx 对象
            topNamespace.Jet = topNamespace.Jx = Jx;
        }else{
            throw new Error("\"Jx\" name is defined in other javascript code !!!");
        }
    }catch(e){
        // 微内核初始化失败，输出出错信息
        out("JET 微内核初始化失败! " + "B.错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 1);
    }
})();











/**
 * 2.[Javascript core]: 常用工具函数扩展
 */
Jx().$package(function(J){
    var isUndefined,
        isNull,
        isNumber,
        isString,
        isBoolean,
        isObject,
        isArray,
        isArguments,
        isFunction,
        $typeof,
        
        $return,
        $try,
        
        emptyFunc,
        
        checkJSON,
        random,
        extend,
        clone,
        now,
        timedChunk,

        getLength,


        rebuild,
        pass,
        bind,
        bindNoEvent,

        

        
        Class;

    /**
     * 判断变量的值是否是 undefined
     * Determines whether or not the provided object is undefined
     * 
     * @method isUndefined
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的值是 undefined 时返回 true
     */
    isUndefined = function(o) {
        return typeof(o) === "undefined";
    };
        
    /**
     * 判断变量的值是否是 null
     * Determines whether or not the provided object is null
     * 
     * @method isNull
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的值是 null 时返回 true
     */
    isNull = function(o) {
        return o === null;
    };
    
    /**
     * 判断变量的类型是否是 Number
     * Determines whether or not the provided object is a number
     * 
     * @memberOf Jx.prototype
     * @method isNumber
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的类型是 number 时返回 true
     */
    isNumber = function(o) {
        return (o === 0 || o) && o.constructor === Number;
    };
    
    /**
     * 判断变量的类型是否是 Boolean
     * Determines whether or not the provided object is a boolean
     * 
     * 
     * @method isBoolean
     * @memberOf Jx.prototype
     * 
     * @static
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的类型是 boolean 时返回 true
     */
    isBoolean = function(o) {
        return (o === false || o) && (o.constructor === Boolean);
    };
    
    /**
     * 判断变量的类型是否是 String
     * Determines whether or not the provided object is a string
     * 
     * 
     * @method isString
     * @memberOf Jx.prototype
     * 
     * @static
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的类型是 string 时返回 true
     */
    isString = function(o) {
        return (o === "" || o) && (o.constructor === String);
    };
    
    /**
     * 判断变量的类型是否是 Object
     * Determines whether or not the provided object is a object
     * 
     * 
     * @method isObject
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的类型是 object 时返回 true
     */
    isObject = function(o) {
        return (o && (o.constructor === Object)) || (String(o)==="[object Object]");
    };
    
    /**
     * 判断变量的类型是否是 Array
     * Determines whether or not the provided object is a array
     * 
     * 
     * @method isArray
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的类型是 array 时返回 true
     */
    isArray = function(o) {
        return (o && (o.constructor === Array)) || (Object.prototype.toString.call(o)==="[object Array]");
    };
    
    /**
     * 判断变量的类型是否是 Arguments
     * Determines whether or not the provided object is a arguments
     * 
     * 
     * @method isArguments
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的类型是 arguments 时返回 true
     */
    isArguments = function(o) {
        return o && o.callee && isNumber(o.length) ? true : false;
    };
    
    /**
     * 判断变量的类型是否是 Function
     * Determines whether or not the provided object is a function
     * 
     * 
     * @method isFunction
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {Boolean} 当 o 的类型是 function 时返回 true
     */
    isFunction = function(o) {
        return o && (o.constructor === Function);
    };
    
    /**
     * 判断变量类型的方法
     * Determines the type of object
     * 
     * 
     * @method $typeof
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} o 传入被检测变量的名称
     * @return {String} 返回变量的类型，如果不识别则返回 other
     */
    $typeof = function(o) {
        if(isUndefined(o)){
            return "undefined";
        }else if(isNull(o)){
            return "null";
        }else if(isNumber(o)){
            return "number";
        }else if(isBoolean(o)){
            return "boolean";
        }else if(isString(o)){
            return "string";
        }else if(isObject(o)){
            return "object";
        }else if(isArray(o)){
            return "array";
        }else if(isArguments(o)){
            return "arguments";
        }else if(isFunction(o)){
            return "function";
        }else{
            return "other";
        }
        
    };
    
    checkJSON = function(){
        
        return true;
    };
    
    /**
     * 生成随机数的方法
     * 
     * @method random
     * @memberOf Jx.prototype
     * 
     * @param {Number} min 生成随机数的最小值
     * @param {Number} max 生成随机数的最大值
     * @return {Number} 返回生成的随机数
     */
    random = function(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    
    
    
    /**
     * 克隆一个对象
     * 
     * @method clone
     * @memberOf Jx.prototype
     * 
     * @param {Object} o 要克隆的对象
     * @return {Object} 返回通过克隆创建的对象
     * 
     * @example
     * Jx().$package(function(J){
     *     var objA = {name: "Kinvix"};
     *     // 克隆一个 objA 对象，并存入 objB 中。
     *     var objB = J.clone(objA);
     * };
     */
    clone = function(o){
        var tempClass = function(){};
        tempClass.prototype = o;
        
        // 返回新克隆的对象
        return (new tempClass());
    };

    

    

    
    
    
    /**
     * 生成一个返回值是传入的 value 值的函数
     * 
     * @method $return
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} value 要返回的值
     * @return {Mixed} 返回一个返回值是 value 的函数
     */
    $return = function(result){
        return J.isFunction(result) ? result : function(){
                return result;
            };
    };
    
    /**
     * 从第一个函数开始try，直到尝试出第一个可以成功执行的函数就停止继续后边的函数，并返回这个个成功执行的函数结果
     * 
     * @method $try
     * @memberOf Jx.prototype
     * 
     * @param {Function} fn1, fn2, .... 要尝试的函数
     * @return {Mixed} 返回第一个成功执行的函数的返回值
     * 
     * @example
     * Jx().$package(function(J){
     *     // 按顺序执行 funcA, funcB, funcC，当中途有一个 func 的执行结果返回 true 则不再往下执行，并返回成功执行的 func 的返回值；
     *     J.$try(funcA, funcB, funcC);
     * };
     */
    $try = function(){
        var i,
            l = arguments.length,
            result;
            
        for(i = 0; i < l; i++){
            try{
                result = arguments[i]();
                // 如果上边语句执行成功则执行break跳出循环
                break;
            }catch(e){
                J.out("C.错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
            }
        }
        return result;
    };
    
    /**
     * 对一个对象或数组进行扩展
     * 
     * @method extend
     * @memberOf Jx.prototype
     * 
     * @param {Mixed} beExtendObj 被扩展的对象或数组
     * @param {Mixed} extendObj1, extendObj2, .... 用来参照扩展的对象或数组
     * @return {Mixed} 返回被扩展后的对象或数组
     * 
     * @example
     * Jx().$package(function(J){
     *     // 用 objB 和objC 扩展 objA 对象；
     *     J.extend(objA, objB, objC);
     * };
     * 
     */
    extend = function(beExtendObj, extendObj1, extendObj2){
        var a = arguments,
            i,
            p,
            beExtendObj,
            extendObj;
            
        if(a.length === 1){
            beExtendObj = this;
            i=0;
        }else{
            beExtendObj = a[0] || {};
            i=1;
        }
        
        for(; i<arguments.length; i++){
            extendObj = arguments[i];
            for(p in extendObj){
                var src = beExtendObj[p],
                    obj = extendObj[p];
                if ( src === obj ){
                    continue;
                }
                
                if ( obj && isObject(obj) && !obj.nodeType && !isFunction(obj)){
                    src = beExtendObj[p] || {};//2010-12-28
                    beExtendObj[p] = extend( src, 
                        // Never move original objects, clone them
                        obj || ( obj.length != null ? [ ] : { } ));

                // Don't bring in undefined values
                }else if ( obj !== undefined ){
                    beExtendObj[p] = obj;
                }
            }
        }

        return beExtendObj;
    };
    
    
    /*
    extend = function(beExtendObj, target, extendObj2) {
        
        // copy reference to target object
        var target = arguments[0] || {}, 
        i = 2, 
        length = arguments.length, 
        options;
    
    
        target = arguments[1] || {};


    
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !J.isFunction(target) ){
            target = {};
        }
        // extend jQuery itself if only one argument is passed
        if ( length == i ) {
            target = this;
            --i;
        }
    
        for ( ; i < length; i++ ){
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ){
                // Extend the base object
                for ( var name in options ) {
                    var src = target[ name ], 
                        copy = options[ name ];
    
                    // Prevent never-ending loop
                    if ( target === copy ){
                        continue;
                    }
                    // Recurse if we're merging object values
                    if ( copy && typeof copy === "object" && !copy.nodeType ){
                        target[ name ] = extend( target, 
                            // Never move original objects, clone them
                            src || ( copy.length != null ? [ ] : { } )
                        , copy );
    
                    // Don't bring in undefined values
                    }else if ( copy !== undefined ){
                        target[ name ] = copy;
                    }
                }
            }
        }
        // Return the modified object
        return target;
    };
    */
    
    /**
     * 获取当前时间的函数
     * 
     * @method now
     * @memberOf Jx.prototype
     * 
     * 
     * 
     * @example
     * alert(J.now());
     * 
     */
    now = function(){
        return +new Date;
    }
    
    
    /**
     * 通用分时处理函数
     * 
     * @method timedChunk
     * @memberOf Jx.prototype
     * 
     * 
     * 
     * @example
     * Jx().$package(function(J){
     * };
     * 
     */
    timedChunk = function(items, process, context, isShift, callback) {
        var todo = items.concat(), delay = 25;
        if(isShift){
            todo = items;
        }
 
        window.setTimeout(function() {
            var start = +new Date();
 
            do {
                process.call(context, todo.shift());
            } while(todo.length > 0 && (+new Date() - start < 50));
 
            if(todo.length > 0) {
                window.setTimeout(arguments.callee, delay);
            } else if(callback) {
                callback(items);
            }
 
        }, delay);
    }
    

    
    /**
     * 获取对象自身具有的属性和方法的数量
     * 
     * @method getLength
     * @memberOf Jx.prototype
     * 
     * @param {Object} obj 要获取的对象
     * @return {Number} 返回对象自身具有属性和方法的数量
     */
    getLength = function(obj) {
        var p,
            count = 0;
        for(p in obj){
            if(obj.hasOwnProperty(p)){
                count++;
            }
        }
        return count;
    };
    
    /**
     * 一个空函数函数
     * 
     * @memberOf Jx.prototype
     */
    emptyFunc = function(){};
    


        
    /**
     * 函数的重构方法
     * 
     * 
     * @private
     * @memberOf Jx.prototype
     * @param {Object} option 选项对象
     * @return {Function} 返回重构后的函数的执行结果
     */
    rebuild = function(func, option){
        option = option || {};
        
        func.$$rebuildedFunc = func.$$rebuildedFunc || function(){
            var self2 = this,
                scope,
                args,
                returns;
            scope = option.contextObj || self2;
            args = Array.prototype.slice.call(arguments, 0);

            if(args !== undefined){
                args = args.concat(option.arguments);
            }
            if(option.event === false){
                args = args.slice(1);
            }

            return func.apply(scope, args);
        };

        return func.$$rebuildedFunc;
    };
    
    /**
     * 给函数传入参数并执行
     * 
     * @memberOf Jx.prototype
     * @param {Mixed} args 参数列表
     * @return {Mixed} 返回函数执行结果
     * 
     * @example
     * Jx().$package(function(J){
     *     // 将"a"、"b"两个字符串传入funcA函数并执行
     *     funcA.pass("a","b");
     * };
     * 
     */
    pass = function(func, var_args) {
        var slice = Array.prototype.slice;
        var a = slice.call(arguments, 1);
        return function(){
            var context = this;
            return func.apply(context, a.concat(slice.call(arguments)));
        };
    };
    /*
    pass = function(func){
        var args = Array.prototype.slice.call(arguments, 1);
        return rebuild(func, {contextObj: null, arguments: args});
    };
    */
    
    /**
     * 给函数绑定一个上下文对象再执行
     * 
     * @memberOf Jx.prototype
     * @param {Object} contextObj 要绑定的上下文对象
     * @param {Mixed} args 参数列表
     * @return {Mixed} 返回函数执行结果
     * 
     * @example
     * Jx().$package(function(J){
     *     // 以 contextObjB 对象为上下文对象 this 来执行funcA函数
     *     funcA.bind(contextObjB);
     * };
     * 
     */
    /*
    bind = function(func, contextObj){
        var args = Array.prototype.slice.call(arguments, 2);
        //args = [this].extend(args);
        return rebuild(func, {contextObj: contextObj, arguments: args});
    };
    */
    
    /**
     * 将一个函数绑定给一个对象作方法，返回的函数将总被传入{@code obj} as {@code this}
     * 
     * @memberOf Jx.prototype
     * @param {Function} func 要绑定的函数
     * @param {Object} contextObj 要绑定的对象
     * @param {Mixed} args 参数列表，长度任意
     * @return {Function} 返回一个被绑定this上下文对象的函数
     * 
     * @example
     * Jx().$package(function(J){
     *   funcB = J.bind(funcA, obj, a, b)
     *   funcB(c, d) // 相当于执行 funcA.call(obj, a, b, c, d)
     * };
     */
    
    bind = function(func, context, var_args) {
        var slice = Array.prototype.slice;
        var a = slice.call(arguments, 2);
        return function(){
            return func.apply(context, a.concat(slice.call(arguments)));
        };
    };
    


    
    

    
    
    /**
     * 创建Class类的类
     * 
     * @class Class
     * @param {Object} option = {extend: superClass} 在option对象的extend属性中指定要继承的对象，可以不写
     * @param {Object} object 扩展的对象
     * @return {Object} 返回生成的日期时间字符串
     * 
     * @example
     * Jx().$package(function(J){
     *     var Person = new J.Class({
     *      init : function(name){
     *          this.name = name;
     *          alert("init");
     *      },
     *      showName : function(){
     *          alert(this.name);
     *  
     *      }
     *  
     *  });
     *  
     *  // 继承Person
     *     var Person2 = new J.Class({extend : Person}, {
     *      init : function(name){
     *          this.name = name;
     *          alert("init");
     *      },
     *      showName : function(){
     *          alert(this.name);
     *  
     *      }
     *  
     *  });
     *     
     * };
     * 
     */
    Class = function(){
        var length = arguments.length;
        var option = arguments[length-1];
        
        option.init = option.init || function(){};
        
        // 如果参数中有要继承的父类
        if(length === 2){
            /**
             * @ignore
             */
            var superClass = arguments[0].extend;
            
            /**
             * @ignore
             */
            var tempClass = function() {};
            tempClass.prototype = superClass.prototype;
            
            /**
             * @ignore
             */
            var subClass = function() {
                this.init.apply(this, arguments);
            }
            
            // 加一个对父类原型引用的静态属性
            subClass.superClass = superClass.prototype;
            //subClass.superClass = superClass;
            
            subClass.callSuper = function(context,func){
                var slice = Array.prototype.slice;
                var a = slice.call(arguments, 2);
                var func = subClass.superClass[func];
                //var func = subClass.superClass.prototype[func];
                if(func){
                    func.apply(context, a.concat(slice.call(arguments)));
                }
            };
            
            // 指定原型
            subClass.prototype = new tempClass();
            
            // 重新指定构造函数
            subClass.prototype.constructor = subClass;
            
            J.extend(subClass.prototype, option);
            
            // 重载init方法，插入对父类init的调用
            subClass.prototype.init = function(){
                // 调用父类的构造函数
                // subClass.superClass.init.apply(this, arguments);
                // 调用此类自身的构造函数
                option.init.apply(this, arguments);
            };
            
            return subClass;
            
        // 如果参数中没有父类，则单纯构建一个类
        }else if(length === 1){
            /**
             * @ignore
             */
            var newClass = function() {
            	// 加了return，否则init返回的对象不生效
                return this.init.apply(this, arguments);
            }
            newClass.prototype = option;
            return newClass;
        }
        
        
    };
    var Chunk = new Class({
        init : function(items, process, context, isShift, callback) {
            var todo = items.concat(), delay = 25;
            if(isShift){
                todo = items;
            }
            this.timeout;
             this.timeout = window.setTimeout(function() {
                var start = +new Date();
     
                do {
                    process.call(context, todo.shift());
                } while(todo.length > 0 && (+new Date() - start < 50));
     
                if(todo.length > 0) {
                    this.timeout = window.setTimeout(arguments.callee, delay);
                } else if(callback) {
                    callback(items);
                }
     
            }, delay);
        },
        stop : function(){
            clearTimeout(this.timeout);
        }
    
    });
    /*
    Class = function(obj){
        var tempClass = function() {
            this.init.apply(this, arguments);
        }
        tempClass.prototype = obj;
        return tempClass;
    };
    */
    
    
    
    
    
    J.isUndefined = isUndefined;
    J.isNull = isNull;
    J.isNumber = isNumber;
    J.isString = isString;
    J.isBoolean = isBoolean;
    J.isObject = isObject;
    J.isArray = isArray;
    J.isArguments = isArguments;
    J.isFunction = isFunction;
    J.$typeof = $typeof;
    
    J.$return = $return;
    J.$try = $try;
    
    J.emptyFunc = emptyFunc;
    
    J.clone = clone;

    J.getLength = getLength;
    J.checkJSON = checkJSON;
    J.random = random;
    J.extend = extend;
    
    J.now = now;
    J.timedChunk = timedChunk;
    
    
    J.rebuild = rebuild;
    J.pass = pass;
    J.bind = bind;
    J.bindNoEvent = bindNoEvent;
    

    
    J.Class = Class;
    J.Chunk = Chunk;
    


});
















/**
 * 3.[Browser part]: Browser 资料分析包
 */
Jx().$package(function(J){
    J.browserOptions = {
        adjustBehaviors: true,
        htmlClass: true
    };
    //J.query = J.string.mapQuery(window.location.search);
    J.host = window.location.host;
    
    // 设置 domain
    // document.domain = 'kdv.cn';
    
    
    var pf = navigator.platform.toLowerCase(),
        ua = navigator.userAgent.toLowerCase(),
        plug = navigator.plugins,
        
        platform,
        browser,
        engine,

        toFixedVersion,
        s;
    
    /**
     * @ignore
     * @param String ver
     * @param Number floatLength
     * @return Number 
     */
    toFixedVersion = function(ver, floatLength){
        ver= (""+ver).replace(/_/g,".");
        floatLength = floatLength || 1;
        ver = String(ver).split(".");
        ver = ver[0] + "." + (ver[1] || "0");
        ver = Number(ver).toFixed(floatLength);
        return ver;
    };
    
    /**
     * platform 名字空间
     * 
     * @namespace
     * @name platform
     * @type Object
     */
    platform = {
        getPlatform:function(){
            return pf;
        },
        
        /**
         * 操作系统的名称
         * 
         * @property name
         * @lends platform
         */
        name: (window.orientation != undefined) ? 'iPod' : (pf.match(/mac|win|linux/i) || ['unknown'])[0],
        
        version: 0,
        
        /**
         * 操作系统的版本号，如果是0表示不是此操作系统
         * iPod touch
         * Mozilla/5.0 (iPod; U; CPU iPhone OS 3_0 like Mac OS X; zh-cn) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16
         * 
         * @description {Num} 操作系统的版本号，如果是0表示不是此操作系统
         * @constant
         * @type Number
         */
        iPod: 0,
        
        /**
         * 操作系统的版本号，如果是0表示不是此操作系统
         * Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) version/4.0.4 Mobile/7B367 Safari/531.21.10
         * 
         * @description {Num} 操作系统的版本号，如果是0表示不是此操作系统
         * @constant
         * @type Number
         */
        iPad:0,
        
        /**
         * 操作系统的版本号，如果是0表示不是此操作系统
         * Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0_1 like Mac OS X; zh-cn) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A400 Safari/528.16
         * 
         * @description {Num} 操作系统的版本号，如果是0表示不是此操作系统
         * @constant
         * @type Number
         */
        iPhone:0,
        
        
        /**
         * 操作系统的版本号，如果是0表示不是此操作系统
         * Mozilla/5.0 (Linux; U; Android 2.0; en-us; Droid Build/ESD20) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17
         * 
         * @description {Num} 操作系统的版本号，如果是0表示不是此操作系统
         * @constant
         * @type Number
         */
        android:0,
        
        
        
        /**
         * 操作系统的版本号，如果是0表示不是此操作系统
         * 
         * 
         * @description {Num} 操作系统的版本号，如果是0表示不是此操作系统
         * @constant
         * @type Number
         */
        win: 0,
        
        /**
         * 操作系统的版本号，如果是0表示不是此操作系统
         * 
         * 
         * @description {Num} 操作系统的版本号，如果是0表示不是此操作系统
         * @constant
         * @type Number
         */
        linux: 0,
        
        /**
         * 操作系统的版本号，如果是0表示不是此操作系统
         * 
         * 
         * @description {Num} 操作系统的版本号，如果是0表示不是此操作系统
         * @constant
         * @type Number
         */
        mac: 0,
        
        /**
         * 设置浏览器类型和版本
         * 
         * @ignore
         * @private
         * @memberOf browser
         * 
         */
        set: function(name, ver){
            this.name = name;
            this.version = ver;
            this[name] = ver;
        }
    };
    
    platform[platform.name] = true;
    
    // 探测操作系统版本
    (s = ua.match(/windows ([\d.]+)/)) ? platform.set("win",toFixedVersion(s[1])):
    (s = ua.match(/windows nt ([\d.]+)/)) ? platform.set("win",toFixedVersion(s[1])):
    (s = ua.match(/linux ([\d.]+)/)) ? platform.set("linux",toFixedVersion(s[1])) :
    (s = ua.match(/mac ([\d.]+)/)) ? platform.set("mac",toFixedVersion(s[1])):
    (s = ua.match(/ipod ([\d.]+)/)) ? platform.set("iPod",toFixedVersion(s[1])):
    (s = ua.match(/ipad[\D]*os ([\d_]+)/)) ? platform.set("iPad",toFixedVersion(s[1])):
    (s = ua.match(/iphone ([\d.]+)/)) ? platform.set("iPhone",toFixedVersion(s[1])):
    (s = ua.match(/android ([\d.]+)/)) ? platform.set("android",toFixedVersion(s[1])) : 0;
    
    /**
     * browser 名字空间
     * 
     * @namespace
     * @name browser
     */
    browser = {
        /**
         * @namespace
         * @name features
         * @memberOf browser
         */
        features: 
        /**
         * @lends browser.features
         */    
        {
            /**
             * @property xpath
             */
            xpath: !!(document.evaluate),
            
            /**
             * @property air
             */
            air: !!(window.runtime),
            
            /**
             * @property query
             */
            query: !!(document.querySelector)
        },
        
        /**
         * 获取浏览器的插件信息
         * 
         */
        getPlugins: function(){
            return plug;
        },
        
        /**
         * @namespace
         * @name plugins
         * @memberOf browser
         */
        plugins: {
            flash: (function(){
                //var ver = "none";
                var ver = 0;
                if (plug && plug.length) {
                    flash = plug['Shockwave Flash'];
                    if (flash && flash.description) {
                        ver = toFixedVersion(flash.description.match(/\b(\d+)\.\d+\b/)[1], 1) || ver;
                    }
                } else {
                    var startVer = 13;
                    while (startVer--) {
                        try {
                            new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + startVer);
                            ver = toFixedVersion(startVer);
                            break;
                        } catch(e) {}
                    }
                }
                
                return ver;
            })()
        },
        
        
        
        /**
         * 获取浏览器的userAgent信息
         * 
         * @memberOf browser
         */
        getUserAgent: function(){
            return ua;
        },
        
        /**
         * 用户使用的浏览器的名称，如：chrome
         * 
         * 
         * @description {String} 用户使用的浏览器的名称，如：chrome
         * @type Number
         */
        name: "unknown",
        
        /**
         * @property version
         * @lends browser
         */
        version: 0,
        
        /**
         * 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * 
         * 
         * @description {Number} 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * @type Number
         */
        ie: 0,
        
        /**
         * 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * 
         * 
         * @description {Number} 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * @type Number
         */
        firefox: 0,
        
        /**
         * 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * 
         * 
         * @description {Number} 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * @type Number
         */
        chrome: 0,
        
        
        /**
         * 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * 
         * 
         * @description {Number} 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * @type Number
         */
        opera: 0,
        
        /**
         * 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * 
         * 
         * @description {Number} 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * @type Number
         */
        safari: 0,
        
        /**
         * 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * 
         * 
         * @description {Number} 用户使用的浏览器的版本号，如果是0表示不是此浏览器
         * @type Number
         */
        mobileSafari: 0,
        
        /**
         * 用户使用的是否是adobe 的air内嵌浏览器
         */
        adobeAir: 0,
        
        /**
         * 是否支持css3的borderimage
         * 
         * @description {boolean} 检测是否支持css3属性borderimage
         */
        //borderimage: false,
        
        /**
         * 设置浏览器类型和版本
         * 
         * @ignore
         * @private
         * @memberOf browser
         * 
         */
        set: function(name, ver){
            this.name = name;
            this.version = ver;
            this[name] = ver;
        }
    };
    
    // 探测浏览器并存入 browser 对象
    (s = ua.match(/msie ([\d.]+)/)) ? browser.set("ie",toFixedVersion(s[1])):
    (s = ua.match(/firefox\/([\d.]+)/)) ? browser.set("firefox",toFixedVersion(s[1])) :
    (s = ua.match(/chrome\/([\d.]+)/)) ? browser.set("chrome",toFixedVersion(s[1])) :
    (s = ua.match(/opera.([\d.]+)/)) ? browser.set("opera",toFixedVersion(s[1])) :
    (s = ua.match(/adobeair\/([\d.]+)/)) ? browser.set("adobeAir",toFixedVersion(s[1])) :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? browser.set("safari",toFixedVersion(s[1])) : 0;

    //mobile safari 判断，可与safari字段并存
    (s = ua.match(/version\/([\d.]+).*mobile.*safari/)) ? browser.set("mobileSafari",toFixedVersion(s[1])) : 0;
    if(platform.iPad) browser.set('mobileSafari', '0.0');
    
    //browser.set("borderimage",browser.firefox>3 || browser.safari || browser.chrome);
    
    if(browser.ie){
    	if(!document.documentMode) document.documentMode=Math.floor(browser.ie);
    	else if(document.documentMode!==Math.floor(browser.ie)) browser.set("ie",toFixedVersion(document.documentMode));
    }
	
    //J.out(browser.name);
    //J.out(browser.ua);
    
    //!!navigator.userAgent.match(/Apple.*Mobile.*Safari/);
    
    /**
     * engine 名字空间
     * 
     * @namespace
     * @name engine
     * @memberOf browser
     */
    engine = {
        /**
         * 浏览器的引擎名字
         * 
         * @memberOf browser.engine
         */
        name: 'unknown',
        
        /**
         * 浏览器的引擎版本
         * 
         * @memberOf browser.engine
         */
        version: 0,
        
        /**
         * trident 引擎的版本，0表示非此引擎
         * 
         * @lends browser.engine
         */
        trident: 0,
        
        /**
         * gecko 引擎的版本，0表示非此引擎
         * 
         * @lends browser.engine
         * 
         */
        gecko: 0,
        
        /**
         * webkit 引擎的版本，0表示非此引擎
         * 
         * @lends browser.engine
         */
        webkit: 0,
        
        /**
         * presto 引擎的版本，0表示非此引擎
         * 
         * @lends browser.engine
         * @property presto
         */
        presto: 0,
        
        /**
         * 设置浏览器引擎的类型和版本
         * 
         * @ignore
         * @private
         * @memberOf browser.engine
         * 
         */
        set: function(name, ver){
            this.name = name;
            this.version = ver;
            this[name] = ver;
        }
        
    };
    
    /*
    // 探测浏览器的内核并存入 browser.engine 对象
    (s = (!window.ActiveXObject) ? 0 : ((window.XMLHttpRequest) ? 5 : 4)) ? engine.set("trident", s):
    (s = (document.getBoxObjectFor == undefined) ? 0 : ((document.getElementsByClassName) ? 19 : 18)) ? engine.set("gecko",s) :
    (s = (navigator.taintEnabled) ? false : ((browser.features.xpath) ? ((browser.features.query) ? 525 : 420) : 419)) ? engine.set("webkit", s) :
    (s = (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925))) ? engine.set("presto", s) : 0;
    */
    
    // 探测浏览器的内核并存入 browser.engine 对象
    
    (s = ua.match(/trident\/([\d.]+)/)) ? engine.set("trident",toFixedVersion(s[1])):
    (s = ua.match(/gecko\/([\d.]+)/)) ? engine.set("gecko",toFixedVersion(s[1])) :
    (s = ua.match(/applewebkit\/([\d.]+)/)) ? engine.set("webkit",toFixedVersion(s[1])) :
    (s = ua.match(/presto\/([\d.]+)/)) ? engine.set("presto",toFixedVersion(s[1])) : 0;
    
    if(browser.ie){
        if(browser.ie == 6){
            engine.set("trident", toFixedVersion("4"));
        }else if(browser.ie == 7 || browser.ie == 8){
            engine.set("trident", toFixedVersion("5"));
        }
    }
    
    
    /**
     * 调整浏览器行为
     * 
     * @ignore
     */
    var adjustBehaviors = function() {
        // ie6 背景图片不能被缓存的问题
        if (browser.ie && browser.ie < 7) {
            try {
                document.execCommand('BackgroundImageCache', false, true);
            }catch(e){
                //J.out("错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
            }
        }
    }
    
    if(J.browserOptions.adjustBehaviors){
         adjustBehaviors();
    }
    
    var filterDot = function(string){
        //return J.string.replaceAll(string, "\.", "_");
        return String(string).replace(/\./gi,"_");
    };
    
    // 给html标签添加不同浏览器的参数className
    var addHtmlClassName = function() {
        var htmlTag = document.documentElement;
        var htmlClassName = [htmlTag.className];
        htmlClassName.push('javascriptEnabled');
        htmlClassName.push(platform.name);
        htmlClassName.push(platform.name + filterDot(platform.version));
        htmlClassName.push(browser.name);
        htmlClassName.push(browser.name + filterDot(browser.version));
        if(document.documentMode){
            htmlClassName.push('documentMode_' + document.documentMode);
        }
        htmlClassName.push(engine.name);
        htmlClassName.push(engine.name + filterDot(engine.version));
        
        if(browser.plugins.flash){
            htmlClassName.push("flash");
            htmlClassName.push("flash" + filterDot(browser.plugins.flash));
        }
        htmlTag.className = htmlClassName.join(' ');
    }

    
    if(J.browserOptions.htmlClass){
        addHtmlClassName();
    }
    
    



    
    
    
    
    
    
    
    

    
    J.platform = platform;
    J.browser = browser;
    J.browser.engine = engine;

    

    
});














/**
 * 4.[Browser part]: dom 扩展包
 */
Jx().$package(function(J){
    var $D,
        $B,
        id,
        name,
        tagName,
        getText,
        getAttributeByParent,
        node,
        setClass,
        getClass,
        hasClass,
        addClass,
        removeClass,
        toggleClass,
        replaceClass,
        setStyle,
        getStyle,
        setCssText,
        getCssText,
        addCssText,
        show,
        isShow,
        recover,
        hide,
        
        
        
        getScrollHeight,
        getScrollWidth,
        getClientHeight,
        getClientWidth,
        getOffsetHeight,
        getOffsetWidth,
        
        getScrollLeft,
        getScrollTop,
        getClientXY,
        setClientXY,
        getXY,
        setXY,
        getRelativeXY,
        getPosX,
        getPosY,
        getWidth,
        getHeight,
        
        getSelection,
        getSelectionText,
        getTextFieldSelection,
        
        contains,
    
        getDoc,
        _getDoc=null,
        getWin,
        w,
        getDocumentElement,
        DocumentElement;
    /**
     * dom 名字空间
     * 
     * @namespace
     * @name dom
     * @type Object
     */
    J.dom = J.dom || {};
    $D = J.dom;
    $B = J.browser;
    
        

    // find targeted window and @TODO create facades
    w = ($D.win) ? ($D.win.contentWindow) : $D.win  || window;
    $D.win = w;
    $D.doc = w.document;
    
    /**
     * 获取DocumentElement
     * 
     * @memberOf dom
     */
    getDocumentElement = function(){
        if(DocumentElement) {
            return DocumentElement;
        }
        if(document.compatMode === 'CSS1Compat'){
            DocumentElement= document.documentElement;
        }else{
            DocumentElement= document.body;
        }
        return DocumentElement;
        
    };
    
    /**
     * 获取元素所属的根文档
     * 
     * @memberOf dom
     */
    getDoc = function(element) {
        if(element) {
            element = element || window.document;
            _getDoc= (element["nodeType"] === 9) ? element : element["ownerDocument"]
                || $D.doc;
            return _getDoc;        
        }else {
            if(_getDoc) {
                return _getDoc;
            }
            else {
                element = element || window.document;
                _getDoc= (element["nodeType"] === 9) ? element : element["ownerDocument"]
                    || $D.doc;
                return _getDoc;
            }            
        }

    };
    
    /**
     * 获取元素所属的 window 对象
     * returns the appropriate window.
     * 
     * @memberOf dom
     * @private
     * @param {HTMLElement} element optional Target element.
     * @return {Object} The window for the given element or the default window. 
     */
    getWin = function(element) {
        var doc = getDoc(element);
        return (element.document) ? element : doc["defaultView"] ||
            doc["parentWindow"] || $D.win;
    };
    
    /**
     * 
     * 根据 id 获取元素
     * 
     * @method id
     * @memberOf dom
     * 
     * @param {String} id 元素的 id 名称
     * @param {Element} doc 元素所属的文档对象，默认为当前文档
     * @return {Element} 返回元素
     * 
     * @example
     * 
     * 
     */
    id = function(id, doc) {
        return getDoc(doc).getElementById(id);
    };
    
    /**
     * 
     * 根据 name 属性获取元素
     * 
     * @memberOf dom
     * 
     * @param {String} name 元素的 name 属性
     * @param {Element} doc 元素所属的文档对象，默认为当前文档
     * @return {Element} 返回元素
     */
    name = function(name, doc) {
        var el = doc;
        return getDoc(doc).getElementsByName(name);
    };
    
    /**
     * 
     * 根据 tagName 获取元素
     * 
     * @memberOf dom
     * 
     * @param {String} tagName 元素的 tagName 标签名
     * @param {Element} doc 元素所属的文档对象，默认为当前文档
     * @return {Element} 返回元素
     */
    tagName = function(tagName, el) {
        var el = el || getDoc();
        return el.getElementsByTagName(tagName);
    };
    
    /**
     * 获取元素中的文本内容
     * Returns the text content of the HTMLElement. 
     * 
     * @memberOf dom
     * @param {HTMLElement} element The html element. 
     * @return {String} The text content of the element (includes text of any descending elements).
     */
    getText = function(element) {
        var text = element ? element[TEXT_CONTENT] : '';
        if (text === UNDEFINED && INNER_TEXT in element) {
            text = element[INNER_TEXT];
        } 
        return text || '';
    };
    
    
    /**
     * 从起始元素查找某个属性，直到找到，或者到达顶层元素位置
     * Returns the text content of the HTMLElement. 
     * 
     * @memberOf dom
     * @param {HTMLElement} element The html element. 
     * @return {String} The text content of the element (includes text of any descending elements).
     */
    getAttributeByParent = function(attribute, startNode,  topNode){
        var jumpOut = false;
        var el = startNode;
        var result;
        do{
            result = el.getAttribute(attribute);
            // 如果本次循环未找到result
            if(J.isUndefined(result) || J.isNull(result)){
                // 如果本次循环已经到了监听的dom
                if(el === topNode){
                    jumpOut = true;
                }
                // 如果本次循环还未到监听的dom，则继续向上查找
                else {
                    el = el.parentNode;
                }
            }
            // 如果找到了result
            else{
                jumpOut = true;
            }
        }
        while(!jumpOut);
        
        return result;
    };
    
    
    /** 
     * 生成一个 DOM 节点
     * Generates an HTML element, this is not appended to a document
     * 
     * @memberOf dom
     * 
     * @param type {string} the type of element
     * @param attr {string} the attributes
     * @param win {Window} optional window to create the element in
     * @return {HTMLElement} the generated node
     */
    node = function(type, attrObj, win){
        var p,
        	w = win || $D.win,
        	d = document,
        	n = d.createElement(type);
		var mapObj = {
    		"class":function(){
    			n.className = attrObj["class"];
    		},
    		"style":function(){
    			setCssText(n, attrObj["style"]);
    		},
    		"html":function(){
    			n.innerHTML= attrObj["html"];
    		}
    	}
        for (p in attrObj) {
            if(mapObj[p]){
                mapObj[p]();
            }else{
                n.setAttribute(p, attrObj[p]);
            }
        }

        return n;
    };
    
    


    /**
     * 获取文档的 scroll 高度，即文档的实际高度
     * Returns the height of the document.
     * 
     * @method getDocumentHeight
     * @memberOf dom
     * 
     * @param {HTMLElement} element The html element. 
     * @return {Number} The height of the actual document (which includes the body and its margin).
     */
    getScrollHeight = function(el) {
        var scrollHeight;
        if(el){
            scrollHeight = el.scrollHeight;
        }else{
            scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        }
        return scrollHeight || 0;
    };
    
    /**
     * 获取文档的 scroll 宽度，即文档的实际宽度
     * Returns the width of the document.
     * 
     * @method getDocumentWidth
     * @memberOf dom
     * 
     * @param {HTMLElement} element The html element. 
     * @return {Int} The width of the actual document (which includes the body and its margin).
     */
    getScrollWidth = function(el) {
        var scrollWidth;
        if(el){
            scrollWidth = el.scrollWidth;
        }else{
            scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        }
        return scrollWidth || 0;
    };

    /**
     * 获取当前视窗的高度
     * Returns the current height of the viewport.
     * 
     * @method getClientHeight
     * @memberOf dom
     * @return {Int} The height of the viewable area of the page (excludes scrollbars).
     */
    getClientHeight = function(el) {
        //var name = J.browser.engine.name;
        el = el || getDocumentElement();
        return el.clientHeight; // IE, Gecko
    };
    
    /**
     * 获取元素的client宽度
     * Returns the current width of the viewport.
     * @method getClientWidth
     * @memberOf dom
     * @param {Element} el 要获取client宽度的元素
     * @return {Number} 宽度值.
     */
    
    getClientWidth = function(el) {
        //var name = J.browser.engine.name;
        el = el || getDocumentElement();
        return el.clientWidth; // IE, Gecko
    };
    
    
    /**
     * 获取当前视窗的高度
     * Returns the current height of the viewport.
     * 
     * @method getOffsetHeight
     * @memberOf dom
     * @return {Int} The height of the viewable area of the page (excludes scrollbars).
     */
    getOffsetHeight = function(el) {
        var name = J.browser.engine.name;
        el = el || getDocumentElement();
        return el.offsetHeight; 
    };
    
    /**
     * 获取元素的client宽度
     * Returns the current width of the viewport.
     * @method getOffsetWidth
     * @memberOf dom
     * @param {Element} el 要获取client宽度的元素
     * @return {Number} 宽度值.
     */
    getOffsetWidth = function(el) {
        var name = J.browser.engine.name;
        el = el || getDocumentElement();
        return el.offsetWidth;
    };
    
    /**
     * 获取当前文档的左边已卷动的宽度
     * Returns the left scroll value of the document 
     * @method getDocumentScrollLeft
     * @memberOf dom
     * @param {HTMLDocument} document (optional) The document to get the scroll value of
     * @return {Int}  The amount that the document is scrolled to the left
     */
    getScrollLeft = function(el) {
        var scrollLeft;
        if(el){
            scrollLeft = el.scrollLeft;
        }else{
            scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        }
        return scrollLeft || 0;
    };

    /**
     * 获取当前文档的上边已卷动的宽度
     * Returns the top scroll value of the document 
     * @method getDocumentScrollTop
     * @memberOf dom
     * @param {HTMLDocument} document (optional) The document to get the scroll value of
     * @return {Int}  The amount that the document is scrolled to the top
     */
    getScrollTop = function(el) {
        var scrollTop;
        if(el){
            scrollTop = el.scrollTop;
        }else{
            scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        }
        return scrollTop || 0;
    };

    
    /**
     * 
     * 设置元素的class属性
     * 
     * @method setClass
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} className class 名称
     */
    setClass = function(el, className){
        el.className = className;
    };
    
    /**
     * 
     * 获取元素的class属性
     * 
     * @method getClass
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} className class 名称
     */
    getClass = function(el){
        return el.className;
    };

    /**
     * 
     * 判断元素是否含有 class
     * 
     * @method hasClass
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} className class 名称
     */
    hasClass = function(el, className){
        var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
        return re.test(el.className);
    };

    /**
     * 
     * 给元素添加 class
     * 
     * @method addClass
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} className class 名称
     */
    addClass = function(el, className){
        if (!hasClass(el, className)){
            el.className = el.className + " " + className;
        }
    };

    /**
     * 
     * 给元素移除 class
     * 
     * @method addClass
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} className class 名称
     */
    removeClass = function(el, className){
        el.className = el.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
    };
    
    /*
    removeClass2 = function(el, className){
        replaceClass(el, className, "");
    };
    */
    
    
    /**
     * 
     * 对元素 class 的切换方法，即：如果元素用此class则移除此class，如果没有此class则添加此class
     * 
     * @method toggleClass
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} className class 名称
     */
    toggleClass = function(el, className){
        return hasClass(el, className) ? removeClass(el, className) : addClass(el, className);
    };

    /**
     * 
     * 替换元素 oldClassName 为 newClassName
     * 
     * @method toggleClass
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} oldClassName 被替换的 class 名称
     * @param {String} newClassName 要替换成的 class 名称
     */
    replaceClass = function(el, oldClassName, newClassName){
        removeClass(el, oldClassName);
        addClass(el, newClassName);
        //el.className = (" "+el.className+" ").replace(" "+oldClassName+" "," "+newClassName+" ");
    };
    /*
    replaceClass2 = function(el, oldClassName, newClassName){
        var i,
            tempClassNames = el.className.split(" ");
            
        for(i=0; i<tempClassNames.length; i++){
            if(tempClassNames[i] === oldClassName){
                tempClassNames[i] = newClassName;
            }
        }
        //J.out(tempClassNames);

        el.className = tempClassNames.join(" ");
    };
    */
    
    /**
     * 
     * 设置元素的样式，css 属性需要用驼峰式写法，如：fontFamily
     * 
     * @method setStyle
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} styleName css 属性名称
     * @param {String} value css 属性值
     */
    setStyle = function(el, styleName, value){
        if(!el){
            return;
        }
        
        var name = J.browser.name;
        if(styleName === "float" || styleName === "cssFloat"){
            if(name === "ie"){
                styleName = "styleFloat";
            }else{
                styleName = "cssFloat";
            }
        }
        
        //J.out(styleName);
        
        if(styleName === "opacity" && name === "ie" && J.browser.ie<9){
            var opacity = value*100;
            
            /*
            if(el.style.filter.alpha){
                
                el.style.filter.alpha.opacity = opacity;
                J.debug("filter alpha!")
            }else{
                addCssText(el,'filter:alpha(opacity="' + opacity + '")');
            }*/
            //addCssText(el,'filter:alpha(opacity="' + opacity + '")');
            //J.out(">>>el.style.filter.alpha.opacity: "+el.style.filter.alpha.opacity);
            el.style.filter = 'alpha(opacity="' + opacity + '")';

            if(!el.style.zoom){
                el.style.zoom = 1;
            }

            return;
        }
        el.style[styleName] = value;
    };
    
    

    
    /**
     * 
     * 获取元素的当前实际样式，css 属性需要用驼峰式写法，如：fontFamily
     * 
     * @method getStyle
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} styleName css 属性名称
     * @return {String} 返回元素样式
     */
    getStyle = function(el, styleName){
    	if(!el){
    		return;
    	}
    	
    	var win = getWin(el);
    	var name = J.browser.name;
    	//J.out(name);
		if(styleName === "float" || styleName === "cssFloat"){
    		if(name === "ie"){
    			styleName = "styleFloat";
    		}else{
    			styleName = "cssFloat";
    		}
    	}
    	if(styleName === "opacity" && name === "ie" && J.browser.ie<9){
    		var opacity = 1,
    			result = el.style.filter.match(/opacity=(\d+)/);
    		if(result && result[1]){
    			opacity = result[1]/100;
    		}
			return opacity;
    	}
    	
    	if(el.style[styleName]){
    		return el.style[styleName];
    	}else if(el.currentStyle){
    		//alert(el.currentStyle[styleName]);
    		return el.currentStyle[styleName];
    	}else if(win.getComputedStyle){
    		//J.out(win.getComputedStyle(el, null));
    		return win.getComputedStyle(el, null)[styleName];
    	}else if(document.defaultView && document.defaultView.getComputedStyle){
    		styleName = styleName.replace(/([/A-Z])/g, "-$1");
    		styleName = styleName.toLowerCase();
    		var style = document.defaultView.getComputedStyle(el, "");
    		return style && style.getPropertyValue(styleName);
    	}

    };
    
    
    
    
    /**
     * 
     * 给元素添加cssText
     *  
     * @method addCssText
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} cssText css 属性
     */
    addCssText = function(el, cssText){
        el.style.cssText += ';' + cssText;
    };
    
    /**
     * 
     * 给元素设置cssText
     *  
     * @method setCssText
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} cssText css 属性
     */
    setCssText = function(el, cssText){
        el.style.cssText = cssText;
    };
    /**
     * 
     * 获取元素的cssText
     *  
     * @method getCssText
     * @memberOf dom
     * 
     * @param {Element} el 元素
     */
    getCssText = function(el){
        return el.style.cssText;
    };
    
    /**
     * 
     * 显示元素
     * 
     * @method show
     * @memberOf dom
     * 
     * @param {Element} el 元素
     * @param {String} displayStyle 强制指定以何种方式显示，如：block，inline，inline-block等等
     */
    show = function(el, displayStyle){
        var display;
        var _oldDisplay = el.getAttribute("_oldDisplay");
        
        if(_oldDisplay){
            display = _oldDisplay;
        }else{
            display = getStyle(el, "display");
        }

        if(displayStyle){
            setStyle(el, "display", displayStyle);
        }else{
            if(display === "none"){
                setStyle(el, "display", "block");
            }else{
                setStyle(el, "display", display);
            }
        }
    };
    
    /**
     * 
     * 判断元素是否是显示状态
     * 
     * @method isShow
     * @memberOf dom
     * 
     * @param {Element} el 元素
     */
    isShow = function(el){
        var display = getStyle(el, "display");
        if(display === "none"){
            return false;
        }else{
            return true;
        }
    };
    
    /**
     * 
     * 还原元素原来的display属性
     * 
     * @method recover
     * @memberOf dom
     * 
     * @param {Element} el 元素
     */
    recover = function(el){
        var display;
        var _oldDisplay = el.getAttribute("_oldDisplay");
        
        if(_oldDisplay){
            display = _oldDisplay;
        }else{
            display = getStyle(el, "display");
        }
        if(display === "none"){
            setStyle(el, "display", "");
        }else{
            setStyle(el, "display", display);
        }
    };
    
    /**
     * 
     * 隐藏元素
     * 
     * @method hide
     * @memberOf dom
     * 
     * @param {Element} el 元素
     */
    hide = function(el){
        var display = getStyle(el, "display");
        var _oldDisplay = el.getAttribute("_oldDisplay");
        
        if(!_oldDisplay){
            if(display === "none"){
                el.setAttribute("_oldDisplay", "");
            }else{
                el.setAttribute("_oldDisplay", display);
            }
        }
        setStyle(el, "display", "none");
    };
    
    
    
    /**
     * 获取对象坐标
     *
     * @method getClientXY
     * @memberOf dom
     * 
     * @param {HTMLElement} el
     * @return Array [left,top]
     * @type Array
     */
    getClientXY = function(el) {
        var _t = 0,
            _l = 0;

        if (el) {
            //这里只检查document不够严谨, 在el被侵染置换(jQuery做了这么恶心的事情)
            //的情况下, el.getBoundingClientRect() 调用回挂掉
            if (document.documentElement.getBoundingClientRect && el.getBoundingClientRect) { // 顶IE的这个属性，获取对象到可视范围的距离。
                //现在firefox3，chrome2，opera9.63都支持这个属性。
                var box = {left:0,top:0,right:0,bottom:0};//
                try{
                    box=el.getBoundingClientRect();
                }catch(ex){
                    return [0,0];
                }
                var oDoc = el.ownerDocument;
                
                var _fix = J.browser.ie ? 2 : 0; //修正ie和firefox之间的2像素差异
                
                _t = box.top - _fix + getScrollTop(oDoc);
                _l = box.left - _fix + getScrollLeft(oDoc);
            } else {//这里只有safari执行。
                while (el.offsetParent) {
                    _t += el.offsetTop;
                    _l += el.offsetLeft;
                    el = el.offsetParent;
                }
            }
        }
        return [_l, _t];
    };
    
    /**
     * 设置dom坐标
     * 
     * @method setClientXY
     * @memberOf dom
     
     * @param {HTMLElement} el
     * @param {string|number} x 横坐标
     * @param {string|number} y 纵坐标
     */
    setClientXY = function(el, x, y) {
        x = parseInt(x) + getScrollLeft();
        y = parseInt(y) + getScrollTop();
        setXY(el, x, y);
    };

    /**
     * 获取对象坐标
     * 
     * @method getXY
     * @memberOf dom
     *
     * @param {HTMLElement} el
     * @return Array [top,left]
     * @type Array
     */
    getXY = function(el) {
        var xy = getClientXY(el);

        xy[0] = xy[0] + getScrollLeft();
        xy[1] = xy[1] + getScrollTop();
        return xy;
    }

    /**
     * 设置dom坐标
     * @method setXY
     * @memberOf dom
     * 
     * @param {HTMLElement} el
     * @param {string|number} x 横坐标
     * @param {string|number} y 纵坐标
     */
    setXY = function(el, x, y) {
        var _ml = parseInt(getStyle(el, "marginLeft")) || 0;
        var _mt = parseInt(getStyle(el, "marginTop")) || 0;

        setStyle(el, "left", parseInt(x) - _ml + "px");
        setStyle(el, "top", parseInt(y) - _mt + "px");
    };
    
    /**
     * 获取对象坐标
     *
     * @method getRelativeXY
     * @memberOf dom
     * 
     * @param {HTMLElement} el
     * @return Array [top,left]
     * @type Array
     */
    getRelativeXY = function(el, relativeEl) {
        var xyEl = getXY(el);
        var xyRelativeEl = getXY(relativeEl);
        var xy=[];
        
        xy[0] = xyEl[0] - xyRelativeEl[0];
        xy[1] = xyEl[1] - xyRelativeEl[1];
        return xy;
    }
    
    var parseCssPx = function(value){
        if(!value || value == 'auto') return 0;
        else return parseInt(value.substr(0, value.length-2));
    }
    getPosX = function(el){
        return parseCssPx($D.getStyle(el, 'left'));
    }
    getPosY = function(el){
        return parseCssPx($D.getStyle(el, 'top'));
    }
    getWidth = function(el){
        return parseCssPx($D.getStyle(el, 'width'));
    }
    getHeight = function(el){
        return parseCssPx($D.getStyle(el, 'height'));
    }
    
    /**
     * 获取选择的文本
     *
     * @method getSelectionText
     * @memberOf dom
     * 
     * @param {Window} win
     * @return {String} 返回选择的文本
     */
    getSelectionText = function(win) {
        win = win || window;
        var doc = win.document;
        if (win.getSelection) {
            // This technique is the most likely to be standardized.
            // getSelection() returns a Selection object, which we do not document.
            return win.getSelection().toString();
        }else if (doc.getSelection) {
            // This is an older, simpler technique that returns a string
            return doc.getSelection();
        }else if (doc.selection) {
            // This is the IE-specific technique.
            // We do not document the IE selection property or TextRange objects.
            return doc.selection.createRange().text;
        }
    
    };


    /**
     * FireFox 下获取 input 或者 textarea 中选中的文字
     *
     * @method getTextFieldSelection
     * @memberOf dom
     * 
     * @param {HTMLElement} el
     * @return {String} 返回选择的文本
     */
    getTextFieldSelection = function(el) {
        if (el.selectionStart != undefined && el.selectionEnd != undefined) {
            var start = el.selectionStart;
            var end = el.selectionEnd;
            return el.value.substring(start, end);
        }else{
            return ""; // Not supported on this browser
        }
    
    };
    
    /**
     * 判断一个节点是否是某个父节点的子节点, 
     * 默认不包含parent === child的情况
     * @param {HTMLElement} parent
     * @param {HTMLElement} child
     * @param {Boolean} containSelf 指示是否包括parent等于child的情况
     * @return {Boolean} 包含则返回true
     */
    contains = function(parent, child, containSelf){
        if(!containSelf && parent === child){
            return false;
        }
        if(parent.compareDocumentPosition){//w3c
            var res = parent.compareDocumentPosition(child);
            if(res == 20 || res == 0){
                return true;
            }
        }else{
            if(parent.contains(child)){//ie
                return true;
            }
        }
        return false;
    };
    
    
    
    
    
    
    var scripts = tagName("script");
    for(var i=0; i<scripts.length; i++){
        
        if(scripts[i].getAttribute("hasJx")=="true"){
            //J.out("hasJx: "+(scripts[i].getAttribute("hasJx")=="true"));
            J.src = scripts[i].src;
        }
    }
    if(!J.src){
        J.src = scripts[scripts.length-1].src;
    }
    
    J.filename = J.src.replace(/(.*\/){0,}([^\\]+).*/ig,"$2");
    //J.out(J.src+" _ "+J.filename)
    J.path = J.src.split(J.filename)[0];
    
    
    $D.getDoc = getDoc;
    
    $D.id = id;
    $D.name = name;
    $D.tagName = tagName;
    $D.getText = getText;
    $D.getAttributeByParent = getAttributeByParent;
    $D.node = node;
    $D.setClass = setClass;
    $D.getClass = getClass;
    $D.hasClass = hasClass;
    
    $D.addClass = addClass;
    $D.removeClass = removeClass;
    $D.toggleClass = toggleClass;
    $D.replaceClass = replaceClass;
    
    $D.setStyle = setStyle;
    $D.getStyle = getStyle;
    
    $D.setCssText = setCssText;
    $D.getCssText = getCssText;
    $D.addCssText = addCssText;
    
    $D.show = show;
    $D.isShow = isShow;
    $D.recover = recover;
    $D.hide = hide;
    
    
    $D.getScrollLeft = getScrollLeft;
    $D.getScrollTop = getScrollTop;
    $D.getScrollHeight = getScrollHeight;
    $D.getScrollWidth = getScrollWidth;
    
    $D.getClientHeight = getClientHeight;
    $D.getClientWidth = getClientWidth;
    
    $D.getOffsetHeight = getOffsetHeight;
    $D.getOffsetWidth = getOffsetWidth;
    
    $D.getClientXY = getClientXY;
    $D.setClientXY = setClientXY;
    
    $D.getXY = getXY;
    $D.setXY = setXY;
    $D.getRelativeXY = getRelativeXY;
    $D.getPosX = getPosX;
    $D.getPosY = getPosY;
    $D.getWidth = getWidth;
    $D.getHeight = getHeight;
    $D.getSelection = getSelection;
    $D.getSelectionText = getSelectionText;
    
    $D.getTextFieldSelection = getTextFieldSelection;
    
    $D.getDocumentElement = getDocumentElement;
    
    $D.contains = contains;
    
});


/**
 * 5.[Browser part]: event 扩展包
 */
Jx().$package(function(J){
    var $E,
        addEventListener,
        addOriginalEventListener,
        removeEventListener,
        removeOriginalEventListener,
        customEvent,
        customEventHandlers=[],
        onDomReady,
        isDomReady,
        Publish,
        addObserver,
        addObservers,
        notifyObservers,
        removeObserver,
        standardizeEvent,
        packageContext=this;
    /**
     * event 名字空间
     * 
     * @namespace
     * @name event
     */
    J.event = J.event || {};
    
    $E = J.event;
    /*
         经典的彩蛋必备代码:老外称之为 Tweetable Konami code
        [上上下下左右左右BA]
        var k=[];
        addEventListener("keyup",function(e){ 
           k.push(e.keyCode);
           if(k.toString().indexOf("38,38,40,40,37,39,37,39,66,65")>=0){      
               cheat();
           }
        },true);
        
        什么不知道 Konami Code? 只能说明你没童年了 - -!
        http://en.wikipedia.org/wiki/Konami_Code
     */
    //az
    /**
     * standardize the ie event
     */
    standardizeEvent = function(e, element){
        if(!e){
            e = window.event;
        }
        var element = element || e.srcElement;
        var eventDocument = document,
			doc = eventDocument.documentElement,
			body = eventDocument.body;
        var event = {
            _event: e,// In case we really want the IE event object
            
            type: e.type,           // Event type
            target: e.srcElement,   // Where the event happened
            currentTarget: element, // Where we're handling it
            relatedTarget: e.fromElement ? e.fromElement : e.toElement,
            eventPhase: (e.srcElement == element) ? 2 : 3,

            // Mouse coordinates
            clientX: e.clientX,
            clientY: e.clientY,
            screenX: e.screenX,
            screenY: e.screenY,
            layerX: e.offsetX,
            layerY: e.offsetY,
            pageX: e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0),
            pageY: e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0),
            wheelDelta: e.wheelDelta || -40*(e.detail || 0),
            
           // Key state
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            //原有的charCode
            charCode: e.keyCode,
            
            //keyCode
            keyCode: e.keyCode,
            /*
             * keyCode 值附表：
             * ===============================
             * 
             * 1.主键盘区字母和数字键的键码值
             * 按键   键码
             * 0    48
             * 1    49
             * 2    50
             * 3    51
             * 4    52
             * 5    53
             * 6    54
             * 7    55
             * 8    56
             * 9    57
             * 
             * A    65
             * B    66
             * C    67
             * D    68
             * E    69
             * F    70
             * G    71
             * H    72
             * I    73
             * J    74
             * K    75
             * L    76
             * M    77
             * N    78
             * O    79
             * P    80
             * Q    81
             * R    82
             * S    83
             * T    84
             * U    85
             * V    86
             * W    87
             * X    88
             * Y    89
             * Z    90
             * 
             * 
             * 3.控制键键码值
             * 按键           键码
             * BackSpace    8
             * Tab          9
             * Clear        12
             * Enter        13
             * Shift        16
             * Control      17
             * Alt          18
             * Cape Lock    20
             * Esc          27
             * Spacebar     32 
             * Page Up      33
             * Page Down    34
             * End          35
             * Home         36
             * Left Arrow   37
             * Up Arrow     38
             * Right Arrow  39
             * Down Arrow   40
             * Insert       45
             * Delete       46
             * 
             * Num Lock     144
             * 
             * ;:           186
             * =+           187
             * ,<           188
             * -_           189
             * .>           190
             * /?           191
             * `~           192
             * 
             * [{           219
             * \|           220
             * }]           221
             * ’"           222
             * 
             * 2.功能键键码值
             * F1   112
             * F2   113
             * F3   114
             * F4   115
             * F5   116
             * F6   117
             * F7   118
             * F8   119
             * F9   120
             * F10  121
             * F11  122
             * F12  123
             * 
             * 2.数字键盘上的键的键码值
             * 按键   键码
             * 0    96
             * 1    97
             * 2    98
             * 3    99
             * 4    100
             * 5    101
             * 6    102
             * 7    103
             * 8    104
             * 9    105
             * 
             * *    106
             * +    107
             * Enter108
             * -    109
             * .    110
             * /    111
             * 
             */

            stopPropagation: function(){
                this._event.cancelBubble = true;
            },
            preventDefault: function(){
                this._event.returnValue = false;
            }
        }
        /*
         *  relatedTarget 事件属性返回与事件的目标节点相关的节点。
         *  对于 mouseover 事件来说，该属性是鼠标指针移到目标节点上时所离开的那个节点。
         *  对于 mouseout 事件来说，该属性是离开目标时，鼠标指针进入的节点。
         *  对于其他类型的事件来说，这个属性没有用。
         *  az 2011/3/11
         */
        var eventType = e.type.toLowerCase();
        if(eventType == 'mouseover'){
            event.relatedTarget = e.fromElement;
        }else if(eventType == 'mouseout'){
            event.relatedTarget = e.toElement;
        }
        
        if(!J.isUndefined(e.button)){
            var v = e.button;
            var btnCodeMap = {
                0: -1,//取消原来的值
                1: 0,//左键
                2: 2,//右键
                3: -1,//取消原来的值
                4: 1//中键
            };
            /*
             * ie 的鼠标按键值
             * 0 没按键 
             * 1 按左键 
             * 2 按右键 
             * 3 按左右键 
             * 4 按中间键 
             * 5 按左键和中间键 
             * 6 按右键和中间键 
             * 7 按所有的键
             */
            if(!J.isUndefined(btnCodeMap[v])){
                event.button = btnCodeMap[v];
            }else{
                event.button = v;
            }
        }
        return event;
    };
    
    // From: David Flanagan.
    
    // In IE 5 and later, we use attachEvent( ) and detachEvent( ), with a number of
    // hacks to make them compatible with addEventListener and removeEventListener.
    if (J.browser.ie/*document.attachEvent*/) {//这里不能用特性判断, 否则opera也会使用这个方法绑定事件
        //ie都用这个方法是因为ie9对标准的addEventListener支持不完整
        /**
         * 兼容ie的写法
         * @ignore
         */
        addEventListener = function(element, eventType, handler,options) {
            if(customEvent["on"+eventType]){
                customEvent["on"+eventType](element, eventType, handler,options);
                return;
            }
            addOriginalEventListener(element, eventType, handler);
        };
        addOriginalEventListener = function(element, eventType, handler) {
            if ($E._find(arguments) != -1){
                return;
            }
        
            var wrappedEvent = function(e){
                
                var event = standardizeEvent(e, element);

                if (Function.prototype.call){
                    handler.call(element, event);
                }else {
                    // If we don't have Function.call, fake it like this.
                    element._currentHandler = handler;
                    element._currentHandler(event);
                    element._currentHandler = null;
                }
            };
    
            // Now register that nested function as our event handler.
            element.attachEvent("on" + eventType, wrappedEvent);
    

            var h = {
                element: element,
                eventType: eventType,
                handler: handler,
                wrappedEvent: wrappedEvent
            };
    

            var d = element.document || element;
            // Now get the window associated with that document.
            var w = d.parentWindow || window;
    
            // We have to associate this handler with the window,
            // so we can remove it when the window is unloaded.
            var id = $E._uid();  // Generate a unique property name
            if (!w._allHandlers) w._allHandlers = {};  // Create object if needed
            w._allHandlers[id] = h; // Store the handler info in this object
    
            // And associate the id of the handler info with this element as well.
            if (!element._handlers) element._handlers = [];
            element._handlers.push(id);
    
            // If there is not an onunload handler associated with the window,
            // register one now.
            if (!w._onunloadEventRegistered) {
                w._onunloadEventRegistered = true;
                w.attachEvent("onunload", $E._removeAllEvents);
            }
        };
        
        /**
         * 兼容ie的写法
         * @ignore
         */
        removeEventListener = function(element, eventType, handler) {
            if(customEvent["off"+eventType]){
                customEvent["off"+eventType](element, eventType,handler);
                return;
            }
            if(arguments.length == 3){
                removeOriginalEventListener(element, eventType, handler);
            }else{
                removeOriginalEventListener(element, eventType);
            }
        };
        removeOriginalEventListener = function(element, eventType, handler) {
            // Find this handler in the element._handlers[] array.
            var handlersIndex = $E._find(arguments);
            if (handlersIndex == -1) return;  // If the handler was not registered, do nothing
            // Get the window of this element.
            var d = element.document || element;
            var w = d.parentWindow || window;
            for(var j=0; j<handlersIndex.length; j++){
                var i = handlersIndex[j];
                // Look up the unique id of this handler.
                var handlerId = element._handlers[i];
                // And use that to look up the handler info.
                var h = w._allHandlers[handlerId];
                // Using that info, we can detach the handler from the element.
                element.detachEvent("on" + h.eventType, h.wrappedEvent);
                // Remove one element from the element._handlers array.
                element._handlers[i]=null;
                element._handlers.splice(i, 1);
                // And delete the handler info from the per-window _allHandlers object.
                delete w._allHandlers[handlerId];
            }
            if(element._handlers && element._handlers.length==0){
                element._handlers=null;
            }
        };
    
        // A utility function to find a handler in the element._handlers array
        // Returns an array index or -1 if no matching handler is found
        $E._find = function(args) {
            var element = args[0],
                eventType = args[1],
                handler = args[2],
                handlers = element._handlers;
                
            if (!handlers){
                return -1;  // if no handlers registered, nothing found
            }
    
            // Get the window of this element
            var d = element.document || element;
            var w = d.parentWindow || window;
    
            var handlersIndex = [];

            if(args.length === 3){
                // Loop through the handlers associated with this element, looking
                // for one with the right type and function.
                // We loop backward because the most recently registered handler
                // is most likely to be the first removed one.
                for(var i = handlers.length-1; i >= 0; i--) {
                    var handlerId = handlers[i];        // get handler id
                    var h = w._allHandlers[handlerId];  // get handler info
                    // If handler info matches type and handler function, we found it.
                    if (h.eventType == eventType && h.handler == handler){
                        handlersIndex.push(i);
                        return handlersIndex;
                    }
                }
            }else if(args.length === 2){
                
                for(var i = handlers.length-1; i >= 0; i--) {
                    var handlerId = handlers[i];        // get handler id
                    var h = w._allHandlers[handlerId];  // get handler info
                    // If handler info matches type and handler function, we found it.
                    if (h.eventType == eventType){
                        handlersIndex.push(i);
                    }
                }
                if(handlersIndex.length>0){
                    return handlersIndex;
                }
                
            }else if(args.length === 1){

                for(var i = handlers.length-1; i >= 0; i--) {
                    handlersIndex.push(i);
                }
                if(handlersIndex.length>0){
                    return handlersIndex;
                }
            }
            
            
            
            
            
            
            return -1;  // No match found
        };
    
        $E._removeAllEvents = function( ) {
            // This function is registered as the onunload handler with
            // attachEvent. This means that the this keyword refers to the
            // window in which the event occurred.
            var id,
                w = this;
    
            // Iterate through all registered handlers
            for(id in w._allHandlers) {
                // It would throw a refused access error
                // so I catch it. by azrael.
//                try{
//                    J.out('RemoveEvent: ' + id, 'RemoveAllEvents');
                    // Get handler info for this handler id
                    var h = w._allHandlers[id];
                    // Use the info to detach the handler
                    h.element.detachEvent("on" + h.eventType, h.wrappedEvent);
                    h.element._handlers=null;
                    // Delete the handler info from the window
                    delete w._allHandlers[id];
//                }catch(e){
//                    J.out('RemoveEventError: ' + e, 'RemoveAllEvents');
//                }
            }
        }
    
        // Private utility to generate unique handler ids
        $E._counter = 0;
        $E._uid = function(){
            return "h" + $E._counter++;
        };
    }
    // In DOM-compliant browsers, our functions are trivial wrappers around
    // addEventListener( ) and removeEventListener( ).
    else if (document.addEventListener) {
        /**
         * 
         * 添加事件监听器
         * 
         * @method addEventListener
         * @memberOf Event
         * 
         * @param element 元素
         * @param eventType 事件类型，不含on
         * @param handler 事件处理器
         * @return {Element} 返回元素
         */
        addEventListener = function(element, eventType, handler, options) {
            //var id = $E._uid( );  // Generate a unique property name
            if(customEvent["on"+eventType]){
                customEvent["on"+eventType](element, eventType, handler, options);
                return;
            }
            addOriginalEventListener(element, eventType, handler);
        };
        addOriginalEventListener = function(element, eventType, handler) {
            var isExist = false;
            if(!element){
                J.out('targetModel undefined:'+eventType+handler);
            }
            if(!element._eventTypes){
                element._eventTypes = {};
            }
            if (!element._eventTypes[eventType]){
                element._eventTypes[eventType] = [];
            }
            element.addEventListener(eventType, handler, false);
            
            var handlers= element._eventTypes[eventType];
            for(var i=0; i<handlers.length; i++){
                if(handlers[i] == handler){
                    isExist = true;
                    break;
                }
            }
            if(!isExist){
                handlers.push(handler);
            }
        };
        
        /**
         * 
         * 移除事件监听器
         * 
         * @memberOf event
         * @method removeEventListener
         * 
         * @param element 元素
         * @param eventType 事件类型，不含on
         * @param handler 事件处理器
         * @return {Element} 返回元素
         */
        removeEventListener = function(element, eventType, handler) {
            if(customEvent["off"+eventType]){
                customEvent["off"+eventType](element, eventType,handler);
                return;
            }
            if(arguments.length == 3){
                removeOriginalEventListener(element, eventType, handler);
            }else{
                removeOriginalEventListener(element, eventType);
            }
        };
        removeOriginalEventListener = function(element, eventType, handler) {
            if(eventType){
                if(arguments.length == 3){//修复传入了第三个参数,但是第三个参数为 undefined 的问题
                    if(handler){
                        element.removeEventListener(eventType, handler, false);
                        if(element._eventTypes && element._eventTypes[eventType]){
                            var handlers = element._eventTypes[eventType];
                            for(var i=0; i<handlers.length; i++){
                                if(handlers[i] === handler){
                                    handlers[i]=null;
                                    handlers.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }else{
//                        J.out('removeEventListener: handler is undefined. \n caller: '+ removeEventListener.caller);
                        //J.out('removeEventListener: handler is undefined. \n element: '+ element + ', eventType:' + eventType);
                    }
                }else{
                    
                    if(element._eventTypes && element._eventTypes[eventType]){
                        var handlers = element._eventTypes[eventType];
                        
                        for(var i=0; i<handlers.length; i++){
                            element.removeEventListener(eventType, handlers[i], false);
                        }
                        element._eventTypes[eventType] = [];
                    }
                    
                }
            }else{
                if(element._eventTypes){
                    var eventTypes = element._eventTypes;
                    for(var p in eventTypes){
                        var handlers = element._eventTypes[p];
                        for(var i=0; i<handlers.length; i++){
                            element.removeEventListener(p, handlers[i], false);
                        }
                    }
                    eventTypes = {};
                }
            }
            
        };
    }
    customEvent = {
        "ondrag" : function(element, eventType, handler){
            var _oldX,
                _oldY,
                isMove=false,
                orientMousedownEvent;
            var onElMousedown = function(e){
                if(!J.browser.mobileSafari && e.button !== 0){//非左键点击直接return
                    return;
                }
                var touch;
                orientMousedownEvent = e;
                if(J.browser.mobileSafari){
                    //console.info("touchstart");
                    e.stopPropagation();
                    touch = e.touches[0];
                    _oldX= touch.pageX;
                    _oldY= touch.pageY;
                }else{
                    //TODO 这里阻止了事件冒泡,可能会有问题
                    e.stopPropagation();
                    e.preventDefault();
                    _oldX= e.clientX;
                    _oldY= e.clientY;
                }
                isMove=false;
                if(J.browser.mobileSafari){
                    $E.addEventListener(document, "touchmove", onElMousemove);
                    $E.addEventListener(element, "touchend", onElMouseup);
                }else{
                    $E.addEventListener(document, "mousemove", onElMousemove);
                }
//                J.out('onElMousedown: '+e.target.id );
            };
            var onElMousemove = function(e){
                if(!J.browser.mobileSafari && e.button !== 0){//非左键点击直接return
                    return;
                }
                var x,y,touch;
                e.stopPropagation();
                if(J.browser.mobileSafari){
                    //console.info("touchmove");
                    touch = e.changedTouches[0];
                    x= touch.pageX;
                    y= touch.pageY;
                }else{
                    x = e.clientX;
                    y = e.clientY;
                }
                if(Math.abs(_oldX-x)+Math.abs(_oldY-y)>2) {
//                    J.out("customdrag");
                    //console.info("customdrag");
                    if(J.browser.mobileSafari){
                        $E.removeEventListener(document, "touchmove", onElMousemove);
                        $E.removeEventListener(element, "touchend", onElMouseup);
                    }else{
                        $E.removeEventListener(document, "mousemove", onElMousemove);
                    }
                    if(!isMove){
                        handler.call(element,e);
                        isMove=true;
                    }
                }else{
                    //console.info( Math.abs(_oldX-x)+Math.abs(_oldY-y)>2 )
                }
            };
            var onElMouseup = function(e){
                if(!J.browser.mobileSafari && e.button !== 0){//非左键点击直接return
                    return;
                }
                /*
                var x,y,touch;
                if(J.browser.mobileSafari){
                    touch = e.touches[0];
                    _oldX= touch.pageX;
                    _oldY= touch.pageY;
                }else{
                    x = e.clientX;
                    y = e.clientY;
                }
                if(Math.abs(_oldX-x)+Math.abs(_oldY-y)<2) {
                    isMove=false;
                    if(J.browser.mobileSafari){
                        $E.removeEventListener(document, "touchmove", onElMousemove);
                    }else{
                        $E.removeEventListener(document, "mousemove", onElMousemove);
                    }
                }else{
                    
                }
                */
                //console.info("touch end");
                if(J.browser.mobileSafari){
                    $E.removeEventListener(document, "touchmove", onElMousemove);
                    if(!isMove){
                        //console.info("not draging");
                        /*
                        var point = e.changedTouches[0];
                        target = document.elementFromPoint(point.pageX,point.pageY); 
                        if(target.tagName=="IFRAME"){
                            return;
                        }else{
                        }
                        // Create the fake event
                        ev = document.createEvent('MouseEvents');
                        ev.initMouseEvent('click', true, true, e.view, 1,
                            point.screenX, point.screenY, point.clientX, point.clientY,
                            e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                            0, null);
                        ev._fake = true;
                        target.dispatchEvent(ev);
                        */
                    }else{
                        e.stopPropagation();
                        e.preventDefault();
                        //console.info("is draging");
                    }
                }else{
                    $E.removeEventListener(document, "mousemove", onElMousemove);
                    if(!isMove){
                        //@TODO fire the event
                    }
                }
            };
            if(J.browser.mobileSafari){
                $E.addEventListener(element, "touchstart", onElMousedown);
            }else{
                $E.addEventListener(element, "mousedown", onElMousedown);
                $E.addEventListener(element, "mouseup", onElMouseup);
            }
//            J.out('element: ' + element.id);
            customEventHandlers.push({"element":element,"eventType":eventType,handler:handler,"actions":[onElMousedown,onElMouseup]});
        },
        "offdrag" : function(element, eventType,handler){
            for(var i in customEventHandlers){
                if(customEventHandlers[i].handler==handler&&customEventHandlers[i].element==element&&customEventHandlers[i].eventType==eventType){
                    if(J.browser.mobileSafari){
                        $E.removeEventListener(element, "touchstart",customEventHandlers[i].actions[0]);
                        $E.removeEventListener(element, "touchend",customEventHandlers[i].actions[1]);
                    }else{
                        $E.removeEventListener(element, "mousedown",customEventHandlers[i].actions[0]);
                        $E.removeEventListener(element, "mouseup",customEventHandlers[i].actions[1]);
                    }
                    customEventHandlers.splice(i,1);
                    break;
                }
            }
        },
        "oncustomclick" : function(element, eventType, handler, options){//@ longTouchable 是否触发长按事件 add by ip
            var _oldX,
                _oldY,
                isMove=false,
                isClicked = false,
                timeStamp=0,
                longTouchTimer,
                options= options?options:{},
                longtouchable = options.longtouchable,
                mouseButton = -1;
            var onElMousedown = function(e){
//                console.log('1: ' + e.button);
                timeStamp = e.timeStamp;
                isMove = false;
                if(!J.browser.mobileSafari && e.button !== 0){//非左键点击直接return
                    return;
                }
                var touch;
                if(J.browser.mobileSafari){
                    touch = e.changedTouches[0];
                    _oldX = touch.pageX;
                    _oldY = touch.pageY;
                }else{
                    _oldX = e.clientX;
                    _oldY = e.clientY;
                }
                isClicked = false;
                if(longtouchable){
                    longTouchTimer = setTimeout(function(){
                        if(isMove || isClicked){
                            return;
                        }
                        var clickTime = 2000;//TODO (new Date()).getTime() - timeStamp;
                        //console.info('setTimeout',clickTime);
                        if(J.browser.mobileSafari){
                            $E.removeEventListener(element, "touchmove",onElMouseMove);
                            $E.removeOriginalEventListener(element, "touchend",onElClick);
                        }else{
                            $E.removeEventListener(element, "mousemove",onElMouseMove);
                            $E.removeOriginalEventListener(element, "click",onElClick);
                        }
                        handler.call(element,e,clickTime);
                    },1000);
                }
                if(J.browser.mobileSafari){
                    $E.addEventListener(element, "touchmove", onElMouseMove);
                    $E.addOriginalEventListener(element, "touchend", onElClick);
                }else{
                    $E.addEventListener(element, "mousemove", onElMouseMove);
                    $E.addOriginalEventListener(element, "click", onElClick);
                }
//                e.preventDefault();
//                e.stopPropagation();
            };    
            var onElMouseup = function(e){
                mouseButton = e.button;
//                console.log('2: ' + e.button);
                if(!J.browser.mobileSafari && e.button !== 0){//非左键点击直接return
                    return;
                }
                if(J.browser.mobileSafari){
                    touch = e.changedTouches[0];
                    var x = touch.pageX;
                    var y = touch.pageY;
                }
            };
            var onElMouseMove = function(e){
                if(J.browser.mobileSafari){
                    touch = e.changedTouches[0];
                    var x = touch.pageX;
                    var y = touch.pageY;
                }else{
                    var x = e.clientX;
                    var y = e.clientY;
                }
                isMove = Math.abs(_oldX-x)+Math.abs(_oldY-y) > 1;
                if(isMove){
                    clearTimeout(longTouchTimer);
                    longTouchTimer = null;
                    if(J.browser.mobileSafari){
                        $E.removeEventListener(element, "touchmove",onElMouseMove);
                        $E.removeOriginalEventListener(element, "touchend",onElClick);
                    }else{
                        $E.removeEventListener(element, "mousemove",onElMouseMove);
                        $E.removeOriginalEventListener(element, "click",onElClick);
                    }
                }
            }
            var onElClick = function(e){
                //console.info('clicked');
                clearTimeout(longTouchTimer);
                longTouchTimer = null;
                isClicked = true;
                if(!J.browser.mobileSafari && mouseButton !== 0){//非左键点击直接return
                    return;
                }
                var touch;
                var clickTime = 0;//e.timeStamp - timeStamp;
                if(J.browser.mobileSafari){
                    touch = e.changedTouches[0];
                    var x = touch.pageX;
                    var y = touch.pageY;
                }else{
                    var x = e.clientX;
                    var y = e.clientY;
                }
                if(Math.abs(_oldX-x)+Math.abs(_oldY-y)<1) {
                    isMove=false;
//                    J.out("this is a customclick","click");
                    //console.info('customclick');
//                  if(eventType=="click"){
                        handler.call(element,e,clickTime);
//                  }
                }else{
                    //console.info('not customclick');
                }
            };
            if(J.browser.mobileSafari){
                $E.addEventListener(element, "touchstart", onElMousedown);
            }else{
                $E.addEventListener(element, "mousedown", onElMousedown);
                $E.addEventListener(element, "mouseup", onElMouseup);
            }
            customEventHandlers.push({"element":element,"eventType":eventType,handler:handler,"actions":[onElMousedown,onElMouseMove,onElMouseup,onElClick]});
        },
        "offcustomclick" : function(element, eventType,handler){
            for(var i in customEventHandlers){
                if(customEventHandlers[i].handler==handler&&customEventHandlers[i].element==element&&customEventHandlers[i].eventType==eventType){
                    if(J.browser.mobileSafari){
                        $E.removeEventListener(element, "touchstart",customEventHandlers[i].actions[0]);
                        $E.removeEventListener(element, "touchmove",customEventHandlers[i].actions[1]);
                        $E.removeOriginalEventListener(element, "touchend",customEventHandlers[i].actions[3]);
                    }else{
                        $E.removeEventListener(element, "mousedown",customEventHandlers[i].actions[0]);
                        $E.removeEventListener(element, "mousemove",customEventHandlers[i].actions[1]);
                        $E.removeEventListener(element, "mouseup",customEventHandlers[i].actions[2]);
                        $E.removeOriginalEventListener(element, "click",customEventHandlers[i].actions[3]);
                    }
                    customEventHandlers.splice(i,1);
                    break;
                }
            }
        },
        "oncontextmenu" : function(element, eventType, handler){
            if(J.browser.ie == 9){
                var wrappedEvent = function(e){
                    var event = standardizeEvent(e, element);
                    handler.call(element, event);
                };
                element.attachEvent('oncontextmenu', wrappedEvent);
                customEventHandlers.push({"element":element,"eventType":eventType,handler:handler,"actions":[wrappedEvent]});
            }else{
                $E.addOriginalEventListener(element, eventType, handler);
            }
        },
        "offcontextmenu" : function(element, eventType, handler){
            if(J.browser.ie == 9){
                for(var i in customEventHandlers){
                    if(customEventHandlers[i].handler==handler&&customEventHandlers[i].element==element&&customEventHandlers[i].eventType==eventType){
                        element.detachEvent('oncontextmenu', customEventHandlers[i].actions[0]);
                        customEventHandlers.splice(i,1);
                        break;
                    }
                }
            }else{
                $E.removeOriginalEventListener(element, eventType, handler);
            }
        },
        "onmousewheel" : function(element, eventType, handler){
            if(J.browser.firefox){
                var wrappedEvent = function(e){
                    var event = standardizeEvent(e, element);
                    handler.call(element, event);
                };
                $E.addOriginalEventListener(element, "DOMMouseScroll", wrappedEvent);
                customEventHandlers.push({"element":element,"eventType":eventType,handler:handler,"actions":[wrappedEvent]});
            }else{
                $E.addOriginalEventListener(element, "mousewheel" , handler);
            }
        },
        "offmousewheel" : function(element, eventType, handler){
            if(J.browser.firefox){
                for(var i in customEventHandlers){
                    if(customEventHandlers[i].handler==handler&&customEventHandlers[i].element==element&&customEventHandlers[i].eventType==eventType){
                        $E.removeOriginalEventListener(element, "DOMMouseScroll", customEventHandlers[i].actions[0]);
                        customEventHandlers.splice(i,1);
                        break;
                    }
                }
            }else{
                $E.removeOriginalEventListener(element, "mousewheel", handler);
            }
        },
        "onmouseenter" : function(element, eventType, handler){
            var onElMouseEnter = function(e){
                var s = e.relatedTarget;
                if(!s){//relatedTarget为null, 鼠标浏览器外移进来
                    handler.call(this, e);
                }else if(this.compareDocumentPosition){//非ie
                    var res = this.compareDocumentPosition(s);
                    if(!(s == this || res == 20 || res == 0)){
                        handler.call(this, e);
                    }
                }else{
                    if(!(s == this || this.contains(s))){
                        handler.call(this, e);
                    }
                }
            };
                        
            $E.addEventListener(element, "mouseover", onElMouseEnter);
            customEventHandlers.push({"element":element,"eventType":eventType,handler:handler, actions: [onElMouseEnter]});
        },
        "offmouseenter" : function(element, eventType,handler){
            for(var i in customEventHandlers){
                if(customEventHandlers[i].handler==handler&&customEventHandlers[i].element==element&&customEventHandlers[i].eventType==eventType){
                    $E.removeEventListener(element, "mouseover",customEventHandlers[i].actions[0]);
                    customEventHandlers.splice(i, 1);
					break;
                }
            }
        },
        "onmouseleave" : function(element, eventType, handler){
            var onElMouseLeave = function(e){
                var s = e.relatedTarget;
                if(!s){//relatedTarget为null, 鼠标移到浏览器外了
                    handler.call(this, e);
                }else if(this.compareDocumentPosition){//非ie
                    var res = this.compareDocumentPosition(s);
                    if(!(res == 20 || res == 0)){
                        handler.call(this, e);
                    }
                }else{
                    if(!this.contains(s)){
                        handler.call(this, e);
                    }
                }
            };
            $E.addEventListener(element, "mouseout", onElMouseLeave);
            customEventHandlers.push({"element":element,"eventType":eventType,handler:handler, actions: [onElMouseLeave]});
        },
        "offmouseleave" : function(element, eventType,handler){
            for(var i in customEventHandlers){
                if(customEventHandlers[i].handler==handler&&customEventHandlers[i].element==element&&customEventHandlers[i].eventType==eventType){
                    $E.removeEventListener(element, "mouseout",customEventHandlers[i].actions[0]);
                    customEventHandlers.splice(i, 1);
					break;
                }
            }
        }
        
    }
    
    
    
    
    
    
    
    
    /**
     * 
     * 文档加载完成时事件监听器
     * 
     * @method onDomReady
     * @memberOf event
     * 
     * @param element 元素
     * @param eventType 事件类型，不含on
     * @param handler 事件处理器
     */
    onDomReady = function( f ) {
        // If the DOM is already loaded, execute the function right away
        if ( onDomReady.done ) {
            return f();
        }
    
        // If we’ve already added a function
        if ( onDomReady.timer ) {
            // Add it to the list of functions to execute
            onDomReady.ready.push( f );
        } else {
            // 初始化onDomReady后要执行的function的数组
            onDomReady.ready = [ f ];
            
            // Attach an event for when the page finishes  loading,
            // just in case it finishes first. Uses addEvent.
            $E.on(window, "load", isDomReady);
    
            //  Check to see if the DOM is ready as quickly as possible
            onDomReady.timer = window.setInterval( isDomReady, 300 );
        }
    }
    
    /**
     * 
     * 判断文档加载是否完成
     * 
     * @method isDomReady
     * @memberOf event
     * 
     * @param element 元素
     * @param eventType 事件类型，不含on
     * @param handler 事件处理器
     */
    // Checks to see if the DOM is ready for navigation
    isDomReady = function() {
        // If we already figured out that the page is ready, ignore
        if ( onDomReady.done ) {
            return true;
        }
    
        // Check to see if a number of functions and elements are
        // able to be accessed
        if ( document && document.getElementsByTagName && document.getElementById && document.body ) {
            // Remember that we’re now done
            onDomReady.done = true;
            
            // If they’re ready, we can stop checking
            window.clearInterval( onDomReady.timer );
            onDomReady.timer = null;
    
            // Execute all the functions that were waiting
            for ( var i = 0; i < onDomReady.ready.length; i++ ){
                onDomReady.ready[i]();
            }

            onDomReady.ready = null;
            
            return true;
        }
    }
    
    
    
    
    /**
     * 创建一个消息源发布者的类
     * 
     * @class Publish
     * @return {Object} 返回生成的消息源
     * 
     * @example
     * Jx().$package(function(J){
     *     var onMsg = new J.Publish();
     *  var funcA = function(option){
     *      alert(option);
     *  };
     *  // 注册一个事件的观察者
     *     onMsg.subscribe(funcA);
     *     var option = "demo";
     *     onMsg.deliver(option);
     *     onMsg.unsubscribe(funcA);
     *     onMsg.deliver(option);
     *     
     * };
     * 
     */
    Publish = function(){
        this.subscribers = [];
    };
    
    /**
     * 注册观察者
     * @memberOf Publish.prototype
     * @param {Function} func 要注册的观察者
     * @return {Function} 返回结果
     */
    Publish.prototype.subscribe = function(func){
        var alreadyExists = J.array.some(this.subscribers, function(el){
            return el === func;
        });
        if(!alreadyExists){
            this.subscribers.push(func);
        }
        return func;
    };
    
    /**
     * 触发事件
     * @memberOf Publish.prototype
     * @param {Mixed} msg 要注册的观察者
     * @return {Function} 返回结果
     */
    Publish.prototype.deliver = function(msg){
        J.array.forEach(this.subscribers, function(fn){
            fn(msg);
        });
    };
    
    /**
     * 注销观察者
     * @memberOf Publish.prototype
     * @param {Function} func 要注销的观察者
     * @return {Function} 返回结果
     */
    Publish.prototype.unsubscribe = function(func){
        this.subscribers = J.array.filter(this.subscribers, function(el){
            return el !== func;
        });
        return func;
    };
    
    
    
    
    
    
    
    
    /**
     * 
     * 为自定义Model添加事件监听器
     * 
     * @method addObserver
     * @memberOf event
     * 
     * @param targetModel 目标 model，即被观察的目标
     * @param eventType 事件类型，不含on
     * @param handler 观察者要注册的事件处理器
     */
    addObserver = function(targetModel, eventType, handler){
        var handlers,
            length,
            index,
            i;
        if(handler){
            
        
            // 转换成完整的事件描述字符串
            eventType = "on" + eventType;
            
            // 判断对象是否含有$events对象
            if(!!!targetModel._$events){
                targetModel._$events={};
            }
            
            // 判断对象的$events对象是否含有eventType描述的事件类型
            if(!targetModel._$events[eventType]){
                //若没有则新建
                targetModel._$events[eventType] = [];
            }else if(targetModel._$events[eventType].length == 0){
                //bug: ie会有引用泄漏的问题, 如果数组为空, 则重新创建一个
                targetModel._$events[eventType] = [];
            }
        
            handlers = targetModel._$events[eventType];
            length = handlers.length;
            index = -1;
        
            // 通过循环，判断对象的handlers数组是否已经含有要添加的handler
            for(i=0; i<length; i++){
                
                var tempHandler = handlers[i];

                if(tempHandler == handler){
                    index = i;
                    break;
                }        
            }
            // 如果没有找到，则加入此handler
            if(index === -1){
                handlers.push(handler);
                //alert(handlers[handlers.length-1])
            }
        }else{
            J.out(">>> 添加的观察者方法不存在："+targetModel+eventType+handler);
        }
    };
    /**
     * 
     * 批量为自定义Model添加事件监听器
     * 
     * @method addObservers
     * @memberOf event
     * 
     * @param obj 目标 model，即被观察的目标
     *     obj = { targetModel : {eventType:handler,eventType2:handler2...} , targetModel2: {eventType:handler,eventType2:handler2...}  }
     */
    addObservers = function(obj){
        //TODO 这里的代码是直接复制addObserver的（为避免太多函数调用耗费栈）
        var t=obj['targetModel'];
        var m=obj['eventMapping'];
        for(var i in m){
            addObserver(t,i,m[i]);
        }
    
    };
    /**
     * 
     * 触发自定义Model事件的监听器
     * 
     * @method notifyObservers
     * @memberOf event
     * 
     * @param targetModel 目标 model，即被观察目标
     * @param eventType 事件类型，不含on
     * @param options 触发的参数对象
     * @return {Boolean} 
     */
    notifyObservers = function(targetModel, eventType, argument){/*addInvokeTime(eventType);*/
        var handlers,
            i;
            
        eventType = "on" + eventType;
        var flag = true;
        if(targetModel._$events && targetModel._$events[eventType]){
            handlers = targetModel._$events[eventType];
            if(handlers.length > 0){
                // 通过循环，执行handlers数组所包含的所有函数function
                for(i=0; i<handlers.length; i++){
                    if(handlers[i].apply(targetModel, [argument]) === false){
                        flag = false;
                    }
                }
                //return flag;
            }
        }else{
            // throw new Error("还没有定义 [" + targetModel + "] 对象的: " + eventType + " 事件！");
            //return false;
        }
        return flag;
    };
    
    
    /**
     * 
     * 为自定义 Model 移除事件监听器
     * 
     * @method removeObserver
     * @memberOf event
     * 
     * @param targetModel 目标 model，即被观察的目标
     * @param eventType 事件类型，不含on
     * @param handler 观察者要取消注册的事件处理器
     */
    // 按照对象和事件处理函数来移除事件处理函数
    removeObserver = function(targetModel, eventType, handler){
        var i,
            j,
            flag = false,
            handlers,
            length,
            events = targetModel._$events;
        if(handler){
            
            if(events){
                eventType = "on" + eventType;
                handlers = events[eventType];
                
                if(handlers){
                    length = handlers.length;
                    for(i=0; i<length; i++){
                        //由==修改为===
                        if(handlers[i] == handler){
                            handlers[i] = null;
                            handlers.splice(i, 1);
                            flag = true;
                            break;
                        }    
                    }
                }
                
                
            }
        }else if(eventType){
            if(events){
                eventType = "on" + eventType;
                handlers = events[eventType];
                if(handlers){
                    length = handlers.length;
                    for(i=0; i<length; i++){
                        handlers[i] = null;
                    }
                    delete events[eventType];
                    flag = true;
                }
                
            }
            
        }else if(targetModel){
            if(events){
                for(i in events){
                    delete events[i];
                }
                delete targetModel._$events;
                flag = true;
            }
        }
        return flag;
    };
    
    $E.addEventListener = addEventListener;
    $E.removeEventListener = removeEventListener;
    $E.addOriginalEventListener = addOriginalEventListener;
    $E.removeOriginalEventListener = removeOriginalEventListener;
    // alias
    $E.on = $E.addEventListener;
    $E.off = $E.removeEventListener;
    
    $E.onDomReady = onDomReady;
    
    $E.Publish = Publish;
    
    // Model 事件方法
    $E.addObserver = addObserver;
    $E.addObservers = addObservers;
    $E.notifyObservers = notifyObservers;
    $E.removeObserver = removeObserver;
});


/**
 * 6.[Date part]: date 扩展包
 */
Jx().$package(function(J){
    var format;
    
    /**
     * dom 名字空间
     * 
     * @namespace
     * @name date
     * @type Object
     */
    J.date = J.date || {};
    
    
    /**
     * 让日期和时间按照指定的格式显示的方法
     * 
     * @memberOf date
     * @param {String} format 格式字符串
     * @return {String} 返回生成的日期时间字符串
     * 
     * @example
     * Jx().$package(function(J){
     *     var d = new Date();
     *     // 以 YYYY-MM-dd hh:mm:ss 格式输出 d 的时间字符串
     *     J.date.format(d, "YYYY-MM-DD hh:mm:ss");
     * };
     * 
     */
    format = function(date, formatString){
        /*
         * eg:formatString="YYYY-MM-DD hh:mm:ss";
         */
        var o = {
            "M+" : date.getMonth()+1,    //month
            "D+" : date.getDate(),    //day
            "h+" : date.getHours(),    //hour
            "m+" : date.getMinutes(),    //minute
            "s+" : date.getSeconds(),    //second
            "q+" : Math.floor((date.getMonth()+3)/3),    //quarter
            "S" : date.getMilliseconds()    //millisecond
        }
    
        if(/(Y+)/.test(formatString)){
            formatString = formatString.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
    
        for(var k in o){
            if(new RegExp("("+ k +")").test(formatString)){
                formatString = formatString.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
            }
        }
        return formatString;
    };
    
    J.date.format = format;
    
});
/**
 * 7.[Number part]: number 扩展包
 */
Jx().$package(function(J){
    var format;
    
    /**
     * number 名字空间
     * 
     * @namespace
     * @name number
     * @type Object
     */
    J.number = J.number || {};
    
    /**
     * 格式化数字显示方式
     * @param num 要格式化的数字
     * @param pattern 格式
     * @example 
     * J.number.format(12345.999,'#,##0.00');
     *  //out: 12,34,5.99
     * J.number.format(12345.999,'0'); 
     *  //out: 12345
     * J.number.format(1234.888,'#.0');
     *  //out: 1234.8
     * J.number.format(1234.888,'000000.000000');
     *  //out: 001234.888000
     */  
    var format = function(num, pattern) {
        var strarr = num ? num.toString().split('.') : ['0'];
        var fmtarr = pattern ? pattern.split('.') : [''];
        var retstr = '';
    
        // 整数部分
        var str = strarr[0];
        var fmt = fmtarr[0];
        var i = str.length - 1;
        var comma = false;
        for (var f = fmt.length - 1; f >= 0; f--) {
            switch (fmt.substr(f, 1)) {
                case '' :
                    if (i >= 0)
                        retstr = str.substr(i--, 1) + retstr;
                    break;
                case '0' :
                    if (i >= 0)
                        retstr = str.substr(i--, 1) + retstr;
                    else
                        retstr = '0' + retstr;
                    break;
                case ',' :
                    comma = true;
                    retstr = ',' + retstr;
                    break;
            }
        }
        if (i >= 0) {
            if (comma) {
                var l = str.length;
                for (; i >= 0; i--) {
                    retstr = str.substr(i, 1) + retstr;
                    if (i > 0 && ((l - i) % 3) == 0)
                        retstr = ',' + retstr;
                }
            } else
                retstr = str.substr(0, i + 1) + retstr;
        }
    
        retstr = retstr + '.';
        // 处理小数部分
        str = strarr.length > 1 ? strarr[1] : '';
        fmt = fmtarr.length > 1 ? fmtarr[1] : '';
        i = 0;
        for (var f = 0; f < fmt.length; f++) {
            switch (fmt.substr(f, 1)) {
                case '' :
                    if (i < str.length)
                        retstr += str.substr(i++, 1);
                    break;
                case '0' :
                    if (i < str.length)
                        retstr += str.substr(i++, 1);
                    else
                        retstr += '0';
                    break;
            }
        }
        return retstr.replace(/^,+/, '').replace(/\.$/, '');
    };
    
    J.number.format = format;
    
});

/**	
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.kdv.cn/jet/license.txt
 *
 * @fileOverview Jx!
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */

/**	
 * @description
 * Package: jet.array
 *
 * Need package:
 * jet.core.js
 * 
 */

/**
 * 4.[Javascript core]: array 数组处理
 */
Jx().$package(function(J){
	
	/**
	 * array 名字空间
	 * 
	 * @namespace
	 * @name array
	 */
	J.array = J.array || {};
	var $A = J.array,
		// javascript1.6扩展
		indexOf,
		lastIndexOf,
		forEach,
		filter,
		some,
		map,
		every,
		// javascript1.8扩展
		reduce,
		reduceRight,
		
		// JET扩展
		toArray,
		remove,
		replace,
		bubbleSort,
		binarySearch;
	
	
	
	/**
	 * 正向查找数组元素在数组中的索引下标
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Object} obj 要查找的数组的元素
	 * @param {Number} fromIndex 开始的索引编号
	 * 
	 * @return {Number}返回正向查找的索引编号
	 */
	indexOf = Array.prototype.indexOf 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.indexOf.apply(arguments[0], args);
		}
		: function (arr, obj, fromIndex) {
	
	        if (fromIndex == null) {
	            fromIndex = 0;
	        } else if (fromIndex < 0) {
	            fromIndex = Math.max(0, arr.length + fromIndex);
	        }
	        for (var i = fromIndex; i < arr.length; i++) {
	            if (arr[i] === obj){
	                return i;
	            }
	        }
	        return -1;
	    };
    
    
        
    /**
	 * 反向查找数组元素在数组中的索引下标
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Object} obj 要查找的数组元素
	 * @param {Number} fromIndex 开始的索引编号
	 * 
	 * @return {Number}返回反向查找的索引编号
	 */
    lastIndexOf = Array.prototype.lastIndexOf 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.lastIndexOf.apply(arguments[0], args);
		}
		: function (arr, obj, fromIndex) {
	        if (fromIndex == null) {
	            fromIndex = arr.length - 1;
	        } else if (fromIndex < 0) {
	            fromIndex = Math.max(0, arr.length + fromIndex);
	        }
	        for (var i = fromIndex; i >= 0; i--) {
	            if (arr[i] === obj){
	                return i;
	            }
	        }
	        return -1;
	    };
	
	

	
	
	/**
	 * 遍历数组，把每个数组元素作为第一个参数来执行函数
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:forEach
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Function} fun 要执行的函数
	 * @param {Object} contextObj 执行函数时的上下文对象，可以省略
	 * 
	 */
	forEach = Array.prototype.forEach 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.forEach.apply(arguments[0], args);
		}
		: function(arr, fun /*, thisp*/) {
			var len = arr.length;
			if (typeof fun != "function") {
				throw new TypeError();
			}
			var thisp = arguments[2];
			for (var i = 0; i < len; i++) {
				if (i in arr) {
					fun.call(thisp, arr[i], i, arr);
				}
			}
		};
	
	/**
	 * 用一个自定义函数来过滤数组
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:filter
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Function} fun 过滤函数
	 * @param {Object} contextObj 执行函数时的上下文对象，可以省略
	 * 
	 * @return {Array}返回筛选出的新数组
	 */
	filter = Array.prototype.filter 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.filter.apply(arguments[0], args);
		}
		: function(arr, fun) {
			var len = arr.length;
			if (typeof fun != "function") {
			  throw new TypeError();
			}
			var res   = [];
			var thisp = arguments[2];
			for (var i = 0; i < len; i++) {
				if (i in arr) {
					var val = arr[i]; // in case fun mutates this
					if (fun.call(thisp, val, i, arr)) {
						res.push(val);
					}
				}
			}
			return res;
		};
	
	
	


	
	/**
	 * 遍历数组，把每个数组元素作为第一个参数来执行函数，如果有任意一个或多个数组成员使得函数执行结果返回 true，则最终返回 true，否则返回 false
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:some
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Function} fun 要执行的函数
	 * @param {Object} contextObj 执行函数时的上下文对象，可以省略
	 * 
	 * @return {Boolean}
	 */
	some = Array.prototype.some 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.some.apply(arguments[0], args);
		}
		: function(arr, fun /*, thisp*/) {
			var len = arr.length;
			if (typeof fun != "function") {
				throw new TypeError();
			}
	
			var thisp = arguments[2];
			for (var i = 0; i < len; i++) {
				if (i in arr && fun.call(thisp, arr[i], i, arr)) {
					return true;
				}
			}
	
			return false;
		};
	

	/**
	 * 遍历数组，把每个数组元素作为第一个参数来执行函数，并把函数的返回结果以映射的方式存入到返回的数组中
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:map
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Function} fun 要执行的函数
	 * @param {Object} contextObj 执行函数时的上下文对象，可以省略
	 * 
	 * @return {Array}返回映射后的新数组
	 */
    map = Array.prototype.map 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.map.apply(arguments[0], args);
		}
		: function(arr, fun /*, thisp*/) {
	        var len = arr.length;
	        if (typeof fun != "function") {
	            throw new TypeError();
	        }
	        var res   = new Array(len);
	        var thisp = arguments[2];
	        for (var i = 0; i < len; i++) {
	            if (i in arr) {
	                res[i] = fun.call(thisp, arr[i], i, arr);
	            }
	        }
	
	        return res;
	    };
	
    
    /**
	 * 遍历数组，把每个数组元素作为第一个参数来执行函数，如果所有的数组成员都使得函数执行结果返回 true，则最终返回 true，否则返回 false
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:every
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Function} fun 要执行的函数
	 * @param {Object} contextObj 执行函数时的上下文对象，可以省略
	 * 
	 * @return {Boolean}
	 */
    every = Array.prototype.every 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.every.apply(arguments[0], args);
		}
		: function(arr, fun) {
	        var len = arr.length;
	        if (typeof fun != "function") {
	            throw new TypeError();
	        }
	        var thisp = arguments[2];
	        for (var i = 0; i < len; i++) {
	            if (i in arr && !fun.call(thisp, arr[i], i, arr)) {
	                return false;
	            }
	        }
	        return true;
	    };
	
	
	
	
    
	/**
	 * 对该数组的每项和前一次调用的结果运行一个函数，收集最后的结果。
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.8_Reference:Objects:Array:reduce
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Function} fun 要执行的函数
	 * @param {Object} contextObj 执行函数时的上下文对象，可以省略
	 * 
	 * @return {Boolean}
	 */
	reduce = Array.prototype.reduce 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.reduce.apply(arguments[0], args);
		}
		: function(arr, fun /*, initial*/){
			var len = arr.length >>> 0;
			if (typeof fun != "function"){
				throw new TypeError();
			}
			// no value to return if no initial value and an empty array
			if (len == 0 && arguments.length == 2){
				throw new TypeError();
			}
			var i = 0;
			if (arguments.length >= 3){
				var rv = arguments[2];
			}
			else{
				do{
				    if (i in arr){
				      rv = arr[i++];
				      break;
				    }
				
				    // if array contains no values, no initial value to return
				    if (++i >= len){
				    	throw new TypeError();
				    }
				}
				while (true);
			}
			
			for (; i < len; i++){
				if (i in arr){
					rv = fun.call(null, rv, arr[i], i, arr);
				}
			}
			
			return rv;
		};
	
	
	
	/**
	 * 同上，但从右向左执行。
	 * 
	 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.8_Reference:Objects:Array:reduceRight
	 * @memberOf array
	 * @function
	 * 
	 * @param {Array} arr 要执行操作的数组
	 * @param {Function} fun 要执行的函数
	 * @param {Object} contextObj 执行函数时的上下文对象，可以省略
	 * 
	 * @return {Boolean}
	 */
	reduceRight = Array.prototype.reduceRight 
		? function(){
			var args = Array.prototype.slice.call(arguments, 1);
			return Array.prototype.reduceRight.apply(arguments[0], args);
		}
		: function(arr, fun /*, initial*/){
			var len = arr.length >>> 0;
			if (typeof fun != "function"){
				throw new TypeError();
			}
			// no value to return if no initial value, empty array
			if (len == 0 && arguments.length == 2){
				throw new TypeError();
			}
			var i = len - 1;
			if (arguments.length >= 3){
				var rv = arguments[2];
			}
			else{
				do{
					if (i in arr){
						rv = arr[i--];
						break;
					}
			
					// if array contains no values, no initial value to return
					if (--i < 0){
						throw new TypeError();
					}
				}
				while(true);
			}
			
			for (; i >= 0; i--){
				if (i in arr){
					rv = fun.call(null, rv, arr[i], i, arr);
				}
			}
			
			return rv;
		};

    
    
    
    /**
	 * 将任意变量转换为数组的方法
	 * 
	 * @memberOf array
	 * @param {Mixed} o 任意变量
	 * @return {Array} 返回转换后的数组
	 */
	toArray = function(o){
		var type = J.$typeof(o);
		return (type) ? ((type != 'array' && type != 'arguments') ? [o] : o) : [];
	};
	
	
	
	
	/**
	 * 从数组中移除一个或多个数组成员
	 * 
	 * @memberOf array
	 * @param {Array} arr 要移除的数组成员，可以是单个成员也可以是成员的数组
	 */
	remove = function(arr, members){
		var members = toArray(members),
			i,
			j,
			flag = false;
		for(i=0; i<members.length; i++){
			for(j=0; j<arr.length; j++){
				if(arr[j] === members[i]){
					arr.splice(j,1);
					flag = true;
				}
			}
		}
		return flag;
	};
	
	/**
	 * 替换一个数组成员
	 * 
	 * @memberOf array
	 * @param {Object} oldValue 当前数组成员
	 * @param {Object} newValue 要替换成的值
	 * @return {Boolean} 如果找到旧值并成功替换则返回 true，否则返回 false
	 */
	replace = function(arr, oldValue, newValue){
		var i;
		for(i=0; i<arr.length; ij++){
			if(arr[i] === oldValue){
				arr[i] = newValue;
				return true;
			}
		}
		return false;
	};
	
	// 冒泡排序,默认从小到大排序
	bubbleSort = function(arr, compareFunc) {
		compareFunc = compareFunc || function(num1, num2){
			return num1 - num2;
		};
		//数组长度
		var n = arr.length;
		//交换顺序的临时变量
		var temp;//
		//交换标志
		var exchange;
		//最多做n-1趟排序
		for (var time=0; time<n-1; time++){
			exchange = false;
			for (var i=n-1; i>time; i--) {
				if (compareFunc(arr[i], arr[i - 1]) < 0) {
				//if (arr[i] < arr[i - 1]) {
					exchange = true;
					temp = arr[i - 1];
					arr[i - 1] = arr[i];
					arr[i] = temp;
				}
			}
			//若本趟排序未发生交换，提前终止算法
			if (!exchange) {
				break;
			}
		}
		return arr;
	};
	
	// 二叉搜索
	binarySearch = function(arr, item, compareFunc){
	    var start = 0;
	    var end = arr.length;
	    var current = Math.floor(arr.length/2);
	    while(end != current){
	        if(compareFunc(item, arr[current]) > 0){
	            start = current + 1;
	        }
	        else{
	            end = current;
	        };
	
	        current = Math.floor((start + end) / 2);
	    };
	    return current;
	};
	
	
	
	
    
    $A.indexOf = indexOf;
    $A.lastIndexOf = lastIndexOf;
	$A.forEach = forEach;
	$A.filter = filter;
	$A.some = some;
	$A.map = map;
	$A.every = every;
	$A.reduce = reduce;
	$A.reduceRight = reduceRight;

	$A.toArray = toArray;
	$A.remove = remove;
    $A.replace = replace;
    $A.bubbleSort = bubbleSort;
    $A.binarySearch = binarySearch;
	
    
});









/**	
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.kdv.cn/jet/license.txt
 *
 * @fileOverview Jx!
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */

/**	
 * @description
 * Package: jet.string
 * 
 * Need package:
 * jet.core.js
 * 
 */


/**
 * 3.[Javascript core]: String 字符串处理
 */
Jx().$package(function(J){
	
	/**
	 * string 名字空间
	 * 
	 * @namespace
	 * @name string
	 */
	J.string = J.string || {};
	var $S = J.string,
		toString,
		template,
		isURL,
		mapQuery,
		test,
		contains,
		trim,
		clean,
		camelCase,
		hyphenate,
		capitalize,
		escapeRegExp,
		toInt,
		toFloat,
		toSingleLine,
		toHtml,
		toTitle,
		toQueryPair,
		toQueryString,
		
		hexToRgb,
		rgbToHex,
		stripScripts,
		substitute,
		replaceAll,
		
		byteLength,
		cutRight,
		cutByBytes,
		isNumber,
		isEmail,
		
		encodeHtmlSimple,
		decodeHtmlSimple,
		decodeHtmlSimple2,
		encodeHtmlAttributeSimple,
		encodeHtmlAttribute,
		encodeHtml,
		encodeScript,
		encodeHrefScript,
		encodeRegExp,
		encodeUrl,
		encodeUriComponent,
		vaildTencentUrl,
		vaildUrl,
		getCharWidth;
		
	
	/**
	 * 将任意变量转换为字符串的方法
	 * 
	 * @method toString
	 * @memberOf string
	 * 
	 * @param {Mixed} o 任意变量
	 * @return {String} 返回转换后的字符串
	 */
	toString = function(o){
		return (o + "");
	};
	
	var cache = {};
	  
	/**
	 * 多行或单行字符串模板处理
	 * 
	 * @method template
	 * @memberOf string
	 * 
	 * @param {String} str 模板字符串
	 * @param {Object} obj 要套入的数据对象
	 * @return {String} 返回与数据对象合成后的字符串
	 * 
	 * @example
	 * <script type="text/html" id="user_tmpl">
	 *   <% for ( var i = 0; i < users.length; i++ ) { %>
	 *     <li><a href="<%=users[i].url%>"><%=users[i].name%></a></li>
	 *   <% } %>
	 * </script>
	 * 
	 * Jx().$package(function(J){
	 * 	// 用 obj 对象的数据合并到字符串模板中
	 * 	J.template("Hello, {name}!", {
	 * 		name:"Kinvix"
	 * 	});
	 * };
	 */
	template = function(str, data){
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
			  .replace(/\t=(.*?)%>/g, "',$1,'")
			  .split("\t").join("');")
			  .split("%>").join("p.push('")
			  .split("\r").join("\\'")
		  + "');}return p.join('');");
		
		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};

	
	/*
	template = function(str, obj){
		var p,
			RE;
	
		for(p in obj){
			if(obj.hasOwnProperty(p)){
				// RE = new RegExp("\\${" + p + "}","g");
				// str = str.replace(RE, o[p]);
				str = str.split("${" + p + "}").join(obj[p]);
			}
		}
		return str;
	};
	*/

	
	

	/**
	 * 判断是否是一个可接受的 url 串
	 * 
	 * @method isURL
	 * @memberOf string
	 * 
	 * @param {String} str 要检测的字符串
	 * @return {Boolean} 如果是可接受的 url 则返回 true
	 */
	isURL = function(str) {
		return isURL.RE.test(str);
	};
	
	/**
	 * @ignore
	 */
	isURL.RE = /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i;
	
	/**
	 * 将 uri 的查询字符串参数映射成对象
	 * 
	 * @method mapQuery
	 * @memberOf string
	 * 
	 * @param {String} uri 要映射的 uri
	 * @return {Object} 按照 uri 映射成的对象
	 * 
	 * @example
	 * Jx().$package(function(J){
	 * 	var url = "http://web.qq.com/?qq=4765078&style=blue";
	 * 	// queryObj 则得到一个{qq:"4765078", style:"blue"}的对象。
	 * 	var queryObj = J.mapQuery(url);
	 * };
	 */
	mapQuery = function(uri){
		//window.location.search
		var i,
			key,
			value,
			uri = uri || window.location.href,
			index = uri.indexOf("?"),
			pieces = uri.substring(index + 1).split("&"),
			params = {};
	    if(index === -1){//如果连?号都没有,直接返回,不再进行处理. az 2011/5/11
            return params;
        }
		for(i=0; i<pieces.length; i++){
			try{
				index = pieces[i].indexOf("=");
				key = pieces[i].substring(0,index);
				value = pieces[i].substring(index+1);
				if(!(params[key] = unescape(value))){
					throw new Error("uri has wrong query string when run mapQuery.");
				}
			}
			catch(e){
				//J.out("错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
			}
		}
		return params;
	};
	
	/**
	 * 
	 * test的方法
	 * 
	 * @memberOf string
	 * 
	 * @param {String, RegExp} regex 正则表达式，或者正则表达式的字符串
	 * @param {String} params 正则的参数
	 * @return {Boolean} 返回结果
	 */
	test = function(string, regex, params){
		return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(string);
	};

	/**
	 * 判断是否含有指定的字符串
	 * 
	 * @memberOf string
	 * 
	 * @param {String} string 是否含有的字符串
	 * @param {String} separator 分隔符，可选
	 * @return {Boolean} 如果含有，返回 true，否则返回 false
	 */
	contains = function(string1, string2, separator){
		return (separator) ? (separator + string1 + separator).indexOf(separator + string2 + separator) > -1 : string1.indexOf(string2) > -1;
	};

	/**
	 * 清除字符串开头和结尾的空格
	 * 
	 * @memberOf string
	 * 
	 * @return {String} 返回清除后的字符串
	 */
	trim = function(string){
		return String(string).replace(/^\s+|\s+$/g, '');
	};

	/**
	 * 清除字符串开头和结尾的空格，并把字符串之间的多个空格转换为一个空格
	 * 
	 * @memberOf string
	 * 
	 * @return {String} 返回清除后的字符串
	 */
	clean = function(string){
		return trim(string.replace(/\s+/g, ' '));
	};

	/**
	 * 将“-”连接的字符串转换成驼峰式写法
	 * 
	 * @memberOf string
	 * 
	 * @return {String} 返回转换后的字符串
	 */
	camelCase = function(string){
		return string.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	};
	
	/**
	 * 将驼峰式写法字符串转换成“-”连接的
	 * 
	 * @memberOf string
	 * 
	 * @return {String} 返回转换后的字符串
	 */
	hyphenate = function(string){
		return string.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	};

	/**
	 * 将字符串转换成全大写字母
	 * 
	 * @memberOf string
	 * 
	 * @return {String} 返回转换后的字符串
	 */
	capitalize = function(string){
		return string.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	};

	/**
	 * 转换 RegExp 正则表达式
	 * 
	 * @memberOf string
	 * 
	 * @return {String} 返回转换后的字符串
	 */
	escapeRegExp = function(string){
		return string.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	};

	/**
	 * 将字符串转换成整数
	 * 
	 * @memberOf string
	 * 
	 * @return {Number} 返回转换后的整数
	 */
	toInt = function(string, base){
		return parseInt(string, base || 10);
	};

	/**
	 * 将字符串转换成浮点数
	 * 
	 * @memberOf string
	 * @param {Sring} string 要转换的字符串
	 * @return {Number} 返回转换后的浮点数
	 */
	toFloat = function(string){
		return parseFloat(string);
	};
	
	/**
	 * 将带换行符的字符串转换成无换行符的字符串
	 * 
	 * @memberOf string
	 * @param {Sring} str 要转换的字符串
	 * @return {Sring} 返回转换后的字符串
	 */
	toSingleLine = function(str){
		return String(str).replace(/\r/gi,"")
							.replace(/\n/gi,"");
	};
	
	/**
	 * 将字符串转换成html源码
	 * 
	 * @memberOf string
	 * @param {Sring} str 要转换的字符串
	 * @return {Sring} 返回转换后的html代码字符串
	 */
	toHtml = function(str){
		return String(str).replace(/&/gi,"&amp;")
							.replace(/\\/gi,"&#92;")
							.replace(/\'/gi,"&#39;")
							.replace(/\"/gi,"&quot;")
							.replace (/</gi,"&lt;")
							.replace(/>/gi,"&gt;")
							.replace(/ /gi,"&nbsp;")
							.replace(/\r\n/g,"<br />")
							.replace(/\n\r/g,"<br />")
							.replace(/\n/g,"<br />")
							.replace(/\r/g,"<br />");
	};
	
	
	
	/**
	 * 将字符串转换成用于title的字符串
	 * 
	 * @memberOf string
	 * @param {Sring} str 要转换的字符串
	 * @return {Number} 返回转换后的in title字符串
	 */
	toTitle = function(str){
		return String(str).replace(/\\/gi,"\\")
							.replace(/\'/gi,"\'")
							.replace(/\"/gi,"\'");
	};

	
	
	
	

	/**
	 * 将颜色 Hex 写法转换成 RGB 写法
	 * 
	 * @memberOf string
	 * @return {String} 返回转换后的字符串
	 */
	hexToRgb = function(string, array){
		var hex = string.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	};

	/**
	 * 将颜色 RGB 写法转换成 Hex 写法
	 * 
	 * @memberOf string
	 * @return {String} 返回转换后的字符串
	 */
	rgbToHex = function(string, array){
		var rgb = string.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	};

	/**
	 * 脱去script标签
	 * 
	 * @memberOf string
	 * @return {String} 返回转换后的字符串
	 */
	stripScripts = function(string, option){
		var scripts = '';
		var text = string.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
			scripts += arguments[1] + '\n';
			return '';
		});
		if (option === true){
			$exec(scripts);
		}else if($type(option) == 'function'){
			option(scripts, text);
		}
		return text;
	};
	
	/**
	 * 。。。。
	 * 
	 * @memberOf string
	 * @param {Object} obj 要转换成查询字符串的对象
	 * @return {String} 返回转换后的查询字符串
	 */
	toQueryPair = function(key, value) {
		return encodeURIComponent(String(key)) + "=" + encodeURIComponent(String(value));
	};
	
	/**
	 * 。。。。
	 * 
	 * @memberOf string
	 * @param {Object} obj 要转换成查询字符串的对象
	 * @return {String} 返回转换后的查询字符串
	 */
	toQueryString = function(obj){
		var result=[];
		for(var key in obj){
			result.push(toQueryPair(key, obj[key]));
		}
		return result.join("&");
	};



	/**
	 * 。。。。
	 * 
	 * @memberOf string
	 * @return {String} 返回转换后的字符串
	 */
	substitute = function(string, object, regexp){
		return string.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != undefined) ? object[name] : '';
		});
	};
	
	/**
	 * 全局替换指定的字符串
	 * 
	 * @memberOf string
	 * @return {String} 返回替换后的字符串
	 */
	replaceAll = function(string, reallyDo, replaceWith, ignoreCase) {
	    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
	        return string.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);
	    } else {
	        return string.replace(reallyDo, replaceWith);
	    }
	};
	
	/**
	 * 计算字符串的字节长度
	 * 
	 * @memberOf string
	 * @return {String} 返回自己长度
	 */
	byteLength = function(string){
		return string.replace(/[^\x00-\xff]/g,"aa").length;
	};
	
	cutRight = function(string, n){
		return string.substring(0, (string.length - n));
	};
	cutByBytes = function(string,n) {
		var s= string;
		while(byteLength(s)>n) {
			s= cutRight(s,1);
		}
		return s;
	}
	isNumber = function(string){
		if (string.search(/^\d+$/) !== -1){
			return true;
		}
		else{
		   	return false;
		}
	};
	isEmail = function(emailStr){
		if (emailStr.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) !== -1){
			return true;
		}
		else{
		   	return false;
		}
	};
	
	
	
	
	/*
	JS安全API v1.1
	Created By Web Application Security Group of TSC
	UpDate: 2007-12-08
	*/

	
	//html正文编码：对需要出现在HTML正文里(除了HTML属性外)的不信任输入进行编码
	var encodeHtmlSimple = function(sStr){
		sStr = sStr.replace(/&/g,"&amp;");
		sStr = sStr.replace(/>/g,"&gt;");
		sStr = sStr.replace(/</g,"&lt;");
		sStr = sStr.replace(/"/g,"&quot;");
		sStr = sStr.replace(/'/g,"&#39;");
		return sStr;
	};
	
	//html正文解码：对HtmlEncode函数的结果进行解码
	var decodeHtmlSimple = function(sStr){
		sStr = sStr.replace(/&amp;/g,"&");
		sStr = sStr.replace(/&gt;/g,">");
		sStr = sStr.replace(/&lt;/g,"<");
		sStr = sStr.replace(/&quot;/g,'"');
		sStr = sStr.replace(/&#39;/g,"'");
		return sStr;
	};
	
	var decodeHtmlSimple2 = function(sStr){
		sStr = sStr.replace(/&amp;/g,"&");
		sStr = sStr.replace(/&gt;/g,">");
		sStr = sStr.replace(/&lt;/g,"<");
		sStr = sStr.replace(/\\\\"/g,'"');
		sStr = sStr.replace(/\\\\'/g,"'");
		return sStr;
	};
	
	/*
	html属性编码：对需要出现在HTML属性里的不信任输入进行编码
	注意:
	(1)该函数不适用于属性为一个URL地址的编码.这些标记包括:a/img/frame/iframe/script/xml/embed/object...
	属性包括:href/src/lowsrc/dynsrc/background/...
	(2)该函数不适用于属性名为 style="[Un-trusted input]" 的编码
	*/
	var encodeHtmlAttributeSimple = function(sStr){
		sStr = sStr.replace(/&/g,"&amp;");
		sStr = sStr.replace(/>/g,"&gt;");
		sStr = sStr.replace(/</g,"&lt;");
		sStr = sStr.replace(/"/g,"&quot;");
		sStr = sStr.replace(/'/g,"&#39;");
		sStr = sStr.replace(/=/g,"&#61;");
		sStr = sStr.replace(/`/g,"&#96;");
		return sStr;
	};

	
	
	
	//用做过滤直接放到HTML里的
	var encodeHtml = function(sStr) { 
		return sStr.replace(/[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){ 
			return "&#"+r.charCodeAt(0)+";";
		}).replace(/ /g, "&nbsp;").replace(/\r\n/g, "<br />").replace(/\n/g, "<br />").replace(/\r/g, "<br />"); 
	};
	
	//用做过滤HTML标签里面的东东 比如这个例子里的<input value="XXXX">  XXXX就是要过滤的
	var encodeHtmlAttribute = function(sStr) { 
		return sStr.replace(/[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g, function(r){ 
			return "&#"+r.charCodeAt(0)+";";
		}); 
	};
	
	//用做过滤直接放到HTML里js中的
	var encodeScript = function(sStr) {
		sStr+="";//确保为String
		return sStr.replace(/[\\"']/g, function(r){ 
			return "\\"+r; 
		}).replace(/%/g, "\\x25").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\x01/g, "\\x01");
	};
	
	
	
	//用做过滤直接放到<a href="javascript:XXXX">中的
	var encodeHrefScript = function(sStr) {
		return encodeHtml(encodeUrl(escScript(sStr)));
	};
	
	//用做过滤直接放到正则表达式中的
	var encodeRegExp = function(sStr) {
		return sStr.replace(/[\\\^\$\*\+\?\{\}\.\(\)\[\]]/g, function(a,b){
			return "\\"+a;
		});
	};
	
	//用做过滤直接URL参数里的  比如 http://show8.qq.com/abc_cgi?a=XXX  XXX就是要过滤的
	var encodeUrl = function(sStr) {
		return escape(sStr).replace(/\+/g, "%2B");
	};
	
	/*
	对需要出现在一个URI的一部分的不信任输入进行编码 
	例如:
	<a href="http://search.msn.com/results.aspx?q1=[Un-trusted-input]& q2=[Un-trusted-input]">Click Here!</a>
	以下字符将会被编码: 
	除[a-zA-Z0-9.-_]以外的字符都会被替换成URL编码
	*/
	var encodeUriComponent = function(sStr){
		sStr = encodeURIComponent(sStr);
		sStr = sStr.replace(/~/g,"%7E");
		sStr = sStr.replace(/!/g,"%21");
		sStr = sStr.replace(/\*/g,"%2A");
		sStr = sStr.replace(/\(/g,"%28");
		sStr = sStr.replace(/\)/g,"%29");
		sStr = sStr.replace(/'/g,"%27");
		sStr = sStr.replace(/\?/g,"%3F");
		sStr = sStr.replace(/;/g,"%3B");
		return sStr;
	};
	
	/*
	url转向验证
	描述：对通过javascript语句载入（或转向）的页面进行验证，防止转到第三方网页和跨站脚本攻击
	返回值：true -- 合法；false -- 非法
	例：
	合法的值
	    http://xxx.qq.com/hi/redirect.html?url=http://www.qq.com
	    http://xxx.qq.com/hi/redirect.html?url=a.html
	    http://xxx.qq.com/hi/redirect.html?url=/a/1.html
	非法的值
	    http://xxx.qq.com/hi/redirect.html?url=http://www.baidu.com
	    http://xxx.qq.com/hi/redirect.html?url=javascript:codehere
	    http://xxx.qq.com/hi/redirect.html?url=//www.qq.com
	*/
	var vaildTencentUrl = function(sUrl){
		return (/^(https?:\/\/)?[\w\-.]+\.(qq|paipai|soso|taotao)\.com($|\/|\\)/i).test(sUrl)||(/^[\w][\w\/\.\-_%]+$/i).test(sUrl)||(/^[\/\\][^\/\\]/i).test(sUrl) ? true : false;
	};
	

	
	var vaildUrl = function(url){ 
		var url=encodeURI(url).replace(/(^\s*)|(\s*$)/g, ''),
	  		protocolReg=/(^[a-zA-Z0-9]+[^.]):/,
	  		domainReg=/^[\S.]+\.[\S.]+$/,
	  		domainendReg=/[\w.]+\/(\S*)/,
	  		jsReg=/;$/,
	  		jpReg=/^[\s*]*javascript[\s*]*:/;
	  		
	  	if((!protocolReg.test(url)) && (!domainReg.test(url))){
	  		url="";
	  	}else{
	    	if(!protocolReg.test(url)){
	    		url="http://"+url;
	    	}
	    	if(!domainendReg.test(url)){
	    		url=url+"/";
	    		
	    	}
	    	//如果是js为协议就清空
	    	if(jpReg.test(url)){
	    		url="";
	    	}
	  	}
	  	
	  	return url;
	};
	
	
    /*
	toHtml = function(str){
		return encodeHtml(str);
	};
	
	toTitle = function(str){
		return encodeHtmlAttribute(str);
	};
	
	*/
	/* 获取字符实际宽度
	 * str：需要计算的字符串
	 * fontsize：字体大小，可以不填
	 */
	var getCharWidth = function(str,fontsize) {
		var d= document.createElement("div");
		d.style.visibility= "hidden";
		d.style.width= "auto";
		if(fontsize) {
			d.style.fontSize= fontsize + "px";
		}
		d.style.position= "absolute";
		d.innerHTML= J.string.encodeHtmlSimple(str);
		document.body.appendChild(d);
		var width= d.offsetWidth;
		document.body.removeChild(d);
		return width;
	};
	
	var cutByWidth = function(str,fontsize,width) {
		for(var i=str.length;i>=0;--i)
		{
			str=str.substring(0, i);
			if(getCharWidth(str, fontsize)<width)
			{
				return str;
			}
		}
		return '';
	};
	$S.cutByWidth = cutByWidth;
	$S.toString = toString;
	$S.template = template;
	$S.isURL = isURL;
	$S.mapQuery = mapQuery;
	$S.test = test;
	$S.contains = contains;
	$S.trim = trim;
	$S.clean = clean;
	$S.camelCase = camelCase;
	$S.hyphenate = hyphenate;
	$S.capitalize = capitalize;
	$S.escapeRegExp = escapeRegExp;
	$S.toInt = toInt;
	$S.toFloat = toFloat;
	$S.toSingleLine = toSingleLine;
	
	$S.toHtml = toHtml;
	$S.toTitle = toTitle;
	$S.toQueryPair = toQueryPair;
	$S.toQueryString = toQueryString;
	
	$S.hexToRgb = hexToRgb;
	$S.rgbToHex = rgbToHex;
	$S.stripScripts = stripScripts;
	$S.substitute = substitute;
	$S.replaceAll = replaceAll;
	
	$S.byteLength = byteLength;
	$S.cutRight = cutRight;
	
	$S.isNumber = isNumber;
	$S.isEmail = isEmail;
	
	$S.cutByBytes = cutByBytes;
	
	//html正文编码：对需要出现在HTML正文里(除了HTML属性外)的不信任输入进行编码
	$S.encodeHtmlSimple = encodeHtmlSimple;
	
	//html正文解码：对HtmlEncode函数的结果进行解码
	$S.decodeHtmlSimple = decodeHtmlSimple;
	$S.decodeHtmlSimple2 = decodeHtmlSimple2;
	
	
	/*
	html属性编码：对需要出现在HTML属性里的不信任输入进行编码
	注意:
	(1)该函数不适用于属性为一个URL地址的编码.这些标记包括:a/img/frame/iframe/script/xml/embed/object...
	属性包括:href/src/lowsrc/dynsrc/background/...
	(2)该函数不适用于属性名为 style="[Un-trusted input]" 的编码
	*/
	$S.encodeHtmlAttributeSimple = encodeHtmlAttributeSimple;
	
	//用做过滤HTML标签里面的东东 比如这个例子里的<input value="XXXX">  XXXX就是要过滤的
	$S.encodeHtmlAttribute = encodeHtmlAttribute;
	
	//用做过滤直接放到HTML里的
	$S.encodeHtml = encodeHtml;
	
	//用做过滤直接放到HTML里js中的
	$S.encodeScript = encodeScript;
	
	//用做过滤直接放到<a href="javascript:XXXX">中的
	$S.encodeHrefScript = encodeHrefScript;
	
	//用做过滤直接放到正则表达式中的
	$S.encodeRegExp = encodeRegExp;
	
	//用做过滤直接URL参数里的  比如 http://show8.qq.com/abc_cgi?a=XXX  XXX就是要过滤的
	$S.encodeUrl = encodeUrl;
	
	/*
	对需要出现在一个URI的一部分的不信任输入进行编码 
	例如:
	<a href="http://search.msn.com/results.aspx?q1=[Un-trusted-input]& q2=[Un-trusted-input]">Click Here!</a>
	以下字符将会被编码: 
	除[a-zA-Z0-9.-_]以外的字符都会被替换成URL编码
	*/
	$S.encodeUriComponent = encodeUriComponent;
	
	/*
	url转向验证
	描述：对通过javascript语句载入（或转向）的页面进行验证，防止转到第三方网页和跨站脚本攻击
	返回值：true -- 合法；false -- 非法
	例：
	合法的值
	    http://xxx.qq.com/hi/redirect.html?url=http://www.qq.com
	    http://xxx.qq.com/hi/redirect.html?url=a.html
	    http://xxx.qq.com/hi/redirect.html?url=/a/1.html
	非法的值
	    http://xxx.qq.com/hi/redirect.html?url=http://www.baidu.com
	    http://xxx.qq.com/hi/redirect.html?url=javascript:codehere
	    http://xxx.qq.com/hi/redirect.html?url=//www.qq.com
	*/
	$S.vaildTencentUrl = vaildTencentUrl;
	
	$S.vaildUrl = vaildUrl;
	
	$S.getCharWidth = getCharWidth;

	
	












});









/**	
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.kdv.cn/jet/license.txt
 *
 * @fileOverview Jx!
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */

/**	
 * @description
 * Package: jet.http
 *
 * Need package:
 * jet.core.js
 * 
 */

/**
 * 1.[Browser part]: http 包,含有ajax,comet,loadScript,loadCss封装
 */
Jx().$package(function(J){
	var $=J.dom.id,
		$D=J.dom,
		$E=J.event,
		ajax,
		comet,
		load,
		loadCss,
		loadScript,
		formSend;
	
	// 兼容不同浏览器的 Adapter 适配层
	if(typeof window.XMLHttpRequest === "undefined"){
		window.XMLHttpRequest = function(){
			return new window.ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >=0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
		};
	}
	
	/**
	 * http 名字空间
	 * 
	 * @namespace
	 * @name http
	 */
	J.http = J.http || {};

	/**
	 * 这是Ajax对象名字空间的一个方法
	 * 
	 * @memberOf http
	 * @method	ajax
	 * 
	 * @param {String} uri 要加载的数据的uri
	 * @param {Object} options 配置对象，如：isAsync,data,arguments,onSuccess,onError,onComplete,onTimeout,timeout,contentType,type
	 * @return {Object} ajax 返回一个ajax对象，可以abort掉
	 */
	ajax = function(uri, options){
		var httpRequest,
			httpSuccess,
			timeout,
			isTimeout = false,
			isComplete = false;
		
		options = {
			method: options.method || "GET",
			data: options.data || null,
			arguments: options.arguments || null,

			onSuccess: options.onSuccess || function(){},
			onError: options.onError || function(){},
			onComplete: options.onComplete || function(){},
			//尚未测试
			onTimeout: options.onTimeout || function(){},

			isAsync: options.isAsync || true,
			timeout: options.timeout ? options.timeout : 30000,
			contentType: options.contentType ? options.contentType : "utf-8",
			type: options.type || "xml"
		};
		uri = uri || "";
		timeout = options.timeout;
		
		
		httpRequest = new window.XMLHttpRequest();
		httpRequest.open(options.method, uri, options.isAsync);
		//设置编码集
		//httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		httpRequest.setRequestHeader("Content-Type",options.contentType);

		/**
		 * @ignore
		 */
		httpSuccess = function(r){
			try{
				return (!r.status && location.protocol == "file:")
					|| (r.status>=200 && r.status<300)
					|| (r.status==304)
					|| (navigator.userAgent.indexOf("Safari")>-1 && typeof r.status=="undefined");
			}catch(e){
				//J.out("错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
			}
			return false;
		}
		

		httpRequest.onreadystatechange=function (){
			if(httpRequest.readyState==4){
				if(!isTimeout){
					var o={};
						o.responseText = httpRequest.responseText;
						o.responseXML = httpRequest.responseXML;
						o.data= options.data;
						o.status= httpRequest.status;
						o.uri=uri;
						o.arguments=options.arguments;
						
					if(httpSuccess(httpRequest)){
						if(options.type === "script"){
							eval.call(window, data);
						}
						options.onSuccess(o);
						
					}else{
						options.onError(o);
					}
					options.onComplete(o);
				}
				isComplete = true;
				//删除对象,防止内存溢出
				httpRequest=null;
			}
		};
		
		httpRequest.send(options.data);
		
		window.setTimeout(function(){
			var o;
			if(!isComplete){
				isTimeout = true;
				o={};
				o.uri=uri;
				o.arguments=options.arguments;
				options.onTimeout(o);
				options.onComplete(o);
			}
		}, timeout);	
		
		return httpRequest;
	};

	
	/**
	 * comet方法
	 * 
	 * @memberOf http
	 * @method	comet
	 * @param {String} uri uri地址
	 * @param {Object} options 配置对象
	 * @return {Object} 返回一个comet dom对象
	 */
	comet = function(uri, options){

		uri = uri || "";
		options = {
			method : options.method || "GET",
			data : options.data || null,
			arguments : options.arguments || null,
			callback : options.callback || function(){},
			onLoad : options.onLoad || function(){},

			contentType: options.contentType ? options.contentType : "utf-8"
		};

		var connection;
		if(J.browser.ie){
			var htmlfile = new ActiveXObject("htmlfile");
			htmlfile.open();
			htmlfile.close();
			var iframediv = htmlfile.createElement("div");
			htmlfile.appendChild(iframediv);
			htmlfile.parentWindow._parent = self;
      		iframediv.innerHTML = '<iframe id="_cometIframe" src="'+uri+'?callback=window.parent._parent.'+options.callback+'"></iframe>';
      		
			connection = htmlfile.getElementById("_cometIframe");
		
		}
		else{
			connection = $D.node("iframe");
			connection.setAttribute("id", "_cometIframe");
			connection.setAttribute("src", uri+'?callback=window.parent._parent.'+options.callback);
			connection.style.position = "absolute";
			connection.style.visibility = "hidden";
			connection.style.left = connection.style.top = "-999px";
			connection.style.width = connection.style.height = "1px";
			document.body.appendChild(connection);
			self._parent = self;
		};

		$E.on(connection,"load", options.onLoad);

		return connection;
		
	};
	

	
	
	
	
	/**
	 * 这是load方法
	 * 
	 * @memberOf http
	 * @method load
	 * 
	 * @param {String} type 一个配置对象
	 * @param {Object} options 一个配置对象
	 * @return {Object} ajax 返回一个ajax对象
	 */
	load = function(type, uri, options){
		var node,
			linkNode,
			scriptNode,
			id,
			head = document.getElementsByTagName("head") ? document.getElementsByTagName("head")[0] : document.documentElement,
			timer,
			isTimeout = false,
			isComplete = false,
			options = options || {},
			isDefer = options.isDefer || false,
			query = options.query || null,
			arguments = options.arguments || null,
			
			onSuccess = options.onSuccess || function(){},
			onError = options.onError || function(){},
			onComplete = options.onComplete || function(){},
			purge,
			//尚未测试
			onTimeout = options.onTimeout || function(){},

//			timeout = options.timeout ? options.timeout : 10000,
			timeout = options.timeout, //az 2011-2-21 修改为默认不需要超时
			charset = options.charset ? options.charset : "utf-8",
			win = options.win || window,
			o,
			
			getId;

        uri = uri || "";
		if(query !== null){
			uri = uri + "?" + query;
		}
		/**
		 * @ignore
		 */
		getId = function(){
	    	return load.Id++;
	    };
	    id = getId();
	    
	    /**
		 * @ignore
		 */
	    purge = function(id){
	    	head.removeChild($("jet_load_" + id));
	    };

        /**
	     * Generates a link node
	     * @method _linkNode
	     * @param uri {string} the uri for the css file
	     * @param win {Window} optional window to create the node in
	     * @return {HTMLElement} the generated node
	     * @private
	     */
	    linkNode = function(uri, win, charset) {
	        var c = charset || "utf-8";
	        return $D.node("link", {
		                "id":		"jet_load_" + id,
		                "type":		"text/css",
		                "charset":	c,
		                "rel":		"stylesheet",
		                "href":		uri
		            }, win);
	    };
	    
		/**
	     * Generates a script node
	     * @method _scriptNode
	     * @param uri {string} the uri for the script file
	     * @param win {Window} optional window to create the node in
	     * @return {HTMLElement} the generated node
	     * @private
	     */
	    scriptNode = function(uri, win, charset, isDefer) {
	        var c = charset || "utf-8";
	        var node = $D.node("script", {
		                "id":		"jet_load_" + id,
		                "type":		"text/javascript",
		                "charset":	c,
		                "src":		uri
		            }, win);
		    if(isDefer){
		    	node.setAttribute("defer", "defer");
		    }
		    
	        return node;
	    };
	    
        
	    
	    if(type === "script"){
            node = options.node || scriptNode(uri, win, charset, isDefer);
        }else if(type === "css"){
            node = options.node || linkNode(uri, win, charset);
        }
        
        
        
        if(J.browser.engine.trident){
            node.onreadystatechange = function() {
                var rs = this.readyState;
                if (rs === "loaded" || rs === "complete") {
                    node.onreadystatechange = null;

                    if(!isTimeout){
                    	isComplete = true;
                    	window.clearTimeout(timer);
                		timer = null;
                    	o={};
						o.id = id;
						o.uri = uri;
						o.arguments = arguments;
                    	onSuccess(o);
                    	onComplete(o);
                    	if(type === "script"){
	                		//purge(id);
	                	}
                    }
                }
            };

        // webkit prior to 3.x is no longer supported
        }else if(J.browser.engine.webkit){
			
            // Safari 3.x supports the load event for script nodes (DOM2)
            $E.on(node, "load", function(){
            	var o;
                if(!isTimeout){
                	isComplete = true;
                	window.clearTimeout(timer);
                	timer = null;
                	o={};
					o.id = id;
					o.uri = uri;
					o.arguments = arguments;
                	onSuccess(o);
                	onComplete(o);
                	if(type === "script"){
                		purge(id);
                	}
                }
            });


        // FireFox and Opera support onload (but not DOM2 in FF) handlers for
        // script nodes.  Opera, but not FF, supports the onload event for link
        // nodes.
        }else{ 
			
            node.onload = function(){
            	var o;
            	//J.out("else:"+J.browser.engine.name);
                if(!isTimeout){
                	isComplete = true;
                	window.clearTimeout(timer);
                	timer = null;
                	o={};
					o.id = id;
					o.uri = uri;
					o.arguments = options.arguments;
                	onSuccess(o);
                	onComplete(o);
                	
                	if(type === "script"){
                		purge(id);
                	}
                }
            };

            node.onerror = function(e){
            	var o;
            	//J.out("else:"+J.browser.engine.name);
                if(!isTimeout){
                	isComplete = true;
                	window.clearTimeout(timer);
                	timer = null;
                	o={};
					o.id = id;
					o.uri = uri;
					o.arguments = arguments;
					o.error = e;
                	onError(o);
                	onComplete(o);
                	//if(type === "script"){
                		purge(id);
                	//}
                }
            };
        }
        
        
        if(options.node){
        	if(type === "script"){
	            node.src = uri;
	        }else if(type === "css"){
	            node.href = uri;
	        }
        }else{
        	head.appendChild(node);
        }
       
        
        if(type === "script"){
            if(timeout){
                timer = window.setTimeout(function(){
    				var o;
    				if(!isComplete){
    					isTimeout = true;
    					o = {};
    					o.uri = uri;
    					o.arguments = arguments;
    					onTimeout(o);
    					onComplete(o);
    					purge(id);
    				}
    			}, timeout);
            }
        }
        
		var func = function(node){
			this._node = node;
			this._head = head;
		};
		func.prototype={
			abort:function(){
				this._node.src="";
				this._head.removeChild(this._node);
				delete this._node;
			}
			
		};
		return new func(node);
	};
	load.Id=0;
	
	/**
	 * 加载CSS
	 * 
	 * @memberOf http
	 * @method loadCss
	 * 
	 * @param {String} uri 要加载的css的uri
	 * @param {Object} options 配置对象，如：isDefer,query,arguments,onSuccess,onError,onComplete,onTimeout,timeout,charset
	 * @return {Object} ajax 返回一个ajax对象
	 */
	loadCss = function(uri, options){
		return load("css", uri, options);
	};
	
	/**
	 * 加载Javascript
	 * 
	 * @memberOf http
	 * @method loadScript
	 * 
	 * @param {String} uri 要加载的js脚本的uri
	 * @param {Object} options 配置对象，如：isDefer,query,arguments,onSuccess,onError,onComplete,onTimeout,timeout,charset
	 * @return {Element} 返回控制对象，可以abort掉
	 */
	loadScript = function(uri, options){
		return load("script", uri, options);
	};
	
	
	
	    /**
     * 使用form请求数据
     * @memberOf alloy.rpcService
     * @param {String} url 
     * @param {Object} option 请求参数
     */
	/**
	 * TODO 这里的form send需要改造，建立一个iframe池，来处理并发问题
	 */
	/**
	 * @description formSend的iframe池，目前定为长度为2
	 * @type {Object}
	 */
    var divEl;
	var formSendIframePool = {
		/**
		 * @example
		 * [[divElement,formElement,iframeElement],[divElement,formElement,iframeElement],,,]
		 */
		_iframes: [],
		_tick: 0,
		/**
		 * 顺序返回一个iframe
		 */
		_select: function() {
			this._tick++;
			return	this._iframes[(this._tick-1)%this._len];
		},
		/**
		 * @description 初始化
		 * @argument {Number} len the number of iframes in poll
		 */
		init: function(len) {
			if(this._isInit==true) {
				return;
			}
			this._len= len;
			var bodyEl=document.body;
			for(var i=0;i<len;i++) {
			    divEl = $D.node("div",{
					"class": "RPCService_hDiv"
				});
				$D.hide(divEl);
				divEl.innerHTML = '<iframe id="RPCService_hIframe_'+i+'" name="RPCService_hIframe_'+i+'" src="'+alloy.CONST.MAIN_URL+'domain.html"></iframe>';	
				bodyEl.appendChild(divEl);
				//not have a iframe yet
				this._iframes[i]=[divEl,null,"RPCService_hIframe_"+i];
			}
			this._isInit= true;
		},
		/**
		 * @description 使用的入口
		 * @argument {Element} iframeEL
		 */
		take: function(formEl) {
			var doms= this._select();
			//if iframe exist
			if(doms[1]) {
				doms[0].removeChild(doms[1]);
			}
			formEl.setAttribute("target",doms[2]);
			doms[1]= formEl;
			doms[0].appendChild(formEl);
		}
	};
	
	formSend = function(url, option){
		formSendIframePool.init(2);
		var opt = {
			method: option.method || "GET",
			enctype: option.enctype || "",	//"multipart/form-data",
			data: option.data || {},  //表单项	
			//尚未测试
			onSuccess: option.onSuccess || function(){},   //iframe 载入成功回调,区别与获取数据成功
			onError: option.onError || function(){},      //iframe 载入失败回调
			onComplete: option.onComplete || function(){},
			
			onTimeout: option.onTimeout || function(){},
			timeout: option.timeout ? option.timeout : 10000
		};
		var formEl = $D.node("form",{
					"class": "RPCService_form",
					method: opt.method,
					action: url+"?t=" + (new Date().getTime()),
					enctype: opt.enctype
				})
		 
	    if(Object.prototype.toString.call(opt.data).indexOf("String")>-1) {
            var inputEl=$D.node("input");
            inputEl.type="text";
            inputEl.name=opt.data;
            formEl.appendChild(inputEl);	    	
	    }else {
    		for(var p in opt.data){
    			var inputEl=$D.node("input");
    			inputEl.type="text";
    			inputEl.name=p;
    			inputEl.setAttribute("value",opt.data[p]);
    			formEl.appendChild(inputEl);
    		}
	    }
		formSendIframePool.take(formEl);			
		formEl.submit();
		
		/* 
		  iframe事件未处理，当载入成功会自动调用回调函数 	 
		  var iframeEl = $D.id("RPCService_hIframe");
		  $E.on(iframeEl, "load", opt.onSuccess); 
		  oFrm.onload = oFrm.onreadystatechange = function() {   
			 if (this.readyState &amp;&amp; this.readyState != 'complete') return;   
			 else {   
				 onComplete();   
			 }  
		*/
	};
	
	
	
	J.http.ajax = ajax;
	J.http.comet = comet;
	J.http.load = load;
	J.http.loadCss = loadCss;
	J.http.loadScript = loadScript;
	J.http.formSend = formSend;
});




/**	
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.kdv.cn/jet/license.txt
 *
 * @fileOverview Jx!
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */

/**	
 * @description
 * Package: jet.cookie
 *
 * Need package:
 * jet.core.js
 * 
 */


/**
 * cookie类
 * 
 * @namespace J.cookie
 */
Jx().$package(function(J){
	var domainPrefix = window.location.host;
	
	/**
	 * @namespace cookie 名字空间
	 * @name cookie
	 */
	J.cookie = 
	/**
	 * @lends cookie
	 */	
	{
		
		/**
		 * 设置一个cookie
		 * 
		 * @param {String} name cookie名称
		 * @param {String} value cookie值
		 * @param {String} domain 所在域名
		 * @param {String} path 所在路径
		 * @param {Number} hour 存活时间，单位:小时
		 * @return {Boolean} 是否成功
		 */
		set : function(name, value, domain, path, hour) {
			if (hour) {
				var today = new Date();
				var expire = new Date();
				expire.setTime(today.getTime() + 3600000 * hour);
			}
			window.document.cookie = name + "=" + value + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + domainPrefix + ";"));
			return true;
		},
	
		/**
		 * 获取指定名称的cookie值
		 * 
		 * @param {String} name cookie名称
		 * @return {String} 获取到的cookie值
		 */
		get : function(name) {
			var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)");
			// var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*?)(?:;|$)");
			var m = window.document.cookie.match(r);
			return (!m ? "" : m[1]);
			// document.cookie.match(new
			// RegExp("(?:^|;+|\\s+)speedMode=([^;]*?)(?:;|$)"))
		},
	
		/**
		 * 删除指定cookie,复写为过期
		 * 
		 * @param {String} name cookie名称
		 * @param {String} domain 所在域
		 * @param {String} path 所在路径
		 */
		remove : function(name, domain, path) {
			window.document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + domainPrefix + ";"));
		}
	};

});
Jx().$package(function(J){
    J.localStorage = 
    /**
     * @lends localStorage
     */ 
    {
        
        /**
         * 设置一个localStorage
         * 
         */
        setItem : function(name, value) {
            if(this.isSupports()){
                window.localStorage.setItem(name,value);
            }
        },
        getItem : function(name) {
            if(this.isSupports()){
                return window.localStorage.getItem(name);
            }
            return null;
        },
    
        removeItem : function(name) {
            if(this.isSupports()){
                window.localStorage.removeItem(name);
            }
        },
        clear : function(){
            if(this.isSupports()){
                window.localStorage.clear();
            }
        },
        isSupports : function(){
            return ('localStorage' in window)&&window['localStorage']!== null;
        }
    };

});













/**	
 * @description
 * Package: jet.mini
 *
 * Need package:
 * jet.core.js
 * 
 */
 
Jx().$package(function(J){

	
/**
 * "mini" Selector Engine
 * Copyright (c) 2009 James Padolsey
 * -------------------------------------------------------
 * Dual licensed under the MIT and GPL licenses.
 *    - http://www.opensource.org/licenses/mit-license.php
 *    - http://www.gnu.org/copyleft/gpl.html
 * -------------------------------------------------------
 * Version: 0.01 (BETA)
 */


var mini = (function(){
    
    var snack = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
        exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/,
        exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/,
        exprNodeName = /^([\w\*\-_]+)/,
        na = [null,null];
    
    function _find(selector, context) {
        
        /**
         * This is what you call via x()
         * Starts everything off...
         */
        
        context = context || document;
        
        var simple = /^[\w\-_#]+$/.test(selector);
        
        if (!simple && context.querySelectorAll) {
            return realArray(context.querySelectorAll(selector));
        }
        
        if (selector.indexOf(',') > -1) {
            var split = selector.split(/,/g), ret = [], sIndex = 0, len = split.length;
            for(; sIndex < len; ++sIndex) {
                ret = ret.concat( _find(split[sIndex], context) );
            }
            return unique(ret);
        }
        
        var parts = selector.match(snack),
            part = parts.pop(),
            id = (part.match(exprId) || na)[1],
            className = !id && (part.match(exprClassName) || na)[1],
            nodeName = !id && (part.match(exprNodeName) || na)[1],
            collection;
            
        if (className && !nodeName && context.getElementsByClassName) {
            
            collection = realArray(context.getElementsByClassName(className));
            
        } else {
            
            collection = !id && realArray(context.getElementsByTagName(nodeName || '*'));
            
            if (className) {
                collection = filterByAttr(collection, 'className', RegExp('(^|\\s)' + className + '(\\s|$)'));
            }
            
            if (id) {
                var byId = context.getElementById(id);
                return byId?[byId]:[];
            }
        }
        
        return parts[0] && collection[0] ? filterParents(parts, collection) : collection;
        
    }
    
    function realArray(c) {
        
        /**
         * Transforms a node collection into
         * a real array
         */
        
        try {
            return Array.prototype.slice.call(c);
        } catch(e) {
            var ret = [], i = 0, len = c.length;
            for (; i < len; ++i) {
                ret[i] = c[i];
            }
            return ret;
        }
        
    }
    
    function filterParents(selectorParts, collection, direct) {
        
        /**
         * This is where the magic happens.
         * Parents are stepped through (upwards) to
         * see if they comply with the selector.
         */
        
        var parentSelector = selectorParts.pop();
        
        if (parentSelector === '>') {
            return filterParents(selectorParts, collection, true);
        }
        
        var ret = [],
            r = -1,
            id = (parentSelector.match(exprId) || na)[1],
            className = !id && (parentSelector.match(exprClassName) || na)[1],
            nodeName = !id && (parentSelector.match(exprNodeName) || na)[1],
            cIndex = -1,
            node, parent,
            matches;
            
        nodeName = nodeName && nodeName.toLowerCase();
            
        while ( (node = collection[++cIndex]) ) {
            
            parent = node.parentNode;
            
            do {
                
                matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
                matches = matches && (!id || parent.id === id);
                matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
                
                if (direct || matches) { break; }
                
            } while ( (parent = parent.parentNode) );
            
            if (matches) {
                ret[++r] = node;
            }
        }
        
        return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) : ret;
        
    }
    
    
    var unique = (function(){
        
        var uid = +new Date();
                
        var data = (function(){
         
            var n = 1;
         
            return function(elem) {
         
                var cacheIndex = elem[uid],
                    nextCacheIndex = n++;
         
                if(!cacheIndex) {
                    elem[uid] = nextCacheIndex;
                    return true;
                }
         
                return false;
         
            };
         
        })();
        
        return function(arr) {
        
            /**
             * Returns a unique array
             */
            
            var length = arr.length,
                ret = [],
                r = -1,
                i = 0,
                item;
                
            for (; i < length; ++i) {
                item = arr[i];
                if (data(item)) {
                    ret[++r] = item;
                }
            }
            
            uid += 1;
            
            return ret;
    
        };
    
    })();
    
    function filterByAttr(collection, attr, regex) {
        
        /**
         * Filters a collection by an attribute.
         */
        
        var i = -1, node, r = -1, ret = [];
        
        while ( (node = collection[++i]) ) {
            if (regex.test(node[attr])) {
                ret[++r] = node;
            }
        }
        
        return ret;
    }
    
    return _find;
    
})();




	/*
	 * ////////////////////////////////////////////////////////////////
	 * 
	 * Adapter to JET
	 * 
	 * ////////////////////////////////////////////////////////////////
	 */
	/**
	 * 一个据说比jq还快的筛选器，可以满足日常99%的筛选需要
	 * 
	 * @param {String} query string 筛选器语法
	 * @returns {Element} 返回筛选出的dom元素
	 * 
	 * @example
	 * //创建一个匿名package包：
	 * Jx().$package(function(J){
	 * 	//这时上下文对象this指向全局window对象
	 * 	var lists = J.dom.mini(".list");
	 * };
	 * 
	 */
	J.dom.mini = mini;



});

/**	
 * JET (Javascript Extend Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * 
 *
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * 
 */

/**	
 * @description
 * Package: jet.json
 *
 * Need package:
 * jet.core.js
 * 
 */

/**
 * [Javascript core part]: JSON 扩展
 */
 
 
Jx().$package(function(J){
	var JSON = {};



	
	
	
	
/*
    http://www.JSON.org/json2.js
    2009-08-17

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

"use strict";

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

/*
if (!this.JSON) {
    this.JSON = {};
}
*/

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }
	// if (typeof Date.prototype.toJSON !== 'function') {
    if (typeof Date.prototype.toJSON !== 'function' && false) {
		/** 
		 * @ignore
		 */
        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };
		/** 
		 * @ignore
		 */
        String.prototype.toJSON =
        /** 
		 * @ignore
		 */
        Number.prototype.toJSON =
        /** 
		 * @ignore
		 */
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };

    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());


	J.json = JSON;


});



















/**	
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.kdv.cn/jet/license.txt
 *
 * @fileOverview Jx!
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */
 
 
/**	
 * @description
 * Package: jet.fx
 * 
 * Need package:
 * jet.core.js
 * 
 */
 
 
 /**
 * fx
 */
Jx().$package(function(J){
	J.fx = J.fx || {};
	
});
/**
 * tween模块
 */
Jx().$package(function(J){
	var $D = J.dom,
		$E = J.event;

	/**
	 * 动画缓动公式
	 * 
	 * Linear：无缓动效果；
	 * Quadratic：二次方的缓动（t^2）；
	 * Cubic：三次方的缓动（t^3）；
	 * Quartic：四次方的缓动（t^4）；
	 * Quintic：五次方的缓动（t^5）；
	 * Sinusoidal：正弦曲线的缓动（sin(t)）；
	 * Exponential：指数曲线的缓动（2^t）；
	 * Circular：圆形曲线的缓动（sqrt(1-t^2)）；
	 * Elastic：指数衰减的正弦曲线缓动；
	 * Back：超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
	 * Bounce：指数衰减的反弹缓动。
	 * 
	 * 每个效果都分三个缓动方式（方法），分别是：
	 * easeIn：从0开始加速的缓动；
	 * easeOut：减速到0的缓动；
	 * easeInOut：前半段从0开始加速，后半段减速到0的缓动。
	 * 其中Linear是无缓动效果，没有以上效果。
	 * 
	 * p,pos: current（当前）；
	 * x: value（其他参数）；
	 */
	var Transition = new J.Class({
		init:function(transition, params){
			params = J.array.toArray(params);
			
			var newTransition =  J.extend(transition, {
				//从0开始加速的缓动；
				easeIn: function(pos){
					return transition(pos, params);
				},
				//减速到0的缓动；
				easeOut: function(pos){
					return 1 - transition(1 - pos, params);
				},
				//前半段从0开始加速，后半段减速到0的缓动。
				easeInOut: function(pos){
					return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
				}
			});
			
			return newTransition;
		}
	});
	
	var transitions = {
		// linear：无缓动效果；
		linear: function(p){
			return p;
		},
		extend : function(newTransitions){
			for (var transition in newTransitions){
				this[transition] = new Transition(newTransitions[transition]);
			}
		}
	
	};
	

	
	
	transitions.extend({
		
		// pow：n次方的缓动（t^n）,n默认为6；
		pow: function(p, x){
			return Math.pow(p, x && x[0] || 6);
		},
		
		// exponential：指数曲线的缓动（2^t）；
		exponential: function(p){
			return Math.pow(2, 8 * (p - 1));
		},
		
		// circular：圆形曲线的缓动（sqrt(1-t^2)）；
		circular: function(p){
			return 1 - Math.sin(Math.acos(p));
		},
	
		// sinusoidal：正弦曲线的缓动（sin(t)）；
		sinusoidal: function(p){
			return 1 - Math.sin((1 - p) * Math.PI / 2);
		},
	
		// back：超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
		back: function(p, x){
			x = x && x[0] || 1.618;
			return Math.pow(p, 2) * ((x + 1) * p - x);
		},
		
		// bounce：指数衰减的反弹缓动。
		bounce: function(p){
			var value;
			for (var a = 0, b = 1; 1; a += b, b /= 2){
				if (p >= (7 - 4 * a) / 11){
					value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
					break;
				}
			}
			return value;
		},
	
		// elastic：指数衰减的正弦曲线缓动；
		elastic: function(p, x){
			return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x && x[0] || 1) / 3);
		}
	
	});

	// quadratic,cubic,quartic,quintic：2-5次方的缓动（t^5）；
	var pows = ['quadratic', 'cubic', 'quartic', 'quintic'];
	J.array.forEach(pows, function(transition, i){
		transitions[transition] = new Transition(function(p){
			return Math.pow(p, [i + 2]);
		});
	});
	
	
	
	/**
	 * 节拍器类
	 * 
	 * @param {Number} duration: 节拍时长，单位毫秒
	 * @param {Number} loop: 循环次数,默认为1,0为无限循环
	 * @param {Number} fps: fps你懂的
	 * @return 节拍器实例
	 */
	var Beater = new J.Class({
		init : function(option){
			
			this.option = option = J.extend({
				duration:500,
				loop:1,
				//不建议fps超过62，因为浏览器setInterval方法的限制，最小时间间隔是16ms，所以每秒实际帧速不能超过62帧
				fps:1000/(option && option.duration || 500)
			}, option);
		},

		start: function(){
			if (!this.check()){
				return this;
			}
			var option = this.option;
			this.time = 0;
			this.loop = option.loop;
			this.onStart.apply(this, arguments);
			this.startTimer();
			return this;
		},
		
		pause: function(){
			this.stopTimer();
			return this;
		},

		resume: function(){
			this.startTimer();
			return this;
		},

		end: function(){
			if (this.stopTimer()){
				this.onEnd.apply(this, arguments);
			}
			return this;
		},

		cancel: function(){
			if (this.stopTimer()){
				this.onCancel.apply(this, arguments);
			}
			return this;
		},

		onStart: function(){
			$E.notifyObservers(this, "start");
		},

		onEnd: function(){
			$E.notifyObservers(this, "end");
		},

		onCancel: function(){
			$E.notifyObservers(this, "cancel");
		},

		onLoop: function(){
			$E.notifyObservers(this, "loop");
		},

		onBeater: function(){
			$E.notifyObservers(this, "beater");
		},

		check: function(){
			if (!this.timer){
				return true;
			}
			return false;
		},

        setDuration: function(duration){
            this.option.duration = duration || 500;
        },
        
		update: function(){
			var that = this,
				time = J.now(),
				option = that.option;
			if (time < that.time + that.option.duration){
				that.onBeater((time - that.time) / option.duration);
			} else {
				that.onBeater(1);
				that.onLoop();
				if(option.loop<=0 || --that.loop){
					that.time = time;
				}else{
					that.stopTimer();
					that.onEnd();
				}
			}
		},

		stopTimer: function(){
			if (!this.timer){
				return false;
			}
			this.time = J.now() - this.time;
			this.timer = removeInstance(this);
			return true;
		},

		startTimer: function(){
			if (this.timer) return false;
			this.time = J.now() - this.time;
			this.timer = addInstance(this);
			return true;
		}
	});
	
	var instances = {}, timers = {};

	var loop = function(list){
		for (var i = list.length; i--;){
			if (list[i]){
				list[i].update();
			}
		}
	};

	var addInstance = function(instance){
		var fps = instance.option.fps,
			list = instances[fps] || (instances[fps] = []);
		list.push(instance);
		if (!timers[fps]){
			timers[fps] = setInterval(function(){
				loop(list);
			}, Math.round(1000 / fps));
		}
		return true;
	};

	var removeInstance = function(instance){
		var fps = instance.option.fps,
			list = instances[fps] || [];
		J.array.remove(list,instance);
		if (!list.length && timers[fps]){
			timers[fps] = clearInterval(timers[fps]);
		}
		return false;
	};
	
	
	
	/**
	 * 动画类
	 * 
	 * @param {Element} element: 动画的dom
	 * @param {String} property: css 属性
	 * @param {Mix} from: 起始值
	 * @param {Mix} to: 到达值
	 * @param {String} unit: 单位
	 * @param {Number} duration: 动画时长，单位毫秒
	 * @param {Number} loop: 循环次数,默认为1,0为无限循环
	 * @param {Function} transition: 变化公式
	 * @param {Number} fps: fps你懂的
	 * @param {Function} css属性转换器
	 * @return 动画实例
	 */
	var Animation = new J.Class({extend:Beater},{
		init : function(option){
			Animation.superClass['init'].apply(this,arguments);
			this.option = this.option || {};
			option = J.extend(this.option, {
				element: null, 
				property: "", 
				from: 0, 
				to: 1,
				unit:false,
				transition: transitions.linear,
				//不建议fps超过62，因为浏览器setInterval方法的限制，最小时间间隔是16ms，所以每秒实际帧速不能超过62帧
				fps:25,
				converter:converter
			}, option);
			this.from = option.from;
			this.to = option.to;
		},

		getTransition: function(){
			var transition = this.option.transition || transitions.sinusoidal.easeInOut;
			return transition;
		},

		set: function(now){
			var option = this.option;
			this.render(option.element, option.property, now, option.unit);
			return this;
		},
        
        setFromTo: function(from, to){
            this.from = from;
            this.to = to;
        },
        
		render: function(element, property, value, unit){
			$D.setStyle(element, property, this.option.converter(value,unit));
		},

		compute: function(from, to, delta){
			return compute(from, to, delta);
		},

		onStart: function(from,to){
			var that = this;
			var option = that.option;
			that.from = J.isNumber(from) ? from : option.from;
			that.to = J.isNumber(to) ? to : option.to;
			$E.notifyObservers(this, "start");
		},

		onEnd: function(){
			var that = this;
			var delta = that.option.transition(1);
			that.set(that.compute(that.from, that.to, delta));
			$E.notifyObservers(this, "end");
		},

		onCancel: function(){
			var that = this;
			var delta = that.option.transition(0);
			that.set(that.compute(that.from, that.to, delta));
			$E.notifyObservers(this, "cancel");
		},

		onBeater: function(progress){
			var that = this;
			var delta = that.option.transition(progress);
			that.set(that.compute(that.from, that.to, delta));
		}
	});
	
	var compute = function(from, to, delta){
		return (to - from) * delta + from;
	};

	var converter = function(value,unit){
		return (unit) ? value + unit : value;
	};
	
    /**
     * TODO 这是原来的动画类, peli改了原来的动画类,抽出了节拍器, 
     * 但是新的动画类有问题,但是我没时间改, 就先用着旧的
     * by az , 2011-3-28
     * 
     * @param {Element} element: 动画的dom
     * @param {String} property: css 属性
     * @param {Mix} from: 起始值
     * @param {Mix} to: 到达值
     * @param {String} unit: 单位
     * @param {Number} duration: 动画时长，单位毫秒
     * @param {Function} transition: 变化公式
     * @param {Number} fps: fps你懂的
     * 
     * @return 动画实例
     */
    var Animation2 = new J.Class({
        init : function(option){
            //el, style, begin, end, fx, total
            this.option = option = J.extend({
                element: null, 
                property: "", 
                from: 0, 
                to: 0,
                unit:false,
                duration:500,
                transition: transitions.linear,
                //不建议fps超过62，因为浏览器setInterval方法的限制，最小时间间隔是16ms，所以每秒实际帧速不能超过62帧
                fps:25
            }, option);
            
            this.from = option.from;
            this.to = option.to;
            

        },

        
        getTransition: function(){
            var transition = this.option.transition || transitions.sinusoidal.easeInOut;
            return transition;
        },
        update: function(){
            var that = this,
                time = J.now();
            var option = that.option;
            if (time < that.time + that.option.duration){
                var delta = option.transition((time - that.time) / option.duration);
                that.set(that.compute(that.from, that.to, delta));
            } else {
                that.set(that.compute(that.from, that.to, 1));
                that.end();
                
            }
        },

        set: function(now){
            var option = this.option;
            this.render(option.element, option.property, now, option.unit);
            return this;
        },
        
        setDuration: function(duration){
            this.option.duration = duration || 500;
        },
        
        setFromTo: function(from, to){
            this.from = from;
            this.to = to;
        },
        
        render: function(element, property, value, unit){
            value = (unit) ? value + unit : value;
            $D.setStyle(element, property, value);
        },

        compute: function(from, to, delta){
            return compute(from, to, delta);
        },

        check: function(){
            if (!this.timer){
                return true;
            }
            return false;
        },

        start: function(from, to){
            var that = this;
            if (!that.check(from, to)){
                return that;
            }
            var option = that.option;
            that.from = J.isNumber(from) ? from : option.from;
            that.to = J.isNumber(to) ? to : option.to;
            
            that.time = 0;
            that.startTimer();
            that.onStart();
            
            return that;
        },

        end: function(){
            if (this.stopTimer()){
                this.onEnd();
            }
            return this;
        },

        cancel: function(){
            if (this.stopTimer()){
                this.onCancel();
            }
            return this;
        },

        onStart: function(){
            $E.notifyObservers(this, "start");
        },

        onEnd: function(){
            $E.notifyObservers(this, "end");
        },

        onCancel: function(){
            $E.notifyObservers(this, "cancel");
        },

        pause: function(){
            this.stopTimer();
            return this;
        },

        resume: function(){
            this.startTimer();
            return this;
        },

        stopTimer: function(){
            if (!this.timer){
                return false;
            }
            this.time = J.now() - this.time;
            this.timer = removeInstance(this);
            return true;
        },

        startTimer: function(){
            if (this.timer) return false;
            this.time = J.now() - this.time;
            this.timer = addInstance(this);
            return true;
        }
    });
	
	J.fx.Beater = Beater;
	J.fx.Animation = Animation;
	J.fx.Animation2 = Animation2;
	J.fx.transitions = transitions;
});














/**	
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, KDV.cn, All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.kdv.cn/jet/license.txt
 *
 * @fileOverview Jx!
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */


/**	
 * @description
 * Package: jet.ui
 *
 * Need package:
 * jet.core.js
 * 
 */


/**
 * ui模块包
 */
Jx().$package(function(J){
	/**
	 * ui 名字空间
	 * 
	 * @namespace
	 * @memberOf Jx
	 * @name ui
	 */
	J.ui = J.ui || {};
});


/**
 * 拖拽模块
 */
Jx().$package(function (J) {
    var $D = J.dom,
		$E = J.event;

    var ieSelectFix = function (e) {
        e.preventDefault();
        //return false;
    };
	
	var _workAreaWidth=false,
		_workAreaHeight=false,
		_width=false,
		_height=false,
		_limit_right,
		_limit_left,
		_limit_top,
		_limit_bottom;
		
	//for ipad
	var _dragOffsetX,
		_dragOffsetY;
        
    var _dragMaskLayer,
        _maskLayerZIndex = 9000000;
    
    /**
	 * 拖拽类
	 * 
	 * @memberOf Jx.ui
	 * @class
	 * @name Drag
	 * 
	 * @param {Element} apperceiveEl 监听拖拽动作的元素
	 * @param {Element} effectEl 展现拖拽结果的元素
	 * @param {Object} option 其他选项，如:isLimited,leftMargin...
	 * @returns
	 * 
	 * var limiteOption = {
			isLimited : 是否有界限,
			clientEl :盒子模型,边界用
			rightMargin : 边界距离,
			leftMargin : 边界距离,
			bottomMargin : 边界距离,
			topMargin : 边界距离,
			isOverLeft:
			isOverRight:
			isOverTop:
			isOverBottom:能否超出边界,支持拖出去
		};
	 */
    J.ui.Drag = new J.Class({
        init: function (apperceiveEl, effectEl, option) {
            var context = this;
            var curDragElementX, curDragElementY, dragStartX, dragStartY;
            this.apperceiveEl = apperceiveEl;
            option = option || {};
            this.isLimited = option.isLimited || false;
			this.dragType = option.dragType;
            this.isLocked = option.isLocked || false;;
            var isMoved = false;
            if (this.isLimited) {
                this._leftMargin = option.leftMargin || 0;
                this._topMargin = option.topMargin || 0;
                this._rightMargin = option.rightMargin || 0;
                this._bottomMargin = option.bottomMargin || 0;
            }
            if(option.xOnly){
            	this._xOnly = option.xOnly||false;
            }
            if(option.yOnly){
            	this._yOnly = option.yOnly||false;
            }
			//TODO for flex wmode-non-transparent

            if (effectEl === false) {
                this.effectEl = false;
            } else {
                this.effectEl = effectEl || apperceiveEl;
            }



            this.dragStart = function (e) {
                if(context.isLocked){
                    return;
                }
				if(e.changedTouches){//多点触摸
					if(e.changedTouches.length>1){
						return;
					}
					e=e.changedTouches[0];
					document.body.style['WebkitTouchCallout']='none';
				}else{
					e.preventDefault();
					e.stopPropagation();
				}
				//缓存高宽
                $E.notifyObservers(context, "beforeStart");
//				if(this.dragType){//jet框架跟alloy耦合不好
//					$E.notifyObservers(alloy, "dragBeforeStart",this.dragType);
//				}
				_workAreaWidth = option.clientEl?$D.getClientWidth(option.clientEl):$D.getClientWidth();
				_workAreaHeight = option.clientEl?$D.getClientHeight(option.clientEl):$D.getClientHeight();
				_width = context.effectEl ? parseInt($D.getClientWidth(context.effectEl)) : 0;
				_height = context.effectEl ? parseInt($D.getClientHeight(context.effectEl)) : 0;

				if (context.isLimited) {
                    _limit_right = _workAreaWidth - _width - context._rightMargin;
                    _limit_left = context._leftMargin;
					_limit_top = context._topMargin;
					_limit_bottom = _workAreaHeight - _height - context._bottomMargin;

                }
                if(!_dragMaskLayer){
                    _dragMaskLayer = new J.ui.MaskLayer({opacity: 0});
//                    _maskLayerZIndex = alloy.layout.getTopZIndex(2);
                }
                _dragMaskLayer.setZIndex(_maskLayerZIndex);
                _dragMaskLayer.show();
//                context._oldZIndex = $D.getStyle(context.effectEl, 'zIndex') || 0;
//                J.out('dragStart - _oldZIndex: ' + context._oldZIndex + '::' + _maskLayerZIndex);
//                $D.setStyle(context.effectEl, 'zIndex', _maskLayerZIndex + 1);
                
                
				context._oldX=curDragElementX = context.effectEl ? parseInt($D.getStyle(context.effectEl, "left")) : 0;
				context._oldY=curDragElementY = context.effectEl ? parseInt($D.getStyle(context.effectEl, "top")) : 0;
                dragStartX = e.pageX;
                dragStartY = e.pageY;
				if(J.browser.mobileSafari){
					$E.on(document, 'touchmove', context.dragMove);
					$E.on(document, 'touchend', context.dragStop);
					
					var oldMatrix=new WebKitCSSMatrix(window.getComputedStyle(context.apperceiveEl).webkitTransform);
					_dragOffsetX = e.pageX - oldMatrix.m41;
					_dragOffsetY = e.pageY - oldMatrix.m42;
					
				}else{
					$E.on(document, "mousemove", context.dragMove);
					$E.on(document, "mouseup", context.dragStop);
				}
                if (J.browser.ie) {
                    $E.on(document.body, "selectstart", ieSelectFix);
                }
                if(J.browser.mobileSafari){
                	$E.notifyObservers(context, "start", { x: e.pageX, y: e.pageY });
                }else{
                	$E.notifyObservers(context, "start", { x: curDragElementX, y: curDragElementY });
                }      
            };

            this.dragMove = function (e) {
                if(context.isLocked){
                    return;
                }
				if(e.browserEvent){
					e.browserEvent.preventDefault();
					e.browserEvent.stopPropagation();
				}else{
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.changedTouches){//多点触摸
					
					e=e.changedTouches[0];
				}
				var x,y;
				if(!J.browser.mobileSafari){
					x = curDragElementX + (e.pageX - dragStartX);
					y = curDragElementY + (e.pageY - dragStartY);
                }

                if (context.isLimited) {
					if(x>_limit_right &&!option.isOverRight ){
						x=_limit_right;
					}
					if(x<_limit_left && !option.isOverLeft){
						x=_limit_left;
					}

                }
                if (context._oldX !== x&&!context._yOnly) {
                    context._oldX = x;
                    if (context.effectEl && !J.browser.mobileSafari) {
                        context.effectEl.style.left = x + "px";
                    }
                    isMoved = true;
                }
				
                //J.out("context._topMargin: "+context._topMargin);
                if (context.isLimited) {
                    if (y > _limit_bottom && !option.isOverBottom) {
                        y = _limit_bottom;
                    }
                    if (y < _limit_top && !option.isOverTop) {
                        y = _limit_top;
                    }
                }

                if (context._oldY !== y&&!context._xOnly) {
                    context._oldY = y;
                    if (context.effectEl && !J.browser.mobileSafari) {
                        context.effectEl.style.top = y + "px";
                    }
                    isMoved = true;
                }
				
				//for ipad...BAD SMELL.
				var notifyX = x,
					notifyY = y;
				if(context.effectEl && J.browser.mobileSafari){
					context._oldX = curDragElementX + (e.pageX - dragStartX);
					context._oldY = curDragElementY + (e.pageY - dragStartY);
					if(!context._yOnly){
						x = e.pageX - _dragOffsetX;
					}else{
						x = curDragElementX;
					}
					if(!context._xOnly){
						y = e.pageY - _dragOffsetY;
					}else{
						y = curDragElementY;
					}
					context.effectEl.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';
					notifyX = e.pageX;
					notifyY = e.pageY;
				}


                if (isMoved) {
                    $E.notifyObservers(context, "move", { x: notifyX, y: notifyY, orientEvent:e });
                }

            };
			
            this.dragStop = function (e) {
                if(context.isLocked){
                    return;
                }
                _dragMaskLayer.hide();
//                J.out('dragStop - _oldZIndex: ' + context._oldZIndex);
//                $D.setStyle(context.effectEl, 'zIndex', context._oldZIndex);
                
				document.body.style['WebkitTouchCallout']='auto';
            	if(isMoved || J.browser.mobileSafari) {
					var x=context._oldX;
					var y=context._oldY;
					if (context.isLimited) {
						if(x>_limit_right){
							x=_limit_right;
						}
						if(x<_limit_left){
							x=_limit_left;
						}
					}
					if (context.isLimited) {
						if (y > _limit_bottom) {
							y = _limit_bottom;
						}
						if (y < _limit_top) {
							y = _limit_top;
						}
					}
					if(J.browser.mobileSafari){
						e.preventDefault();
						if(option.noEndCallback && context.effectEl){
							context.effectEl.style.webkitTransform  = 'none';
							$D.setStyle(context.effectEl,'left',x+'px');
							$D.setStyle(context.effectEl,'top',y+'px');
						}
						$E.notifyObservers(context, "end", { x: x, y: y, orientEvent:e.changedTouches[0] });
					}else{
						$E.notifyObservers(context, "end", { x: x, y: y, orientEvent:e });
					}
            	}
            	else {
            		$E.notifyObservers(context, "end", {orientEvent:e});
            	}
            	if (context.isLimited&&(context.isOverRight||context.isOverLeft||context.isOverTop||context.isOverBottom)) {
            		var x = curDragElementX + (e.pageX - dragStartX);
               		var y = curDragElementY + (e.pageY - dragStartY);
                    var tempR = _workAreaWidth - _width - context._rightMargin;
                    var tempL = context._leftMargin;
                    var tempB = _workAreaHeight - context._bottomMargin;
                    var tempT = context._topMargin;
                    if (x > tempR||x < tempL||y > tempB||y < tempT) {
                    	//超出边界
                    	$E.notifyObservers(context,"overFlowBorder",{x: x,y: y});
                    	//J.out("overFlow");
                    }
                }
				_workAreaWidth = false;
				_workAreaHeight = false;
				_width = false;
				_height = false;
				if(J.browser.mobileSafari){
					$E.off(document, 'touchmove', context.dragMove);
					$E.off(document, 'touchend', context.dragStop);
				}else{
					$E.off(document, "mousemove", context.dragMove);
					$E.off(document, "mouseup", context.dragStop);
				}
                if (J.browser.ie) {
                    $E.off(document.body, "selectstart", ieSelectFix);
                }
                isMoved= false;
                //J.out("end")
            };

			//if(J.browser.mobileSafari){
			//	$E.on(this.apperceiveEl, "touchstart", this.dragStart);
			//}else{
				$E.on(this.apperceiveEl, "drag", this.dragStart);
			//}
        },
        /**
         * 设置effectEl
         * @param {HTMLElement} el
         */
        setEffect: function(el){
            this.effectEl = el;
        },
        lock: function () {
			//if(J.browser.mobileSafari){
			//	$E.off(this.apperceiveEl, "touchstart", this.dragStart);
			//}else{
                this.isLocked = true;
				$E.off(this.apperceiveEl, "drag", this.dragStart);
			//}
        },
        unlock: function () {
			//if(J.platform.iPad){/
			//	$E.on(this.apperceiveEl, "touchstart", this.dragStart);
			//}else{
                this.isLocked = false;
				$E.on(this.apperceiveEl, "drag", this.dragStart);
			//}
        },
        show: function () {
            $D.show(this.apperceiveEl);
        },
        hide: function () {
            $D.hide(this.apperceiveEl);
        },
        setLimite : function(option){
        	option = option || {};
            this.isLimited = option.isLimited || true;
            if (this.isLimited) {
                this._leftMargin = option.leftMargin || 0;
                this._topMargin = option.topMargin || 0;
                this._rightMargin = option.rightMargin || 0;
                this._bottomMargin = option.bottomMargin || 0;
            }
        }
    });



});






/**
 * Resize 模块
 */
Jx().$package(function (J) {
    J.ui = J.ui || {};
    var $D = J.dom,
		$E = J.event;

    var id = 0;
    var handleNames = {
        t: "t",
        r: "r",
        b: "b",
        l: "l",
        rt: "rt",
        rb: "rb",
        lb: "lb",
        lt: "lt"
    };
    	
    var clientHeight = 0;
    var clientWidth = 0;
    /**
    * resize类
    * 
    * @memberOf Jx.ui
    * @Class
    * 
    * @param {Element} apperceiveEl 监听resize动作的元素
    * @param {Element} effectEl 展现resize结果的元素
    * @param {Object} option 其他选项，如:dragProxy,size,minWidth...
    * @returns 
    * 
    * 
    */
    J.ui.Resize = new J.Class({
        init: function (apperceiveEl, effectEl, option) {
            var context = this;
            option = option || {};

            this.apperceiveEl = apperceiveEl;
            if (effectEl === false) {
                this.effectEl = false;
            } else {
                this.effectEl = effectEl || apperceiveEl;
            }
			
            this.size = option.size || 5;
            this.minWidth = option.minWidth || 0;
            this.minHeight = option.minHeight || 0;
            this._dragProxy = option.dragProxy;
            this.isLimited = option.isLimited || false;
            if (this.isLimited) {
                this._leftMargin = option.leftMargin || 0;
                this._topMargin = option.topMargin || 0;
                this._rightMargin = option.rightMargin || 0;
                this._bottomMargin = option.bottomMargin || 0;
            }

            this._left = this.getLeft();
            this._top = this.getTop();
            this._width = this.getWidth();
            this._height = this.getHeight();

            this.id = this.getId();

            var styles = {
                t: "cursor:n-resize; z-index:1; left:0; top:-5px; width:100%; height:5px;",
                r: "cursor:e-resize; z-index:1; right:-5px; top:0; width:5px; height:100%;",
                b: "cursor:s-resize; z-index:1; left:0; bottom:-5px; width:100%; height:5px;",
                l: "cursor:w-resize; z-index:1; left:-5px; top:0; width:5px; height:100%;",
                rt: "cursor:ne-resize; z-index:2; right:-5px; top:-5px; width:5px; height:5px;",
                rb: "cursor:se-resize; z-index:2; right:-5px; bottom:-5px; width:5px; height:5px;",
                lt: "cursor:nw-resize; z-index:2; left:-5px; top:-5px; width:5px; height:5px;",
                lb: "cursor:sw-resize; z-index:2; left:-5px; bottom:-5px; width:5px; height:5px;"
            };

            this._onMousedown = function () {
                $E.notifyObservers(context, "mousedown", { width: context._width, height: context._height });
            };
            this._onDragEnd = function () {
//                J.out("this._width： " + context._width);
//			    J.out("this._height： " + context._height);
                $E.notifyObservers(context, "end", {
                    x: context.getLeft(),
                    y: context.getTop(),
                    width: context.getWidth(),
                    height: context.getHeight()
                });
            };

            for (var p in handleNames) {
                var tempEl = $D.node("div", {
                    "id": "window_" + this.id + "_resize_" + handleNames[p]
                });

                this.apperceiveEl.appendChild(tempEl);
                $D.setCssText(tempEl, "position:absolute; overflow:hidden; background:url(" + J.path + "assets/images/transparent.gif);" + styles[p]);
                if (this._dragProxy) {
                    //$E.on(tempEl, "mousedown", this._onMousedown);
                } else {

                }

                this["_dragController_" + handleNames[p]] = new J.ui.Drag(tempEl, false);

            }



            // 左侧
            this._onDragLeftStart = function (xy) {
                $E.notifyObservers(context, "mousedown", { width: context._width, height: context._height });
                context._startLeft = context._left = context.getLeft();
                context._startWidth = context._width = context.getWidth();
				context._startHeight = context._height = context.getHeight();
            };
            this._onDragLeft = function (xy) {
                var w = context._startWidth - xy.x;
                var x = context._startLeft + xy.x;
                if (w < context.minWidth) {
                    w = context.minWidth;
                    x = context._startLeft + (context._startWidth - w);
                }
                if (context.isLimited && (x - context._leftMargin) < 0) {
                	x = context._leftMargin;
                	w = context._startLeft + context._startWidth - context._leftMargin;
                }
                context.setLeft(x);
                context.setWidth(w);
                $E.notifyObservers(context, "resize", { width: context._width, height: context._height });

            };

            // 上侧
            this._onDragTopStart = function (xy) {
                $E.notifyObservers(context, "mousedown", { width: context._width, height: context._height });
                context._startTop = context._top = context.getTop();
                context._startHeight = context._height = context.getHeight();
            };
            this._onDragTop = function (xy) {
                var h = context._startHeight - xy.y;
                var y = context._startTop + xy.y;
                if (h < context.minHeight) {
                    h = context.minHeight;
                    y = context._startTop + (context._startHeight - h);
                }
                if (context.isLimited && (y - context._topMargin) < 0) {
                	y = context._topMargin;
                	h = context._startTop + context._startHeight - context._topMargin;
                }
                context.setTop(y);
                context.setHeight(h);
                $E.notifyObservers(context, "resize", { width: context._width, height: context._height });
            };



            // 右侧
            this._onDragRightStart = function (xy) {
                 $E.notifyObservers(context, "mousedown", { width: context._width, height: context._height });
				context._startWidth = context._width = context.getWidth();
				context._startLeft = context._left = context.getLeft();
				context._startHeight = context._height = context.getHeight();
                clientWidth = qqweb.layout.getClientWidth();
            };
            this._onDragRight = function (xy) {
                var w = context._startWidth + xy.x;
                if (w < context.minWidth) {
                    w = context.minWidth;
                }
    			var clientWidth = $D.getClientWidth() || 0;
                var maxWidth = clientWidth - context._startLeft - context._rightMargin;
                if (context.isLimited && maxWidth < w) {
                	w = maxWidth;
                }
                context.setWidth(w);
                $E.notifyObservers(context, "resize", { width: context._width, height: context._height });
            };


            // 下侧
            this._onDragBottomStart = function (xy) {
                $E.notifyObservers(context, "mousedown", { width: context._width, height: context._height });
                context._startHeight = context._height = context.getHeight();
                context._startTop = context._top = context.getTop();
                clientHeight = $D.getClientHeight();
            };
            this._onDragBottom = function (xy) {
                var h = context._startHeight + xy.y;
                if (h < context.minHeight) {
                    h = context.minHeight;
                }
                var clientHeight = $D.getClientHeight() || 0;
                var maxHeight = clientHeight - context._startTop - context._bottomMargin;
                if (context.isLimited && maxHeight < h) {
                	h = maxHeight;
                }
                context.setHeight(h);
                $E.notifyObservers(context, "resize", { width: context._width, height: context._height });
            };

            // 左上
            this._onDragLeftTopStart = function (xy) {
                context._onDragLeftStart(xy);
                context._onDragTopStart(xy);
            };
            this._onDragLeftTop = function (xy) {
                context._onDragLeft(xy);
                context._onDragTop(xy);
            };

            // 左下
            this._onDragLeftBottomStart = function (xy) {
                context._onDragLeftStart(xy);
                context._onDragBottomStart(xy);
            };
            this._onDragLeftBottom = function (xy) {
                context._onDragLeft(xy);
                context._onDragBottom(xy);
            };


            // 右下
            this._onDragRightBottomStart = function (xy) {
                context._onDragRightStart(xy);
                context._onDragBottomStart(xy);
            };
            this._onDragRightBottom = function (xy) {
                context._onDragRight(xy);
                context._onDragBottom(xy);
            };

            // 右上
            this._onDragRightTopStart = function (xy) {
                context._onDragRightStart(xy);
                context._onDragTopStart(xy);
            };
            this._onDragRightTop = function (xy) {
                context._onDragRight(xy);
                context._onDragTop(xy);
            };



            $E.addObserver(this["_dragController_" + handleNames.t], "start", this._onDragTopStart);
            $E.addObserver(this["_dragController_" + handleNames.t], "move", this._onDragTop);
            $E.addObserver(this["_dragController_" + handleNames.t], "end", this._onDragEnd);

            $E.addObserver(this["_dragController_" + handleNames.r], "start", this._onDragRightStart);
            $E.addObserver(this["_dragController_" + handleNames.r], "move", this._onDragRight);
            $E.addObserver(this["_dragController_" + handleNames.r], "end", this._onDragEnd);

            $E.addObserver(this["_dragController_" + handleNames.b], "start", this._onDragBottomStart);
            $E.addObserver(this["_dragController_" + handleNames.b], "move", this._onDragBottom);
            $E.addObserver(this["_dragController_" + handleNames.b], "end", this._onDragEnd);

            $E.addObserver(this["_dragController_" + handleNames.l], "start", this._onDragLeftStart);
            $E.addObserver(this["_dragController_" + handleNames.l], "move", this._onDragLeft);
            $E.addObserver(this["_dragController_" + handleNames.l], "end", this._onDragEnd);



            $E.addObserver(this["_dragController_" + handleNames.rb], "start", this._onDragRightBottomStart);
            $E.addObserver(this["_dragController_" + handleNames.rb], "move", this._onDragRightBottom);
            $E.addObserver(this["_dragController_" + handleNames.rb], "end", this._onDragEnd);

            $E.addObserver(this["_dragController_" + handleNames.rt], "start", this._onDragRightTopStart);
            $E.addObserver(this["_dragController_" + handleNames.rt], "move", this._onDragRightTop);
            $E.addObserver(this["_dragController_" + handleNames.rt], "end", this._onDragEnd);

            $E.addObserver(this["_dragController_" + handleNames.lt], "start", this._onDragLeftTopStart);
            $E.addObserver(this["_dragController_" + handleNames.lt], "move", this._onDragLeftTop);
            $E.addObserver(this["_dragController_" + handleNames.lt], "end", this._onDragEnd);

            $E.addObserver(this["_dragController_" + handleNames.lb], "start", this._onDragLeftBottomStart);
            $E.addObserver(this["_dragController_" + handleNames.lb], "move", this._onDragLeftBottom);
            $E.addObserver(this["_dragController_" + handleNames.lb], "end", this._onDragEnd);
        },
        setWidth: function (w) {
            $D.setStyle(this.effectEl, "width", w + "px");
            this._width = w;
        },
        setHeight: function (h) {
            $D.setStyle(this.effectEl, "height", h + "px");
            this._height = h;
        },

        setLeft: function (x) {
            $D.setStyle(this.effectEl, "left", x + "px");
            this._left = x;
        },
        setTop: function (y) {
            $D.setStyle(this.effectEl, "top", y + "px");
            this._top = y;
        },


        getWidth: function () {
            return parseInt($D.getStyle(this.effectEl, "width"));
        },
        getHeight: function () {
            return parseInt($D.getStyle(this.effectEl, "height"));
        },

        getLeft: function () {
            return parseInt($D.getStyle(this.effectEl, "left"));
        },
        getTop: function () {
            return parseInt($D.getStyle(this.effectEl, "top"));
        },
        getId: function () {
            return id++;
        },

        lock: function () {
            for (var p in handleNames) {
                this["_dragController_" + handleNames[p]].lock();
            }
        },
        unlock: function () {
            for (var p in handleNames) {
                this["_dragController_" + handleNames[p]].unlock();
            }
        },
        show: function () {
            for (var p in handleNames) {
                this["_dragController_" + handleNames[p]].show();
            }
        },
        hide: function () {
            for (var p in handleNames) {
                this["_dragController_" + handleNames[p]].hide();
            }
        },
        setLimite : function(option){
        	option = option || {};
            this.isLimited = option.isLimited || true;
            if (this.isLimited) {
                this._leftMargin = option.leftMargin || 0;
                this._topMargin = option.topMargin || 0;
                this._rightMargin = option.rightMargin || 0;
                this._bottomMargin = option.bottomMargin || 0;
            }
        },
        setMinLimite : function(option){
        	option = option||{};
        	this.minWidth = option.minWidth||0;
        	this.minHeight = option.minHeight||0;
        }
    });



});

/**
 * tab模块
 */
Jx().$package(function(J){
	var $ = J.dom.id,
		$D = J.dom,
		$E = J.event;
		
		
	/**
	 * Tab类
	 * 
	 * @memberOf ui
	 * 
	 * @param {Element} triggers tab head元素
	 * @param {Element} sheets tab body元素
	 * @param {Object} config 其他选项，如:isLimited,leftMargin...
	 * @returns
	 * 
	 * 
	 */
	J.ui.Tab = function(triggers,sheets,config){
		this.tabs = [];             //tab的集合
		this.currentTab = null;     //当前tab
		this.config = {
			defaultIndex : 0,       //默认的tab索引
			triggerEvent : 'click', //默认的触发事件
			slideEnabled : false,   //是否自动切换
			slideInterval : 5*1000,   //切换时间间隔
			slideDelay : 300,       //鼠标离开tab继续切换的延时
			autoInit : true,        //是否自动初始化
			onShow:function(){ }    //默认的onShow事件处理函数
		};
	
		this.setConfig(config);

		if(triggers && sheets) {
			this.addRange(triggers,sheets);
			if(this.config.autoInit){
				this.init();
			}
		}
	};
	
	J.ui.Tab.prototype = {
		/**
		 * 设置config
		 * @param {object} config 配置项如{'slideEnabled':true,'defaultIndex':0,'autoInit':false}
		 */
		setConfig:function(config){
			if(!config) return;
			for(var i in config){
				this.config[i] = config[i];
			}
		},
		/**
		 * 增加tab
		 * @param tab={trigger:aaaa, sheet:bbbb} 
		 * @param {string|HTMLElement} trigger
		 * @param {string|HTMLElement} sheet
		 * */
		add:function(tab){
			if(!tab) return;
			
			if(tab.trigger){
				this.tabs.push(tab);
				tab.trigger.style.display = 'block';
			}
		},
		
		/**
		 * 增加tab数组
		 * @param {array} triggers HTMLElement数组
		 * @param {array} sheets HTMLElement数组
		 * */
		addRange:function(triggers, sheets){
			if(!triggers||!sheets) return;
			if(triggers.length && sheets.length && triggers.length == sheets.length){
				for(var i = 0, len = triggers.length; i < len; i++){
					this.add({trigger:triggers[i],sheet:sheets[i]});
				}
			}
		},
		
		/**
		 * 设置tab为当前tab并显示
		 * @param {object} tab  tab对象 {trigger:HTMLElement,sheet:HTMLElement}
		 * */
		select:function(tab){
			if(!tab || (!!this.currentTab && tab.trigger == this.currentTab.trigger)) return;
			if(this.currentTab){
				$D.removeClass(this.currentTab.trigger, 'current');
				if(this.currentTab.sheet){
					this.currentTab.sheet.style.display = 'none';
				}
				
			}
			this.currentTab = tab;
			this.show();
		},
		
		/**
		 * 设置tab为隐藏的
		 * @param {object} tab  tab对象 {trigger:HTMLElement,sheet:HTMLElement}
		 * */
		remove:function(tab){
			if(!tab) return;
			
			
			if(tab.trigger){
				$D.removeClass(tab.trigger, 'current');
				tab.trigger.style.display = 'none';
			}
			if(tab.sheet){
				tab.sheet.style.display = 'none';
			}
			
			var index=this.indexOf(tab);
			this.tabs.splice(index,index);
	
			if(tab.trigger == this.currentTab.trigger){
				if(index==0){
					//this.currentTab=this.tabs[(index+1)];
					this.select(this.tabs[(index+1)]);
				}else{
					//this.currentTab=this.tabs[(index-1)];
					this.select(this.tabs[(index-1)]);
				}
			}
		},
		/**
		 * 显示当前被选中的tab
		 * */
		show:function(){
			
			if(this.currentTab.trigger){
				this.currentTab.trigger.style.display = 'block';
			}
			$D.addClass(this.currentTab.trigger, 'current');
			if(this.currentTab.sheet){
				this.currentTab.sheet.style.display = 'block';
			}
			//触发自定义显示对象
			//tealin
			this.config.onShow.call(this);
			$E.notifyObservers(this, "show", this.currentTab);

		},
		/**
		 * 自动切换
		 * */
		slide:function(){
			var	config = this.config,
				_this = this,
				intervalId,
				delayId;
			J.array.forEach(this.tabs, function(tab, index, tabs){
				$E.on(tab.trigger, 'mouseover' , clear);
				$E.on(tab.sheet, 'mouseover' , clear);
				
				$E.on(tab.trigger, 'mouseout' , delay);
				$E.on(tab.sheet, 'mouseout' , delay);
			});
			start();
			function start() {
				var i = _this.indexOf(_this.currentTab);
				if( i == -1 ) return;
				intervalId = window.setInterval(function(){
					var tab = _this.tabs[ ++i % _this.tabs.length ];
					if(tab){
						_this.select(tab);
					}
				},config['slideInterval']);
			}
			function clear() {
				window.clearTimeout(delayId);
				window.clearInterval(intervalId);	
			}
			function delay() {
				delayId = window.setTimeout(start,config['slideDelay']);
			}
		},
		/**
		* 切换到下一个
		**/
		next:function(){
			var _this = this;
			var i = _this.indexOf(_this.currentTab);
			if(i == -1) return;
			if(++i == _this.tabs.length){
				i = 0;
			}
			var tab = _this.tabs[i];
			if(tab){
				_this.select(tab);
			}
		},
		/**
		* 切换到上一个
		**/
		prev:function(){
			var _this = this;
			var i = _this.indexOf(_this.currentTab);
			if(i == -1) return;
			if(--i == -1){
				i = _this.tabs.length - 1;
			}
			var tab = _this.tabs[i];
			if(tab){
				_this.select(tab);
			}
		},
		/**
		 * 获取tab在tabs数组中的索引
		 * @param {object} tab  tab对象 {trigger:HTMLElement,sheet:HTMLElement}
		 * */
		indexOf:function(tab){
			for(var i = 0, len = this.tabs.length; i < len; i++){
				if(tab.trigger == this.tabs[i].trigger)
					return i;
			}
			return -1;
		},
		/**
		 * 初始化函数
		 * */
		init:function(){
			var config = this.config,
				_this = this;

			J.array.forEach(this.tabs, function(tab, index, tabs){
				$E.on(tab.trigger,config['triggerEvent'], function(){
					_this.select.call(_this,tab);
				});
				if(tab.sheet){
					tab.sheet.style.display = 'none';
				}
			});
			
			this.select(this.tabs[config['defaultIndex']]);
			if(config['slideEnabled']){
				this.slide();
			}
		}
	};

});


Jx().$package(function(J){
	var $D = J.dom,
		$E = J.event;
		
	var iframeScroller = function(iframe){
		this.container=iframe.parentNode;
		if(J.platform.iPad && J.platform.iPad.split(".")[0]>=4) {
	        this.container=iframe.parentNode.parentNode;
		}
		//console.info("container width:"+$D.getWidth(this.container));
		this.iframe=iframe;
		this.holding=false;
		this.posx=0;
		this.posy=0;
		this.offsetX=0;
		this.offsetY=0;
		var context = this;
		this.observers={
			onTouchStart:function(e){
				var touch = e.changedTouches[0];
				context.posx = touch.pageX;
				context.posy = touch.pageY;
				//console.info("iframe height: "+ $D.getHeight(context.iframe));
				context.minX = $D.getWidth(context.container) - $D.getWidth(context.iframe);
				context.minY = $D.getHeight(context.container) - $D.getHeight(context.iframe);
				
				//console.info("minx:"+context.minX+",miny:"+context.minY);
				
				$E.on(context.iframe,"touchmove",context.observers.onTouchMove);
				$E.on(context.iframe,"touchend",context.observers.onTouchEnd);
			},
			onTouchMove:function(e){
				if(e.changedTouches.length>1)return;
				e.preventDefault();
				e.stopPropagation();
				var touch = e.changedTouches[0];
				var posx = touch.pageX;
				var posy = touch.pageY;
				var dx = context.posx - posx;
				var dy = context.posy - posy;				
				
				var newpx = context.offsetX - dx;
				var newpy = context.offsetY - dy;
				
				//console.info("iframe touch move:"+newpx+","+newpy);
				
				if(newpx > 0) newpx = 0;
				else if(newpx < context.minX) newpx = context.minX;
				if(newpy > 0) newpy = 0;
				else if(newpy < context.minY) newpy = context.minY;
				
				//console.info("apple sucks: "+newpy);
				//console.info("iframe touch move:"+newpx+","+newpy);
				
				iframe.style['left'] = newpx + 'px';
				iframe.style['top'] = newpy + 'px';
				
			
				context.offsetX = newpx;
				context.offsetY = newpy;
				context.posx = posx;
				context.posy = posy;
			},
			onTouchEnd:function(){
				$E.off(context.iframe,"touchmove",context.observers.onTouchMove);
				$E.off(context.iframe,"touchend",context.observers.onTouchEnd);
			}
		};
		this.destroy=function(){
			$E.off(this.iframe,"touchstart",this.observers.onTouchStart);	
			$E.off(this.iframe,"touchmove",this.observers.onTouchMove);
			$E.off(this.iframe,"touchend",this.observers.onTouchEnd);
			this.iframe=null;
			this.container=null;
		}
		$E.on(this.iframe,"touchstart",this.observers.onTouchStart);			
	}
	J.ui.IframeScroller = iframeScroller;
	/* 已移出到jx.ui.touchscroller.js
	 
	J.ui.TouchScroller = new J.Class({
		//@TODO options处添加滚动方向设置
		container:null,
		_dx:0,
		_dy:0,
		_posy:0,
		_posx:0,
		_maxOffsetX:0,
		_maxOffsetY:0,
		init: function(dom,touchdom,option){
			this.container = J.isString(dom) ? $D.id(dom) : dom;
			this.touchContainer = touchdom||this.container;
			var context = this;
			this.observer = {
				onTouchStart : function(e){
					//e.stopPropagation();
					//e.preventDefault();
					if(e.changedTouches.length>1){
						return;
					}
					var touch = e.changedTouches[0];
					context._dx = context.container.scrollLeft;
					context._dy = context.container.scrollTop;
					context._posx = touch.pageX;
					context._posy = touch.pageY;
					context.maxOffsetX = context.container.scrollWidth - context.container.clientWidth;
					context.maxOffsetY = context.container.scrollHeight - context.container.clientHeight;
					$E.on(context.touchContainer,'touchmove',context.observer.onTouchMove);
					$E.on(context.touchContainer,'touchend',context.observer.onTouchEnd);
				},
				onTouchMove : function(e){
					//@TODO
					//e.stopPropagation();
					//e.preventDefault();
					var touch=e.changedTouches[0];
					var px=touch.pageX;
					var py=touch.pageY;
					var needMove=false;
					context._dx += context._posx - px;
					context._dy += context._posy - py;
					context._posx=px;
					context._posy=py;
					if(context._dx<0){
						context._dx=0;
					}
					if(context._dy<0){
						context._dy=0;
					}
					if(context._dx>context.maxOffsetX){
						context._dx = context.maxOffsetX;
					}
					if(context._dy>context.maxOffsetY){
						context._dy = context.maxOffsetY;
					}
					context.container.scrollLeft = context._dx;
					context.container.scrollTop = context._dy;
				},
				onTouchEnd : function(e){
					$E.off(context.touchContainer,'touchmove',context.observer.onTouchMove);
					$E.off(context.touchContainer,'touchend',context.observer.onTouchEnd);
				}
			};
			$E.on(this.touchContainer,'touchstart',this.observer.onTouchStart);
		},
		destroy : function(){
			$E.off(this.touchContainer,'touchstart',this.observer.onTouchStart);
			this.container=null;
		},
		disable : function(){
			$E.off(this.touchContainer,'touchstart',this.observer.onTouchStart);
		},
		enable : function(){
			$E.on(this.touchContainer,'touchstart',this.observer.onTouchStart);
		}
	});
	*/
});

/**
 * 桌面通知模块
 * 目前只有chrome的实现
 * 来自:　http://0xfe.muthanna.com/notifyme.html
 * azreal, 2010-9-11
 */
Jx().$package(function (J) {
    var $D = J.dom,
		$E = J.event;

	/**
	 * 通知类
	 */
    J.ui.Notifier = new J.Class({
    	/**
    	 * Returns "true" if this browser supports notifications.
    	 */
        hasSupport: function(){
        	if (window.webkitNotifications) {
	        	return true;
	      	} else {
	        	return false;
	      	}
        },
        /**
         *  Request permission for this page to send notifications. If allowed,
    	 *  calls function "cb" with true.
         */
        requestPermission: function(cb){
        	window.webkitNotifications.requestPermission(function() {
		        if (cb) { cb(window.webkitNotifications.checkPermission() == 0); }
		    });
        },
        /**
         * Popup a notification with icon, title, and body. Returns false if
    	 * permission was not granted.
    	 * if success , return a popup object.
         */ 
	    notify : function(icon, title, body) {
  			if (window.webkitNotifications.checkPermission() == 0) {
			    var popup = window.webkitNotifications.createNotification(icon, title, body);
			    popup.show();
			    return popup;
			}
	      return false;
	    }
        
    });



});
/**
 * 列表滚动模块,从eqq.util.js移出
 * azreal, 2010-10-26
 */
Jx().$package(function (J) {
    var $D = J.dom,
		$E = J.event;

	/**
	 * 滚动类
	 */
	J.ui.Marquee = new J.Class({
		init : function(option){
			var marqueeContext = this;
			this.speed = option.speed || 40;
			this.stopTime = option.stopTime || 3000;
			this.lineHeight = option.lineHeight || 20;
			this.target = option.target;
			this.timer = null;
			this.lineTimer = null;
			this.intervaler = null;
		 	this.scrollHeight = this.lineHeight;
		 	this.isStop = false;
		 	
		 	this._onTimeRun = function(){
				marqueeContext.scrollOneLine();
			};
	
		},
		scrollOneLine : function(){
			if (this.scrollHeight > 0) {
				this.scrollHeight--;
				var currentTop = this.target.style.top.match(/-?\d+/);
				currentTop = (!currentTop) ? 0 : parseInt(currentTop[0]);
				this.target.style.top = (--currentTop) + 'px';
				

				this.lineTimer = setTimeout(this._onTimeRun, this.speed);
			}else{
				if(!this.isStop){
					this.update();
				}
			}

		},
		
		stop : function() {
			if (this.timer) {
				clearTimeout(this.timer);
			}
		},
		
		stopAll : function(){
			this.stop();
			if(this.lineTimer){
				clearTimeout(this.lineTimer);
			}
		},
		
		reset : function(){
			this.target.style.top = '0px';
		},
		
		update : function(){
			if(this.isStop){
				return;
			}
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.scrollHeight = this.lineHeight;
			var currentTop = this.target.style.top.match(/\d+/);
			var height = $D.getScrollHeight(this.target);
			if(!!currentTop && !!height){
				currentTop = parseInt(currentTop[0]);
				if(currentTop >= height){
					this.target.style.top = this.lineHeight + 'px';
					this.scrollOneLine();
					return;
				}
			}

			this.timer = setTimeout(this._onTimeRun, this.stopTime);
		},
		
		walkOnLastLine : function(){
			this._onTimeRun();
		}
		
	});



});


/**
 * 多容器拖拽排序
 * tealin, 2010-9-21
 */
Jx().$package(function (J) {
    var $D = J.dom,
		$E = J.event;
	var _workAreaWidth=false,
		_workAreaHeight=false,
		_width=false,
		_height=false;
	var curDragElementX, curDragElementY, dragStartX, dragStartY;
    J.ui.Sortables = new J.Class({
    	/*
    	 * @param dropTargets 需要拖拽排序的容器列表
    	 * @param str 排序后需要返回的字段
    	 */
    	init : function(dropTargets,sortStr,option){
    		this.dropTargets=dropTargets.concat();
    		this.sortStr=sortStr;
    		this.option = option||{};
    		this.limiteOption = this.option.limiteOption||{};
    		this.dragController = {};
    	},
    	addDropTarget : function(targetObj){//targetObj = {el:HTMLElement,level:n} level越大，优先级越高
    		this.dropTargets.push(targetObj);
    	},
    	addEffect : function(el){
    		this.effectEl = el;
    	},
    	removeDropTarget : function(el){
    		J.array.remove(this.dropTargets,el);
    	},
		refreshDropTarget : function(target){
			var targetPos,
				xy,
				targetWidth,
				dropTargets = this.dropTargets,
				targetHeight;
			this.dropPos = [];
			if(!target){
				for(var i in dropTargets){
					target = dropTargets[i].el;
					targetPos = {};
					xy = $D.getXY(target);
					targetWidth = $D.getClientWidth(target);
					targetHeight = $D.getClientHeight(target);
					targetPos.x = xy[0];
					targetPos.y = xy[1];
					targetPos.w = targetWidth;
					targetPos.h = targetHeight;
					this.dropPos[i] = targetPos;
				}
			}else{
				for(var i in dropTargets){
					dropTargetEl = dropTargets[i].el;
					if(target.el === dropTargetEl){
						targetPos = {};
						xy = $D.getXY(dropTargetEl);
						targetWidth = $D.getClientWidth(dropTargetEl);
						targetHeight = $D.getClientHeight(dropTargetEl);
						targetPos.x = xy[0];
						targetPos.y = xy[1];
						targetPos.w = targetWidth;
						targetPos.h = targetHeight;
						this.dropPos[i] = targetPos;
						break;
					}
				}
			}
		},
    	addDragClass : function(el){
    		var parentEl = el.parentNode, 
    			apperceiveEl = el,
//    			effectEl =this.effectEl||this.clone(apperceiveEl),//转移到beforeStart里创建
    			effectEl = false,
    			context = this,
				currentDropTarget = null,
    			xyP = $D.getXY(parentEl),//父节点
    			xyS = $D.getXY(apperceiveEl),
    			addId = el.getAttribute(this.sortStr)||"",
    			dropTargets = this.dropTargets,
    			nextEl,
    			preXY;//子节点
            
//    		//获取模型的体积
//    		var _width = $D.getClientWidth(apperceiveEl);
//    		var _height = $D.getClientHeight(apperceiveEl);
//    		var margin ={}; 
//    			margin.top= parseInt($D.getStyle(apperceiveEl,"marginTop")||0);
//    			margin.buttom= parseInt($D.getStyle(apperceiveEl,"marginbottom")||0);
//    			margin.left= parseInt($D.getStyle(apperceiveEl,"marginLeft")||0);
//    			margin.right= parseInt($D.getStyle(apperceiveEl,"marginRight")||0);
//    		//修正盒子模型
//    		_width += (margin.left+margin.right);
//    		_height += (margin.top+margin.buttom);

    		this.dropPos = [];
    		var onDragBeforeStart = function(){
    			_width = $D.getClientWidth(apperceiveEl);
    			_height = $D.getClientHeight(apperceiveEl);
    			var margin ={}; 
    			margin.top= parseInt($D.getStyle(apperceiveEl,"marginTop")||0);
    			margin.buttom= parseInt($D.getStyle(apperceiveEl,"marginbottom")||0);
    			margin.left= parseInt($D.getStyle(apperceiveEl,"marginLeft")||0);
    			margin.right= parseInt($D.getStyle(apperceiveEl,"marginRight")||0);
	    		//修正盒子模型
	    		_width += (margin.left+margin.right);
	    		_height += (margin.top+margin.buttom);
    			//重新赋值,因为dropTarget是动态添加的
    			dropTargets = this.dropTargets;
                //az 2011-6-8
                effectEl = context.effectEl || context.clone(apperceiveEl);
                context.dragController[addId].setEffect(effectEl);
    			//重新设置XY.这里不能在dragstart设置,因为在发出start之前已经用了这个高度
    			setStartXY();
    			this.refreshDropTarget();
    			//储存下个一个节点,以便恢复
    			parentEl = apperceiveEl.parentNode;
    			nextEl = apperceiveEl.nextSibling;
                
                document.body.appendChild(effectEl);
                
    			$E.notifyObservers(context, "beforeStart");
    		};
    		var onDragStart = function(option){
				currentDropTarget = null;
    			if(context.option.isDash){
    				apperceiveEl = context.cloneDashedEl(apperceiveEl);
    			}else{
	    			if(!J.browser.ie){
	    				$D.setStyle(apperceiveEl,"opacity",0.5);
	    			}
    			}
    			//J.out("drag开始");
    			$E.notifyObservers(context, "start");
    		};
    		var onDragMove = function(option){
				var moveEvent = option.orientEvent;
				var moveX = moveEvent.pageX;
				var moveY = moveEvent.pageY;
    			//减少计算
    			if(Math.abs(moveX-preXY[0])+Math.abs(moveY-preXY[1])<1){
    				return;
    			}else{
    				if(moveX-preXY[0]>0){
    					var direction = "right";
    				}else{
    					var direction = "left";
    				}
    				preXY = [moveX,moveY];
    			}
    			//父节点宽度
				var hitTarget = {el:null,level:-1,index:0};
    			for(var i in this.dropPos){
    				if(
    					(moveX > this.dropPos[i].x)&&
    					(moveX < this.dropPos[i].x + this.dropPos[i].w)&&
    					(moveY > this.dropPos[i].y)&&
    					(moveY < this.dropPos[i].y + this.dropPos[i].h)
    					){
							var dropTargetObj = dropTargets[i];
    						var dropTarget = dropTargetObj.el;
    						var parentWidth = $D.getClientWidth(dropTarget);
			    			//每行个数
			    			var perRow = Math.floor(parentWidth/_width);
			    			
							//容器的XY
			    			var dropTargetXY = $D.getXY(dropTarget);
			    			//先对于容器的位置
			    			var x = moveX - dropTargetXY[0];
			    			var y = moveY - dropTargetXY[1];
			    			//var fixX = preIndexXY[1]==indexY?(preXY[0]-moveX>0?(-0.3):0.3):0;
			    			var indexY = Math.floor(y/_height);
			    			if(direction=="right"){
			    				var indexX = Math.ceil(x/_width);
			    			}else if(direction=="left"){
			    				var indexX = Math.floor(x/_width);
			    			}
			    			
			    			var index = indexX+indexY*perRow;
							if(hitTarget.level <dropTargetObj.level){
								hitTarget.level = dropTargetObj.level;
								hitTarget.el = dropTargetObj.el;
								hitTarget.index = index;
							}
							/*
							if(dropTarget.getAttribute('customAcceptDrop')){
								$E.notifyObservers(dropTarget,'dragmove',option);
								break;
							}
							
							
							
			    			//修正IE下index找不到的时候插不到最后一个的错误
			    			if(dropTarget.childNodes[index]){
			    				dropTarget.insertBefore(apperceiveEl,dropTarget.childNodes[index]);
			    			}else{
			    				dropTarget.appendChild(apperceiveEl);
			    			}
			    			break;
							*/
    				}
    			}
				currentDropTarget = hitTarget.el
				if(currentDropTarget){
					if(currentDropTarget.getAttribute('customAcceptDrop')){
						$E.notifyObservers(currentDropTarget,'dragmove',option);
					}else if(currentDropTarget.childNodes[index]){//修正IE下index找不到的时候插不到最后一个的错误
						currentDropTarget.insertBefore(apperceiveEl,currentDropTarget.childNodes[index]);
					}else{
						currentDropTarget.appendChild(apperceiveEl);
					}
				}
//    			try{
    				$E.notifyObservers(context, "move",option);
//    			}catch(e){
//    				J.out("move error");
//    			}
    		};
    		var onDragOverFlow = function(option){
    			option.el=effectEl;
    			$E.notifyObservers(context, "overFlowBorder",option);
    		};
    		var onDragEnd = function(option){
				var moveEvent = option.orientEvent;
				var moveX = moveEvent.pageX;
				var moveY = moveEvent.pageY;
				if(currentDropTarget && currentDropTarget.getAttribute &&currentDropTarget.getAttribute('customAcceptDrop')){
					$E.notifyObservers(currentDropTarget, "drop",{'dragEl':el,"queue":queue,"pos":{x:moveX,y:moveY},"apperceiveEl":apperceiveEl,"nextEl":nextEl,"parentEl":parentEl});
				}
    			document.body.removeChild(effectEl);
    			if(context.option.isDash){
    				context.removeDashedEl();
    				apperceiveEl = context.tempEl;
    			}else{
	    			if(!J.browser.ie){
	    				$D.setStyle(apperceiveEl,"opacity",1);
	    			}    				
    			}
    			//返回队列
    			var queue = [];
    			for(var i in dropTargets){
    				queue[i] = [];
	    			var childNodes = dropTargets[i].el.childNodes;
	    			for(var k=0;k<childNodes.length;k++){
						var node = childNodes[k];
						if(!node.getAttribute){
							break;
						}
	    				var attribute=childNodes[k].getAttribute(context.sortStr);
	    				if(attribute){
	    					queue[i].push(attribute);
	    				}
	    			}
    			}
    			//J.out("drag结束");
    			try{
    				$E.notifyObservers(context, "end",{"queue":queue,"pos":option,"apperceiveEl":apperceiveEl,"nextEl":nextEl,"parentEl":parentEl});
    			}catch(e){
    				J.out("drop error");
    			}
				var containerEl=document.elementFromPoint(moveX, moveY);
				if(containerEl){
					$E.notifyObservers(J.ui, "drop",{'dragEl':el,"pos":{x:moveX,y:moveY},"apperceiveEl":apperceiveEl,"dropEl":containerEl});
				}
    		};
    		//初始化XY
    		var setStartXY = function(){
    			//xyP = $D.getXY(parentEl);//父层坐标
    			xyS = $D.getXY(apperceiveEl);//子层坐标
    			var x = xyS[0];
    			var y = xyS[1];
    			preXY = [x,y];
				$D.setStyle(effectEl,"left",x+"px");
				$D.setStyle(effectEl,"top",y+"px");
    		};
    		
    		var initDropPos = function(){//废弃，用refreshDropPos
    			var target,
    				targetPos,
    				xy,
    				targetWidth,
    				targetHeight;
    			this.dropPos = [];
    			for(var i in dropTargets){
    				target = dropTargets[i].el;
    				targetPos = {};
    				xy = $D.getXY(target);
    				targetWidth = $D.getClientWidth(target);
    				targetHeight = $D.getClientHeight(target);
    				targetPos.x = xy[0];
    				targetPos.y = xy[1];
    				targetPos.w = targetWidth;
    				targetPos.h = targetHeight;
    				this.dropPos[i] = targetPos;
    			}
    		}
    		
    		this.dragController[addId] = new J.ui.Drag(el,effectEl,this.limiteOption);
    		$E.addObserver(this.dragController[addId],"beforeStart",J.bind(onDragBeforeStart,this));
    		$E.addObserver(this.dragController[addId],"start",J.bind(onDragStart,this));
    		$E.addObserver(this.dragController[addId],"move",J.bind(onDragMove,this));
    		$E.addObserver(this.dragController[addId],"overFlowBorder",J.bind(onDragOverFlow,this));
    		$E.addObserver(this.dragController[addId],"end",J.bind(onDragEnd,this));
    	},
    	setLimite : function(option){
    		for(var i in this.dragController){
    			this.dragController[i].setLimite(option);
    		}
    	},
    	cloneDashedEl : function(el){
    		var dashedEl = $D.node("div");
    		var className = this.option.className;
    		if(className){
    			$D.setClass(dashedEl,className);
    		}else{
    			$D.setStyle(dashedEl,"border","dashed 2px #fff");
	    		$D.setClass(dashedEl,el.className);
	    		$D.setStyle(dashedEl,"position","relative");
	    		$D.setStyle(dashedEl,"float","left");
	    		var width = el.offsetWidth - 10 * parseInt(dashedEl.style.borderWidth) + "px";
	    		var height = el.offsetHeight - 10 * parseInt(dashedEl.style.borderWidth) + "px"; 
	    		$D.setStyle(dashedEl,"width",width);
	    		$D.setStyle(dashedEl,"height",height);
    		}
    		this.dashedEl = dashedEl;
    		if (el.nextSibling) {
                el.parentNode.insertBefore(dashedEl, el.nextSibling);
            }
            else {
                el.parentNode.appendChild(dashedEl);
            }
            this.tempEl = el;
            el.parentNode.removeChild(el);
            return dashedEl;
    	},
    	removeDashedEl : function(){
    		if (this.dashedEl.nextSibling) {
                this.dashedEl.parentNode.insertBefore(this.tempEl, this.dashedEl.nextSibling);
            }
            else {
                this.dashedEl.parentNode.appendChild(this.tempEl);
            }
            this.dashedEl.parentNode.removeChild(this.dashedEl);
    	},
    	clone : function(el){
    		var result;
    		var jumpOut = false;
			var cloneEl = el.cloneNode(true);
			cloneEl.setAttribute("id","");
			$D.setStyle(cloneEl,"position","absolute");
			$D.setStyle(cloneEl,"zIndex","9999999");
			$D.setStyle(cloneEl,"background","none");
			return cloneEl;
    	},
    	forEachNode : function(arr,fun){
    		var len = arr.length;
			if (typeof fun != "function") {
				throw new TypeError();
			}
			var thisp = arguments[2];
			for (var i = 0; i < len; i++) {
				if (i in arr) {
					fun.call(thisp, arr[i], i, arr);
				}
			}
    	}
        
    });
});


/**
 * 自定义滚动条
 * rehorn, 2010-10-28
 * id {string} 需要生成滚动条的div(至少保证有一个子div，存放需要滚动的内容)
 * <div id ="scroll"><div id="scrollcontent"></div></div>
 * scroll的position必须为relative|absolute
 * (可选: 会用js强制设置)scrollcontent的高度为100%, overflow:hidden
 */
 Jx().$package(function (J) {
 	 var $D = J.dom,
	     $E = J.event;
		
	J.ui.ScrollBar = new J.Class({
		option: {
			'barClass': 'scrollBar',
			'barHoverClass': null,
			'barActiveClass': null,
			'showBarContainer': false
		},
		init: function(el,option) {
            
			var self = this;
			J.extend(this.option, option);
			this.bar = $D.node('div',{
                'class':option.scrollBarClassName||'scrollBar' 
            });
			this.obj = el;
			this.content = this.obj.getElementsByTagName('div')[0] || this.obj;
			$D.setStyle(this.content, 'height', '100%');
			$D.setStyle(this.content, 'overflow', 'hidden');

			//兼容ie圆角
			if(J.browser.ie){
				this.bar.innerHTML = '<div class="scrollBar_bg scrollBar_bg_t"></div><div class="scrollBar_bg scrollBar_bg_b"></div>';
			}
			this.onscroll= option.onscroll||function(){};
			this.scrollToBottom= option.scrollToBottom||function(){};
			this.ipadTouchArea= option.ipadTouchArea||false;
			$D.setStyle(this.bar, 'marginTop', 0);
			this.obj.appendChild(this.bar);
			
			//滚动槽
			if(option.showBarContainer){
				this.barBc = $D.node('div',{
					'class':'scrollBar_bgc'
				});
				if(J.browser.ie){
					this.barBc.innerHTML = '<div class="scrollBar_bgc_c scrollBar_bgc_t"></div><div class="scrollBar_bgc_c scrollBar_bgc_b"></div>';
				}
				this.obj.appendChild(this.barBc);
			}
			
			this.setBarHeight();
			this.bar.y;
			this.srcElement;
			this.marginTop;
			this.D; //鼠标滚动方向
			this.wheelThread = 20; //滚动20px
			this.isScrolling = false;
			
			var observer = {
				onMouseDown:function(e){
                    e.preventDefault();
                    var target = e.target;
					if(e.changedTouches) {
						e= e.changedTouches[0];
					}
		            self.bar.y = e.clientY;
		            self.bar.t = parseInt( self.bar.style.marginTop );
		            if(!J.platform.iPad){
		                $E.on(document, 'mousemove', observer.onMouseMove);
		                $E.on(document, 'mouseup', observer.onMouseUp);
                        e.stopPropagation();
		            }else {
		            	if(target == self.bar){
			                $E.on(document, 'touchmove', observer.onMouseMove);
                       		$E.on(document, 'touchend', observer.onBarMouseUp);
			            }else{
		               		$E.on(document, 'touchmove', observer.onTouchAreaMove);
                       		$E.on(document, 'touchend', observer.onMouseUp);
			            }
		            }
					self.isScrolling = true;
					if(self.option.barActiveClass)
						$D.addClass(self.bar, self.option.barActiveClass);
				},
				onMouseMove:function(e){
                    if(e.changedTouches) {
                    	e.preventDefault();
                        e= e.changedTouches[0];
                    }
		            self.scroll( e.clientY - self.bar.y );
		            if(!J.platform.iPad) {
    		            e.preventDefault();
    		            e.stopPropagation();
		            }
				},
				onTouchAreaMove:function(e){
					e.preventDefault();
					e.stopPropagation();
                    if(e.changedTouches) {
                        e= e.changedTouches[0];
                    }
		            self.scroll( - e.clientY + self.bar.y );
		            //if(!J.platform.iPad) {
		            //}
				},
				onBarMouseUp:function(e){
                    if(!J.platform.iPad){
                        $E.off(document, 'mousemove', observer.onMouseMove);
                        $E.off(document, 'mouseup', observer.onMouseUp);
                    }else {
                        $E.off(document, 'touchmove', observer.onMouseMove);
                        $E.off(document, 'touchend', observer.onBarMouseUp);
                    }
					self.isScrolling = false;
					if(self.option.barActiveClass)
						$D.removeClass(self.bar, self.option.barActiveClass);
				},
				onMouseUp:function(e){
                    if(!J.platform.iPad){
                        $E.off(document, 'mousemove', observer.onMouseMove);
                        $E.off(document, 'mouseup', observer.onMouseUp);
                    }else {
                        $E.off(document, 'touchmove', observer.onTouchAreaMove);
                        $E.off(document, 'touchend', observer.onMouseUp);
                    }
					self.isScrolling = false;
					if(self.option.barActiveClass)
						$D.removeClass(self.bar, self.option.barActiveClass);
				},
				onMouseOver: function(e){
					$D.addClass(self.bar, self.option.barHoverClass);
				},
				onMouseOut: function(e){
					$D.removeClass(self.bar, self.option.barHoverClass);
				},
				onMouseWheel:function(event){
                    if(!$D.isShow(self.bar)) {
                        self.scrollToBottom(event);
                        return;
                    }
					self.D = event.wheelDelta;
					event.returnValue = false;
					var _y = (self.D < 0) ? self.wheelThread : (0-self.wheelThread);
					self.bar.y = event.clientY;
		            self.bar.t = parseInt( self.bar.style.marginTop );
					self.scroll(_y);
				},
				onClick:function(e){
					e.stopPropagation();
				},
				onDomMouseScroll:function(e){
					if(!$D.isShow(self.bar)) {
					    self.scrollToBottom(e);
					    return;
					}
					self.D = (e.detail > 0) ? -1 : 1;
					if(!J.platform.iPad){
    					e.stopPropagation();
    					e.preventDefault();
					}
					self.bar.y = e.clientY;
		            self.bar.t = parseInt( self.bar.style.marginTop );
					var _y = (self.D < 0) ? self.wheelThread : (0-self.wheelThread);
					self.scroll(_y);
				}
			};
			
			if(this.option.stopClick){
				$E.on(this.bar, 'click', observer.onClick);
			}
			if(this.option.barHoverClass){
				$E.on(this.bar, 'mouseover', observer.onMouseOver);
				$E.on(this.bar, 'mouseout', observer.onMouseOut);
			}
			if(J.platform.iPad) {
			    $E.on(this.bar, 'touchstart', observer.onMouseDown);
			    if(this.ipadTouchArea) {
			    	$E.on(this.content, 'touchstart', observer.onMouseDown);
			    }
			}else {
				$E.on(this.bar, 'mousedown', observer.onMouseDown);
                //滚动事件兼容 参照jquery mousewheel
                if (J.browser.ie || J.browser.engine.webkit || J.browser.opera) {
                    $E.on(this.content, 'mousewheel', observer.onMouseWheel);
                    $E.on(this.bar, 'mousewheel', observer.onMouseWheel);
                } else {
                    $E.on(this.content, 'DOMMouseScroll', observer.onDomMouseScroll);
                    $E.on(this.bar, 'DOMMouseScroll', observer.onDomMouseScroll);
                }
			}
		},
		scrollBack: function() {
			var self= this;
			self.content.scrollTop = "0px";
			self.bar.t= 0;
			self.scroll(0);
		},
		refresh: function(){
			//跟iscroll同名接口
			this.update();	
		},
		update: function(){
			this.setBarHeight();
		},
		setBarHeight: function(){
			
			var self = this;
			
			self.onscroll(0,0); //防止影响scrollHeight计算
			self.bar.style['height']='0'; //防止影响scrollHeight计算
			
			$D.hide(self.bar); //防止影响scrollHeight计算
			
			if((self.content.offsetHeight - self.content.scrollHeight) >= 0 ){
				if(self.barBc){
					$D.hide(self.barBc);
				}
				self.bar.t = 0; //滚动条复位
			}else{
				self.bar.style.height = parseInt(self.content.offsetHeight / self.content.scrollHeight * self.content.offsetHeight) + 'px';
				$D.show(self.bar);
				if(self.barBc){
					$D.show(self.barBc);
				}
				self.bar.t = parseInt( self.bar.style.marginTop );
			}
			//触发scroll事件，重置滚动条位置，滚动距离为0
			self.scroll(0);
		},
		//@param dis 移动滚动条，dis为滚动条移动距离
		scroll: function(dis){
			var self = this;
			self.marginTop = (self.bar.t||0) + dis;
			if( self.marginTop < 0 ) {
	            self.marginTop = 0;
	        }
	        if( self.marginTop > self.content.clientHeight - self.bar.offsetHeight ){
	            self.marginTop = self.content.clientHeight - self.bar.offsetHeight;
	            //到底通知
                self.scrollToBottom();
	        }else {
	        	
	        }
	        self.bar.style.marginTop = self.marginTop + 'px';
	        if(dis==0) {
	        	self.onscroll(dis,dis);
	        }
	        var scrollTop= ( self.content.scrollHeight - self.content.offsetHeight ) * parseInt( self.marginTop ) / ( self.content.offsetHeight - self.bar.offsetHeight );
	        self.content.scrollTop = scrollTop;
	        self.onscroll(scrollTop,dis);
            
		},
		//@param dis 移动面板内容，dis为面板移动距离
		contentScroll: function(dis){
			var self = this;
			var dis = parseInt(self.obj.offsetHeight / self.content.scrollHeight * dis);
			this.scroll(dis);
		},
		contentPosition: function() {
			return this.content.scrollTop;
		}
	});
});



/**
 * 自定义滚动条
 * ippan
 * 前置条件：所传进来的div的positon必须为relative或absolute
 * 此方法会给div增加一个子元素（滚动条）
 */
 Jx().$package(function (J) {
 	 var $D = J.dom,
	     $E = J.event;
	var doc;
	J.ui.ScrollArea = new J.Class({
		init: function(el,_doc) {
			var self = this;
			doc = _doc ? _doc:document;
			this.container = el;
			this.scrollBar = doc.createElement('div');
			this.scrollBar.className = 'scrollBar';
			if(J.browser.ie){
				this.scrollBar.innerHTML = '<div class="scrollBar_bg scrollBar_bg_t"></div><div class="scrollBar_bg scrollBar_bg_b"></div>';
			}
			this.container.appendChild(this.scrollBar);
			this.wheelThread = 20; //滚动20px
			this.isScrolling = false;
			var scrollBarStartY;
			var observer = {
				onMouseDown:function(e){
		            e.preventDefault();
		            e.stopPropagation();
					self.isScrolling = true;
		            scrollBarStartY = e.clientY;
					$D.addClass(self.scrollBar, 'active');
		            $E.on(doc, 'mousemove', observer.onMouseMove);
		            $E.on(doc, 'mouseup', observer.onMouseUp);
				},
				onMouseMove:function(e){
					var dy =  e.clientY - scrollBarStartY;
					var scrollY = dy/(self.offsetHeight-self.scrollBarHeight) * (self.scrollHeight - self.offsetHeight);
		            self.scroll(scrollY);
					scrollBarStartY = e.clientY;
		            e.preventDefault();
		            e.stopPropagation();
				},
				onClick:function(e){
		            e.preventDefault();
		            e.stopPropagation();
				},
				onMouseUp:function(e){
		            e.preventDefault();
		            e.stopPropagation();
					$E.off(doc, 'mousemove', observer.onMouseMove);
					$E.off(doc, 'mouseup', observer.onMouseUp);
					self.isScrolling = false;
					$D.removeClass(self.scrollBar, 'active');
				},
				onMouseOver: function(e){
					$D.addClass(self.scrollBar, 'hover');
				},
				onMouseOut: function(e){
					$D.removeClass(self.scrollBar, 'hover');
				},
				onMouseWheel:function(event){
					if(!$D.isShow(self.scrollBar)) return;
					var delta = event.wheelDelta;
					event.returnValue = false;
					var _y = (delta < 0) ? self.wheelThread : (0-self.wheelThread);
					self.scroll(_y);
				},
				onDomMouseScroll:function(e){
					if(!$D.isShow(self.scrollBar)) return;
					var delta = (e.detail > 0) ? -1 : 1;
					e.stopPropagation();
					e.preventDefault();
					var _y = (delta < 0) ? self.wheelThread : (0-self.wheelThread);
					self.scroll(_y);
				}
			};
			this.observer = observer;
			$E.on(this.scrollBar, 'mousedown', observer.onMouseDown);
			$E.on(this.scrollBar, 'click', observer.onClick);
			$E.on(this.scrollBar, 'mouseover', observer.onMouseOver);
			$E.on(this.scrollBar, 'mouseout', observer.onMouseOut);
			
			//滚动事件兼容 参照jquery mousewheel
			if (J.browser.ie || J.browser.engine.webkit || J.browser.opera) {
				$E.on(this.container, 'mousewheel', observer.onMouseWheel);
				$E.on(this.scrollBar, 'mousewheel', observer.onMouseWheel);
			} else {
				$E.on(this.container, 'DOMMouseScroll', observer.onDomMouseScroll);
				$E.on(this.scrollBar, 'DOMMouseScroll', observer.onDomMouseScroll);
			}
			this.update();
		},
		update: function(){
			if(this.updateTimer){
				return;
			}
			var that=this;
			this.updateTimer = setTimeout(function(){
				that.updateTimer = 0;
				that.scrollBar.style['height']='0';//防止scrollBar的高度影响区域高度计算
				$D.hide(that.scrollBar);
				that.scrollHeight = that.container.scrollHeight;
				that.offsetHeight = that.container.offsetHeight;
				that.scrollBarHeight = that.offsetHeight/that.scrollHeight*that.offsetHeight;
				//console.info(that.scrollBarHeight,that.scrollHeight,that.offsetHeight);
				if(that.scrollHeight <= that.offsetHeight){
					//J.out('hide');
					//that.scrollBar.style['display']='none';
				}else{
					//J.out('show');
					$D.show(that.scrollBar);
					if(that.scrollBarHeight < 30){
						that.scrollBarHeight = 30;
					}
					that.scrollBar.style['height'] = that.scrollBarHeight+'px';
					that.scrollBar.style['top'] = that.container.scrollTop+that.container.scrollTop/(that.scrollHeight-that.offsetHeight)*(that.offsetHeight-that.scrollBarHeight)+'px';
					//J.out(that.scrollHeight+' :: '+that.offsetHeight+' '+that.scrollTime);
				}
				//J.out(that.scrollHeight+' '+that.offsetHeight+' '+that.scrollTime);
			},500);
			//console.info(scrollHeight,offsetHeight,this.scrollBarHeight);
		},
		//@param dis 移动滚动条，dis为滚动条移动距离
		scroll: function(dis){
			var maxDis = this.scrollHeight - (this.container.scrollTop + this.offsetHeight);
			if(dis > maxDis){
				dis = maxDis;
			}
			//J.out(this.container.scrollTop + this.offsetHeight+'  '+this.scrollHeight);
			this.container.scrollTop += dis;
			this.scrollBar.style['top'] = this.container.scrollTop+this.container.scrollTop/(this.scrollHeight-this.offsetHeight)*(this.offsetHeight-this.scrollBarHeight)+'px';
		},
		destroy:function(){
			$E.off(this.scrollBar, 'mousedown', this.observer.onMouseDown);
			$E.off(this.scrollBar, 'mouseover', this.observer.onMouseOver);
			$E.off(this.scrollBar, 'mouseout', this.observer.onMouseOut);
			
			//滚动事件兼容 参照jquery mousewheel
			if (J.browser.ie || J.browser.engine.webkit || J.browser.opera) {
				$E.off(this.container, 'mousewheel', this.observer.onMouseWheel);
				$E.off(this.scrollBar, 'mousewheel', this.observer.onMouseWheel);
			} else {
				$E.off(this.container, 'DOMMouseScroll', this.observer.onDomMouseScroll);
				$E.off(this.scrollBar, 'DOMMouseScroll', this.observer.onDomMouseScroll);
			}
			this.container.removeChild(this.scrollBar);
			this.container = null;
			this.scrollBar = null;
		}
	});
});
/** 
 * JX (Javascript eXtension tools) 
 * Copyright (c) 2011, Tencent.com, All rights reserved.
 *
 * @fileOverview Jet!
 * @version 1.0
 * @author  Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */
 Jx().$package(function (J) {
 	 var $D = J.dom,
	     $E = J.event;
	var doc;
	
	J.ui = J.ui || {};
	Jx.ui = Jx.ui || {};
	
	
	 /**
   * 【TouchScroller】
   * 
   * @class Jx.ui.TouchScroller
   * @memberOf Jx.ui
   * @name TouchScroller
   * @extends Object
   * @param {Element} dom 需要滚动的内容容器
   * @param {Element} touchdom 用于接收触摸时间的容器，可以省略
   * @since version 1.0
   * @description Jx.ui.TouchScroller 是提供IOS下的html元素触摸滚动功能的一个组件
   */
	var TouchScroller= J.ui.TouchScroller = new J.Class(
	 /**
   * @lends Jx.ui.TouchScroller.prototype
   */
	{
		//是否要增加动画
    //@TODO options处添加滚动方向设置
    container:null,
    _dx:0,
    _dy:0,
    _posy:0,
    _posx:0,
    _maxOffsetX:0,
    _maxOffsetY:0,
   /**
    * @private
    */
    init: function(dom,touchdom,option){
      this.container = J.isString(dom) ? $D.id(dom) : dom;
      this.touchContainer = touchdom||this.container;
      var context = this;
      this.observer = {
        onTouchStart : function(e){
          //e.stopPropagation();
          //e.preventDefault();
          if(e.changedTouches.length>1){
            return;
          }
          var touch = e.changedTouches[0];
          context._dx = context.container.scrollLeft;
          context._dy = context.container.scrollTop;
          context._posx = touch.pageX;
          context._posy = touch.pageY;
          context.maxOffsetX = context.container.scrollWidth - context.container.clientWidth;
          context.maxOffsetY = context.container.scrollHeight - context.container.clientHeight;
          $E.on(context.touchContainer,'touchmove',context.observer.onTouchMove);
          $E.on(context.touchContainer,'touchend',context.observer.onTouchEnd);
        },
        onTouchMove : function(e){
          //@TODO
          //e.stopPropagation();
          //e.preventDefault();
          var touch=e.changedTouches[0];
          var px=touch.pageX;
          var py=touch.pageY;
          var needMove=false;
          context._dx += context._posx - px;
          context._dy += context._posy - py;
          context._posx=px;
          context._posy=py;
          if(context._dx<0){
            context._dx=0;
          }
          if(context._dy<0){
            context._dy=0;
          }
          if(context._dx>context.maxOffsetX){
            context._dx = context.maxOffsetX;
          }
          if(context._dy>context.maxOffsetY){
            context._dy = context.maxOffsetY;
          }
          context.container.scrollLeft = context._dx;
          context.container.scrollTop = context._dy;
        },
        onTouchEnd : function(e){
          $E.off(context.touchContainer,'touchmove',context.observer.onTouchMove);
          $E.off(context.touchContainer,'touchend',context.observer.onTouchEnd);
        }
      };
      $E.on(this.touchContainer,'touchstart',this.observer.onTouchStart);
    },
/**
 * @private
 */
    destroy : function(){
      $E.off(this.touchContainer,'touchstart',this.observer.onTouchStart);
      this.container=null;
    },
/**
 * 阻止触摸滚动功能
 * @param
 * @return
 */
    disable : function(){
      $E.off(this.touchContainer,'touchstart',this.observer.onTouchStart);
    },
/**
 * 开启触摸滚动功能
 * @param
 * @return
 */
    enable : function(){
      $E.on(this.touchContainer,'touchstart',this.observer.onTouchStart);
    }
  });
  Jx.ui = Jx.ui || {};
  Jx.ui.TouchScroller = TouchScroller;
});
/* == J.ui.Button =============================================
 * Copyright (c) 2010, Tencent.com All rights reserved.
 * version: 1.0
 * rehorn
 * -------------------------------------------- 2010-10-13 ----- */
 
 
 Jx().$package(function (J) {
    var $D = J.dom,
    	$S = J.string,
		$E = J.event;
	var _id = 0;
	J.ui.Button = new J.Class({
		// == Doc ===================
		/*************************************
		 * 默认的css class
		 * _class
		 * 
		 * 初始化函数
		 * init: function(option){}
		 * @param option {object} 设置参数
		 * 
		 * 自定义事件绑定
		 * attachEvent : function(eventObj){}
		 * @param eventObj {Object} 事件对象
		 * 
		 * 移除自定义事件
		 * removeEvent : function(eventObj){}
		 * @param eventObj {Object} 事件对象
		 * 
		 * 显示
		 * show: function(){}
		 * 
		 * 隐藏
		 * hide: function(){}
		 * 
		 * 设置按钮文本
		 * setText: function(text){}
		 * @param text {string} 文本
		 * 
		 * 获取button dom对象
		 * getNode: function(){}
		 * @return {object} dom对象(a)
		 ************************************/
		_class: 'ui_button',
		_available: true, // available for user?
		_shownInLogic: false, // should be shown in logic
		_getButtionId: function(){
			return _id++;	
		},
        init: function (option){
        	option = option || {};
        	var context = this;
        	var bid = this._getButtionId();
        	var buttonOption = {
        		appendTo: $D.getDocumentElement(),
        		className: '',
        		text: '',
        		title : ''
        	};
        	J.extend(buttonOption, option);
        	
        	this._node = $D.node('a', {
		         'id': 'ui_button_' + bid,
		         'class': this._class + ' ' + $S.encodeScript(buttonOption.className),
		         'title': $S.encodeScript(buttonOption.title),
		         'hidefocus': '',
		         'href': '###'
	        });
	        this._node.innerHTML = $S.encodeHtml(buttonOption.text);
	        buttonOption.appendTo.appendChild(this._node);
	        if(buttonOption.event){
	        	this.attachEvent(buttonOption.event);
	        }
	        if(buttonOption.isStopPropagation){
	        	$E.on(this._node,"mousedown",function(e){
	        		e.stopPropagation();
	        	})
	        	$E.on(this._node,"click",function(e){
	        		e.stopPropagation();
	        	})
	        	
	        }
        },
        attachEvent : function(eventObj){
        	for(var i in eventObj){
        		$E.on(this._node, i, eventObj[i]);
        	}
        },
        removeEvent : function(eventObj){
        	for(var i in eventObj){
        		$E.off(this._node, i, eventObj[i]);
        	}
        },
        setAvailability: function(val){
			// change the availability
			this._available = !!val;

			// show/hide the button by logic
			this._shownInLogic && $D[this._available ? 'show' : 'hide'](this._node);
        },
        hide: function(){
			// shown in logic?
			this._shownInLogic = false;

			// do nothing if it's unavailable
			if (!this._available) {
				return;
			}

			$D.hide(this._node);
        	$E.notifyObservers(this, "hide");
        },
        show: function(){
			// shown in logic?
			this._shownInLogic = true;

			// do nothing if it's unavailable
			if (!this._available) {
				return;
			}

        	$D.show(this._node);
        	$E.notifyObservers(this, "show");
        },
        setText: function(text){
        	this._node.innerHTML = $S.encodeHtml(text);
        },
        setTitle : function(title){
        	this._node.title = $S.encodeScript(title);
        },
        getNode: function(){
        	return this._node;
        },
		disable: function(isDisable){
			isDisable = isDisable || false;
			if(isDisable){
				$D.addClass(this._node, 'window_button_disabled');
			}else{
				$D.removeClass(this._node, 'window_button_disabled');
			}
		}
    });
});
/* == J.ui.ContextMenu =============================================
 * Copyright (c) 2011, Tencent.com All rights reserved.
 * version: 1.0
 * rehorn
 * -------------------------------------------- 2011-1-18 ----- */
 
 
 Jet().$package(function (J) {
    var $D = J.dom,
    	$S = J.string,
		$E = J.event;
    
    var startId = 0,
        topZIndex = 9000000;
    var onSelfContextMenu = function(e){
        e.preventDefault();
        e.stopPropagation();
    };
    var stopPropagation = function(e){
        e.stopPropagation();
    };
    /**
     * 【ContextMenu】
     * 
     * @class J.ui.ContextMenu
     * @name ContextMenu
     * @extends Object
     * @param {Object} option 构造参数
     * {
     * id: '',//random
     * name: id,
     * container: document.body,
     * className: '' ,
     * width: null,
     * triggers: null,//HTMLElement数组 ,触发右键菜单的dom
     * items: []
     * }
     * 
     * @since version 1.0
     * @description
     * triggers 参数是指触发右键菜单显示的dom,
     * 右击该节点就显示菜单
     * 也可以不使用这个属性, 调用的地方自己控制显示隐藏菜单
     */
	var ContextMenu = J.ui.ContextMenu = new J.Class({
        init: function (option){
            var id = 'context_menu_' + (option.id || (startId++));
            var name = option.name || id;
            var parent = this._parent = option.container || (option.parentMenu ? option.parentMenu._parent : null) || document.body;
            var className = option.className || '';
            this._parentMenu = option.parentMenu;
            var container = this._el = $D.id(id) || $D.node('div', {
                id: id,
                'class': 'context_menu',
                style: 'display: none;'
            });
            var html = '<div class="context_menu_container "' + className + '"><ul id="'+ id +'_body" class="context_menu_item_list"></ul></div>';
//                html += '<div class="context_menu_outer_r"></div><div class="context_menu_outer_b"></div>'
//                + '<div class="context_menu_outer_rt"></div><div class="context_menu_outer_rb"></div><div class="context_menu_outer_lb"></div>';
            
            if(J.browser.ie){//遮ie的flash
                html += '<iframe class="context_menu_iframe" src="'+alloy.CONST.MAIN_URL+'domain.html"></iframe>';
            }
            container.innerHTML = html;
            parent.appendChild(container);
            
            if(option.width){
                $D.setStyle(container, 'width', option.width + 'px');
            }
            this._body = $D.id(id + '_body');
            $E.off(container, 'contextmenu');//防止绑定多个事件
            $E.on(container, 'contextmenu', onSelfContextMenu);
            this._popupBox = new J.ui.PopupBox({
                id: id,
                name: name,
                noCatchMouseUp: true,
                parentPopupBox: this._parentMenu ? this._parentMenu._popupBox : null,
                container: container
            });
            this.setZIndex(topZIndex);
            this._itemArr = [];
            if(option.items){
                this.addItems(option.items);
            }
            if(option.triggers){
                var context = this;
                var onTriggerContextMenu = function(e){
                    e.preventDefault();
                    context.show(e.clientX, e.clientY);
                };
                for(var i = 0; t = option.triggers[i]; i++){
//                    $E.off(t, 'contextmenu');//这里没必要
                    $E.on(t, 'contextmenu', onTriggerContextMenu);
                }
            }
            if(option.beforeShow){
                $E.addObserver(this, 'BeforeShow', option.beforeShow);
            }
        },
        setClass: function(className){
            $D.setClass(this._el, 'context_menu ' + className);
        },
        addItem: function(option){
            var type = option.type || 'item';
            var item;
            option.parentMenu = this;
            switch(type){
            case 'item': 
                item = new ContextMenuItem(option);
                break;
            case 'separator':
                item = new ContextMenuSeparator(option);
                break;
            case 'submenu':
                option.parentMenu = this;
                item = new ContextSubmenuItem(option);
                break;
            default:
                item = null;
                break;
            }
            if(item){
                this._body.appendChild(item.getElement());
                this._itemArr.push(item);
            }
        },
        addItems: function(optionArray){
            for(var i = 0, len = optionArray.length; i < len; i++){
                this.addItem(optionArray[i]);
            }
        },
        clearItems: function(){
            var item = this._itemArr.shift();
            while(item){
                this._body.removeChild(item.getElement());
                item.destory();
                item = this._itemArr.shift();
            }
        },
        getItemAt: function(index){
            if(index < this._itemArr.length){
                return this._itemArr[index];
            }else{
                return null;
            }
        },
        getElement: function(){
            return this._el;
        },
        getBody: function(){
            return this._body;
        },
        setZIndex: function(zIndex){
            this._popupBox.setZIndex(zIndex);
        },
        /**
         * 这两个方法可以用来保存临时数据,
         * show之前保存, 供给item的回调使用
         */
        setArgument: function(arg){
            this._argument = arg;
        },
        getArgument: function(){
            return this._argument;
        },
        /**
         * @param {Int} x
         * @param {Int} y
         * @param {Int} offset 菜单位置相对于给定xy的偏移, 0为不偏移
         * @param {HTMLElement} relativeEl 相对某一元素定位
         */
        show: function(x, y, offset, relativeEl){
            $E.notifyObservers(this, 'BeforeShow', this);
            var x = x || 0,
                y = y || 0,
                offset = typeof(offset) === 'undefined' ? 5 : offset;
            var popup = this._popupBox;
            var px = x + offset,
                py = y + offset;
            var rw = 0, rh = 0, ie = J.browser.ie;
            if(relativeEl){
                rw = $D.getOffsetWidth(relativeEl);
                rh = $D.getOffsetHeight(relativeEl);
                px += rw + 5;
                py -= 1;
                if(ie == 9 || ie == 8){
                    px += 2;
                }
            }
            popup.setX('-10000');
            popup.show();
            var w = $D.getClientWidth(this._el),
                h = $D.getClientHeight(this._el),
                bodyWidth = $D.getClientWidth(),
                bodyHeight = $D.getClientHeight();
            if(px + w > bodyWidth && x - w - offset > 0){
                if(rw){
                    px = x - w - offset - 5;
                    if(ie == 9 || ie == 8){
                        px += 2;
                    }
                }else{
                    px = x - w - offset;
                }
            }
            if(py + h > bodyHeight && y - h - offset > 0){
                if(rh){
                    py = y - h - offset + rh + 1;
                }else{
                    py = y - h - offset;
                }
            }
            popup.setXY(px, py);
            $E.notifyObservers(this, 'onShow', this);
        },
        hide: function(){
            for(var i in this._itemArr){
                if(this._itemArr[i].getSubmenu){
                    this._itemArr[i].getSubmenu().hide();
                }
            }
            this._popupBox.hide();
        },
        isShow: function(){
            return this._popupBox.isShow();
        },
        destory: function(){
            this._el.innerHTML = '';
            $E.off(this._el, 'contextmenu');
            this.clearItems();
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        }
        
    });
    /**
     * 【ContextMenuItem】
     * 
     * @class J.ui.ContextMenuItem
     * @name ContextMenuItem
     * @extends Object
     * @param {Object} option 参数对象
     * {
     * title: text,
     * text: '',
     * link: 'javascript:void(0);',
     * icon: null,
     * onClick: null 
     * }
     * icon 为object, 包括{url,className,style}其中一个
     * onClick的回调参数为event, contextMenuItem
     * @example 
     *  //item instanceOf ContextMenuItem
     * var onClick = function(event, item){
     * }
     * 
     * @since version 1.0
     * @description
     */
	var ContextMenuItem = J.ui.ContextMenuItem = new J.Class({
        init: function (opt){
            var option = {
                title: opt.title || opt.text || '',
                text: opt.text || '',
                link: opt.link || 'javascript:void(0);',
                icon: opt.icon || null,
                enable: typeof(opt.enable)==='undefined' ? true : opt.enable,
                onClick: opt.onClick || null,
                argument: opt.argument
            };
            
            this.option = option;
            this.parentMenu = opt.parentMenu;
            
            var liNode = this._el = $D.node('li', {
                'class': 'context_menu_item_container'
            });
            this.render();
            if(option.enable){
                this.enable();
            }else{
                this.disable();
            }
            var onClickFunc, context = this;
            if(option.onClick){
                onClickFunc = function(e){
                    e.preventDefault();
                    if(context._isEnable){
                        option.onClick.call(this, e, context, context.parentMenu);
                    }
                }
            }else{
                onClickFunc = function(e){
                    e.preventDefault();
                }
            }
            $E.on(liNode, 'click', onClickFunc);
       },
        setText: function(text, title){
            this.option.text = text;
            this.option.title = title || text;
            this.render();
        },
        setIcon: function(icon){
            this.option.icon = icon;
            this.render();
        },
        /**
         * 绘制item的内容
         */
        render: function(){
            var option = this.option;
            var html = '<a class="context_menu_item" href="' + option.link + '" title="' + option.title + '">';
            if(option.icon){
                var icon = option.icon,
                    image = icon.url ? 'background-image: url(' + icon.url + ');' : '',
                    style = (icon.style || '') + image,
                    cls = icon.className || '';
                html += '<span class="context_menu_item_icon '+ cls +'" style="' + style + '"></span>';
            }
            html += '<span class="context_menu_item_text">' + option.text + '</span></a>';
            this._el.innerHTML = html;
        },
        getElement: function(){
            return this._el;
        },
        show: function(){
            $D.show(this._el);
        },
        hide: function(){
            $D.hide(this._el);
        },
        disable: function(){
            this._isEnable = false;
            $D.addClass(this._el, 'context_menu_item_disable');
        },
        enable: function(){
            this._isEnable = true;
            $D.removeClass(this._el, 'context_menu_item_disable');
        },
        destory: function(){
            this._el.innerHTML = '';
            $E.off(this._el, 'click');
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        }
    });
    /**
     * 【ContextMenuSeparator】
     * 
     * @class J.ui.ContextMenuSeparator
     * @name ContextMenuSeparator
     * @extends Object
     * 
     * @since version 1.0
     * @description
     */
	var ContextMenuSeparator = J.ui.ContextMenuSeparator = new J.Class({
        init: function (option){
            var html = '<span class="context_menu_separator"></span>';
            var liNode = this._el = $D.node('li', {
                'class': 'context_menu_separator_container'
            });
            liNode.innerHTML = html;
        },
        getElement: function(){
            return this._el;
        },
        show: function(){
            $D.show(this._el);
        },
        hide: function(){
            $D.hide(this._el);
        },
        destory: function(){
            this._el.innerHTML = '';
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        }
    });
    /**
     * 【ContextSubmenuItem】
     * 
     * @class J.ui.ContextSubmenuItem
     * @name ContextSubmenuItem
     * @extends Object
     * @param {Object} option 参数对象
     * {
     * title: text,
     * text: '',
     * link: 'javascript:void(0);',
     * icon: null,
     * items: null,//子菜单的菜单项, 必选项
     * subWidth: null,//子菜单的宽
     * subContainer: null //子菜单的容器
     * }
     * icon 为object, 包括{url,className,style}其中一个
     * 
     * @since version 1.0
     * @description
     */
    var ContextSubmenuItem = J.ui.ContextSubmenuItem = new J.Class({extend: ContextMenuItem}, {
        init: function (option){
            if(!option.items){
                throw new Error('J.ui.ContextSubmenuItem: option.items is null!');
            }
            option.title = option.title || option.text || '';
            var defaultOption = {
                title: null,
                text: '',
                link: 'javascript:void(0);',
                icon: null,
                enable: true,
                subWidth: null,
                parentMenu: option.parentMenu
            };
            delete option.parentMenu;//不删除的话, extend会导致parentMenu指针不对
            option = this.option = J.extend(defaultOption, option);
            this.parentMenu = option.parentMenu;
            var liNode = this._el = $D.node('li', {
                'class': 'context_menu_item_container'
            });
            this.render();
            if(option.enable){
                this.enable();
            }else{
                this.disable();
            }
            var subOption = {
                parentMenu: option.parentMenu,
                width: option.subWidth,
                beforeShow: option.beforeShow,
                items: option.items
            };
            this._submenu = new ContextMenu(subOption);
                
            var onClickFunc, context = this;
            
            var submenuTimer = 0, submenuHideTimeout = 200;
            var hideSubmenu = function(){
                if(context._submenu.isShow()){
                    context._submenu.hide();
                }
            };
            var observer = {
                onItemMouseenter: function(e){
                    e.stopPropagation();
                    if(context._isEnable){
                        var xy = $D.getClientXY(this);
                        context._submenu.show(xy[0], xy[1], 0, this);
                    }
                },
                onItemMouseleave: function(e){
                    if(submenuTimer){
                        window.clearTimeout(submenuTimer);
                        submenuTimer = 0;
                    }
                    submenuTimer = window.setTimeout(hideSubmenu, submenuHideTimeout);
                },
                onSubmenuMouseenter: function(e){
                    if(submenuTimer){
                        window.clearTimeout(submenuTimer);
                        submenuTimer = 0;
                    }
                    $D.addClass(liNode, 'context_menu_item_hover');
                },
                onSubmenuMouseleave: function(e){
                    observer.onItemMouseleave(e);
                    $D.removeClass(liNode, 'context_menu_item_hover');
                }
            };
            $E.on(liNode, 'mouseenter', observer.onItemMouseenter);
            $E.on(liNode, 'mouseleave', observer.onItemMouseleave);
            var submenuEl = context._submenu.getElement();
            $E.on(submenuEl, 'mouseenter', observer.onSubmenuMouseenter);
            $E.on(submenuEl, 'mouseleave', observer.onSubmenuMouseleave);
            if(option.onClick){
                onClickFunc = function(e){
                    e.preventDefault();
                    if(context._isEnable){
                        option.onClick.call(this, e, context);
                        observer.onItemMouseenter.call(this, e);
                    }
                }
            }else{
                onClickFunc = function(e){
                    e.preventDefault();
                    observer.onItemMouseenter.call(this, e);
                }
            }
            $E.on(liNode, 'click', onClickFunc);
        },
        getSubmenu: function(){
            return this._submenu;
        },
        /**
         * 绘制item的内容
         */
        render: function(){
            var option = this.option;
            var html = '<a class="context_menu_item" href="' + option.link + '" title="' + option.title + '">';
            if(option.icon){
                var icon = option.icon,
                    image = icon.url ? 'background-image: url(' + icon.url + ');' : '';
                    style = (icon.style || '') + image,
                    cls = icon.className || '';
                html += '<span class="context_menu_item_icon '+ cls +'" style="' + style + '"></span>';
            }
            html += '<span class="context_menu_item_text">' + option.text + '</span><span class="context_menu_item_subicon"></span></a>';
            this._el.innerHTML = html;
        }
    });
});
/* == UI类 Panel ========================================
 * Copyright (c) 2010, Tencent.com All rights reserved.
 * version: 1.0
 * -------------------------------------------- 2010.10.14 ----- */
 
 
Jx().$package(function(J){
	var packageContext = this,
		$D = J.dom,
		$E = J.event;
		
	
	
	// Panel类
	var Panel = new J.Class({
		/**
		 * @param {Object} option ,{
		 * 	id,name,container,body,html
		 * }
		 */
		init: function(option){
			option = option || {};
			this.id = option.id;
			this.name = option.name;
			this.container = option.container;
			this.body = option.body || option.container;
			
			option.html = option.html || "";
			if(option.html){
				this.setHtml(option.html);
			}
			if($D.isShow(this.container)){
				this.show();
			}else{
				this.hide();
			}

		},
		/**
		 * 设置panel的内容
		 * @param {String} html
		 */
		setHtml: function(html){
			this.html = html;
			this.body.innerHTML = html;
		},
		/**
		 * 把node添加到尾部
		 * @param {HTMLElement} node 
		 */
		append: function(node){
			this.body.appendChild(node);
		},
		/**
		 * 返回container的大小
		 * @return  {Object}, {widht:xxx,height:xxx}
		 */
		getSize: function(){
			return {
				width:$D.getClientWidth(this.container),
				height:$D.getClientHeight(this.container)
			};
		},
		/**
		 * 返回body的大小,body跟container可能不一样
		 * 在没有设置body的时候,body就是container
		 * @return {Object} {widht:xxx,height:xxx}
		 */
		getBodySize: function(){
			
            return {
                width: parseInt($D.getStyle(this.body, "width"), 10),
                height: parseInt($D.getStyle(this.body, "height"), 10)
            };
		},
        /**
         * 显示面板
         * 
         */
		show: function(){
			$D.show(this.container);
			$E.notifyObservers(this, "show", this.getBodySize());
			this._isShow = true;
		},
        /**
         * 隐藏面板
         */
		hide: function(){
			$D.hide(this.container);
			$E.notifyObservers(this, "hide");
			this._isShow = false;
		},
        /**
         * 返回面板是否显示
         * @return {Boolean} 
         */
		isShow: function(){
			return this._isShow;
		},
        /**
         * 切换面板的显示与隐藏
         */
		toggleShow: function(){
			if(this.isShow()){
				this.hide();
			}else{
				this.show();
			}
		},
        /**
         * 获取z-index
         * @return {Int}
         */
		getZIndex: function(){
			return this._zIndex;
		},
		/**
         * 设置z-index
         * @param {Int} zIndex
		 */
		setZIndex: function(zIndex){
			$D.setStyle(this.container, "zIndex", zIndex);
			this._zIndex = zIndex;
		},
        /**
         * 设置面板坐标
         * @param {Int} x
         * @param {Int} y
         */
		setXY: function(x, y){
			this.setX(x);
			this.setY(y);
		},
		/**
		 * 设置面板位置 X
         * @param {Int} x
		 */ 
		setX: function(x) {
			$D.setStyle(this.container, "left", x + "px");
		},
		/**
		 * 设置面板位置 Y
         * @param {Int} y
		 */ 
		setY: function(y) {
			$D.setStyle(this.container, "top", y + "px");
		},
		/**
         * 设置宽度
         * @param {Int} w
		 */
		setWidth: function(w){
			$D.setStyle(this.container, "width", w + "px");
		},
        /**
         * 获取宽度
         * @return {Int} 
         */
		getWidth: function(){
			return parseInt($D.getStyle(this.container, "width"));
		},
        /**
         * 设置高度
         * @param {Int} h
         */
		setHeight: function(h){
			$D.setStyle(this.container, "height", h + "px");
		},
        /**
         * 获取高度
         * @return {Int} 
         */
		getHeight: function(){
			return parseInt($D.getStyle(this.container, "height"));
		}
	});
	
	J.ui.Panel = Panel;
	
});


/* == boxy类 =============================================
 * 弹出框
 * Copyright (c) 2010, Tencent.com All rights reserved.
 * version: 1.0
 * rehorn
 * -------------------------------------------- 2011-3-28 ----- */
 
 
Jx().$package(function (J) {
    var $D = J.dom,
		$E = J.event;
	
	var Boxy = new J.Class({
		init: function (option) {
			var _this = this;
			option = option || {};
			this._id = (option.id || (new Date().getTime()));
			option.name = option.id;
			option.width = option.width || 300;
			option.height = option.height || 300;
			option.appendTo = option.appendTo || document.body;
            option.zIndex = option.zIndex || 1;
			var node = $D.node('div',{
				'class':'ui_boxy'
			});
			node.innerHTML = '\
				<div style="position:relative; z-index:1;"><div class="ui_boxyClose" id="ui_boxyClose_'+this._id+'"></div></div>\
				<div class="ui_boxyWrapper" id="ui_boxyWrapper_'+this._id+'"></div>\
				';
			option.appendTo.appendChild(node);
			option.container = node;
			option.body = $D.id('ui_boxyWrapper_'+this._id);
			this._option = option;
			
			this._panel = new J.ui.Panel(option);
			this._panel.setWidth(option.width);
			this._panel.setHeight(option.height);
            this._maskLayer;
            if(option.modal){
                this._maskLayer = new J.ui.MaskLayer({ 
                        appendTo: option.appendTo,
                        zIndex: option.zIndex,
                        opacity: 0.5
                    });
                this._maskLayer.show();
            }
			this._panel.setZIndex(option.zIndex + 1);
			this.setCenter(option);
			new J.ui.Drag(node, node, {isLimited: true});
			
            var closeBtn = $D.id("ui_boxyClose_" + this._id);
            var wrapper = this._wrapper = $D.id("ui_boxyWrapper_" + this._id);
			$E.on(closeBtn, 'click', function(e){
				//_this.hide();
				_this.close();
                option.onClose && option.onClose.apply(_this);
				$E.notifyObservers(_this, 'close');	
			});
			
		},
		getPanel: function(){
			return this._panel;
		},
		show: function(){
			this._panel.show();	
		},
		hide: function(){
			this._panel.hide();
		},
        setZIndex: function(index){
            this._panel.setZIndex(index); 
        },
		setCenter: function(option){
			var w = $D.getClientWidth(),
				h = $D.getClientHeight();
        	var l = (w > option.width) ? (w - option.width) / 2 : 0;
            var t = (h > option.height) ? (h - option.height) / 2 : 0;
            this._panel.setXY(l,t);
		},
		isShow: function(){
			return this._panel.isShow();
		},
		close: function(){
			//this._panel.hide();
            this._maskLayer && this._maskLayer.remove();
			this._option.appendTo.removeChild(this._option.container);
		}
	});
	
	J.ui.Boxy = Boxy;
});
/* == UI类 PopupBox ========================================
 * Copyright (c) 2010, Tencent.com All rights reserved.
 * version: 1.0
 * -------------------------------------------- 2010.10.14 ----- */
 
 
Jx().$package(function(J){
	var packageContext = this,
		$D = J.dom,
		$E = J.event,
		currentPopupBox = null;
		
	
	// PopupBox类
	var PopupBox = new J.Class({ extend: J.ui.Panel },{
		callSuper : function(func){
			var slice = Array.prototype.slice;
			var a = slice.call(arguments, 1);
			PopupBox.superClass[func].apply(this, a.concat(slice.call(arguments)));
		},
		/***
		 * @param option ,{
		 *  id,name,container,body,html,
		 * 	noCatchMouseUp:不捕捉鼠标点击事件,default:false,
		 * 	noCloseOnEsc:按esc不隐藏,default:false
		 * }
		 */
		init:function(option){
			this.parentPopupBox = option.parentPopupBox;
			//调用父类的初始化代码
			this.callSuper('init',option);
			
			var context = this;
			this.catchMouseUp = true;
			if(option.noCatchMouseUp){
				this.catchMouseUp = false;
			}
			this.closeOnEsc = true;
			if(option.noCloseOnEsc){
				this.closeOnEsc = false;
			}
			this.onDocumentKeydown = function(e){
				if(e.keyCode === 27){
					// 阻止默认事件,因为像ff下，esc可能会有stop页面的功能
					e.preventDefault();
					context.hide();
				}
			};
			this.onMouseUp = function(){
				if(context.isShow()){
					context.hide();
				}
			};
			this.onDocumentClick = function(){
				context.hide();
			};
			this.onWindowResize = function(){
				context.hide();
			};
			
		},

		show : function(){
                
			if(currentPopupBox){
                if(this.parentPopupBox == currentPopupBox){
                    
                }else{
				    currentPopupBox.hide();
                }
			}
			if(this.catchMouseUp){
				$E.on(document.body, "mouseup", this.onMouseUp);
			}else{//没有off的必要,因为mouseup事件只在catchMouseUp为true时才注册
//				$E.off(document, "mouseup", this.onMouseUp);
			}
			
			if(this.closeOnEsc){
				$E.on(document, "keydown", this.onDocumentKeydown);
			}else{
//				$E.off(document, "keydown", this.onDocumentKeydown);
			}
			$E.on(document.body, "click", this.onDocumentClick);
			$E.on(window, "resize", this.onWindowResize);
            if(!this.parentPopupBox){//如果不是子popupbox, 才赋值
                currentPopupBox = this;
            }
			this.callSuper('show');

		},
		hide : function(){
			$E.off(document.body, "click", this.onDocumentClick);
			$E.off(document, "keydown", this.onDocumentKeydown);
			$E.off(window, "resize", this.onWindowResize);
			$E.off(document.body, "mouseup", this.onMouseUp);
			if(currentPopupBox){
                if(this.parentPopupBox){
                    //有parent,说明是子popupbox, 不做处理
                }else{
                    if(currentPopupBox !== this ){
                        currentPopupBox.hide();
                    }
                    currentPopupBox = null;
                }
			}
			this.callSuper('hide');
		}
	});
	
	J.ui.PopupBox = PopupBox;
	
});


/**
 * MaskLayer模块
**/
Jx().$package(function(J){
	var $ = J.dom.id,
		$D = J.dom,
		$E = J.event;
		
	/**
	 * MaskLayer 遮罩层类
	 * 
	 * @memberOf ui
	 * @Class
	 * 
	 * @param {Object} option 其他选项，如:zIndex,appendTo...
	 * @returns
	 * 
	 * */
	var _id = 0;
	J.ui.MaskLayer = new J.Class({
		// == Doc ===================
		/*************************************
		 * 初始化函数
		 * init: function(option){}
		 * @param option {object} 设置参数
		 * 
		 ************************************/
		_getMaskId: function(){
			return _id++;	
		},
		init:function(option){
			option = option || {};
			var mid = this._getMaskId();
			var context = this;
			this._initZIndex = option.zIndex = !J.isUndefined(option.zIndex) ? option.zIndex : 9000000;
			this._initOpacity = option.opacity = !J.isUndefined(option.opacity) ? option.opacity : 0.5;
			option.appendTo = option.appendTo || document.body;
			option.className = option.className || '';
			this.option = option;
			this.container = $D.node("div", {
				"id": "ui_maskLayer_" + mid,
				"class" : "ui_maskLayer " + option.className
			});
			var html = '<div id="ui_maskLayerBody_' + mid + '" class="ui_maskLayerBody"></div>';
			if(J.browser.ie){
                html += '<iframe class="ui_maskBgIframe"></iframe>';
            }
			this.container.innerHTML = html;
            
			this.reset();
			option.appendTo.appendChild(this.container);
			
			var observer = {
				onMaskLayerClick : function(){
					$E.notifyObservers(context, "click", context);
				}
			};
			
			$E.on(this.container, "click", observer.onMaskLayerClick);
			
			this.body = $D.id("ui_maskLayerBody_" + mid);
		},
        /**
         * 获取遮罩的dom节点
         * @return {HTMLElement} 
         */
        getElement : function(){
            return this.container;  
        },
		append : function(el){
			this.body.appendChild(el);
		},
		
		show : function(){
			$D.show(this.container);
			$E.notifyObservers(this, "show");
			this._isShow = true;
		},
		hide : function(){
			$D.hide(this.container);
			$E.notifyObservers(this, "hide");
			this._isShow = false;
		},
		isShow : function(){
			return this._isShow;
		},
		toggleShow : function(){
			if(this.isShow()){
				this.hide();
			}else{
				this.show();
			}
		},
		getZIndex : function(){
			return this._zIndex;
		},
		
		setZIndex : function(zIndex){
			$D.setStyle(this.container, "zIndex", zIndex);
			this._zIndex = zIndex;
		},
        /**
         * 设置遮罩的透明度
         * @param {Decimal} opacity 透明度,0~1之间的小数
         */
		setOpacity: function(opacity){
            $D.setStyle(this.container, 'opacity', opacity);
        },
        /**
         * 重置遮罩的透明度,zindex等,重新设置为初始值
         * @return {MaskLayer} 返回自身
         */
        reset: function(){
            this.setOpacity(this._initOpacity);
            this.setZIndex(this._initZIndex);
            return this;
        },
		fadeIn : function(){
			this.show();
		},
		
		fadeOut : function(){
			this.hide();
		},
		
		remove : function(){
			if(this.option.appendTo)	{
				this.option.appendTo.removeChild(this.container);
			}
		},
		
		// 关于
		about : function(){
			
		}
	});

});
/* == J.ui.TextBox =============================================
 * Copyright (c) 2011, Tencent.com All rights reserved.
 * version: 1.0
 * rehorn
 * -------------------------------------------- 2011-1-22 ----- */
 
 
Jet().$package(function (J) {
    var $D = J.dom,
    	$S = J.string,
		$E = J.event;
	
	
	
	/**
     * 【TextBox】
     * 
     * @class J.ui.TextBox
     * @name ShareBox
     * @extends Object
     * @param {Object} option 构造参数
     * {
     * id: '',//random
     * name: id,
     * container: document.body,
     * className: '' ,
     * title: '',
     * text: '',
     * height: 200,
     * width: 200,
     * limit: 200,
     * readOnly: false,
     * hintLink: [{
     * 	text:'',
     *  click:''
     *	}]
     * }
     * 
     * var sharebox = new J.ui.TextBox({
	 *		title: '分享',
	 *		text: '内容',
	 *		hint: [{
	 *			text: '更多',
	 *			click: ''					
	 *		}]
	 *	});
	 *	sharebox.show(200, 200);
     * @since version 1.0
     * @description
     */
	var TextBox = J.ui.TextBox= new J.Class({
		init: function(option){
			var id = 'share_box_' + (option.id || (new Date().getTime()));
            var name = option.name || id;
            var parent = option.container || document.body;
            var className = option.className || '';
            var content = option.text || '';
            this._titleHeight = 22;
            this._footerHeight = 26;
            this._padding = 4 * 2;
            this._margin = 4 * 2;
            option.width = option.width || 200;
            option.height = option.height || 100;
            option.limit = option.limit || 0;
            option.isPopup = option.isPopup || false;
            option.readOnly = option.readOnly || false;
            option.maskIframe = option.maskIframe || false;
            this._isShow = false;
            
            var container = this._el = $D.node('div', {
                id: id,
                'class': 'share_box ' + className
            });
            	
            var html = '\
            	<div class="share_box_title" id="'+ id +'_title">\
            		<div class="share_box_titleTxt" id="'+ id +'_titleTxt"></div>\
            	</div>\
            	<div class="share_box_body" id="'+ id +'_body">\
            		<!--textarea class="share_box_text" id="'+ id +'_text"></textarea-->\
            	</div>\
           		<div class="share_box_footer" id="'+ id +'_footer">\
           			<div class="share_box_showthumb" id="'+id+'_showthumb"></div>\
           			<div class="share_box_hint" id="'+ id +'_hint"></div>\
           			<div class="share_box_count" id="'+ id +'_count"></div>\
           		</div>\
           		<div>\
           			<img id="'+id+'_thumb" class="share_box_thumb" src="'+option.thumb+'" width=211 height=127 />\
           		</div>';
            
            if(option.maskIframe){
            	html += '<iframe class="ui_maskBgIframe" src="'+alloy.CONST.MAIN_URL+'domain.html;" border="0"></iframe>';
            }
            
            container.innerHTML = html;
            parent.appendChild(container);
            if(option.isPopup){
            	this._panel = new J.ui.PopupBox({
	                id: id,
	                name: name,
	                container: container
	            });
            }else{
            	this._panel = new J.ui.Panel({
	                id: id,
	                name: name,
	                container: container
	            });
            }
            
            
            this._shareBoxTitleTxt = $D.id(id + '_titleTxt');
            this._shareBoxTitle = $D.id(id + '_title');
            this._shareBoxHint = $D.id(id + '_hint');
            this._shareBoxFooter = $D.id(id + '_footer');
            this._shareBoxBody = $D.id(id + '_body');
            this._shareBoxCount = $D.id(id + '_count');
            this._shareBoxShowthumb=$D.id(id + '_showthumb');
            this._shareBoxThumb=$D.id(id + '_thumb');
            
            var areaHtml = '<strong class="share_big_quote share_left_quote">“</strong><textarea class="share_box_text" id="'+ id +'_text"></textarea><strong class="share_big_quote share_right_quote">”</strong>';
            if(option.readOnly){
            	//this._shareBoxText.readOnly = 'readonly';
            	areaHtml = '<strong class="share_big_quote share_left_quote">“</strong><textarea class="share_box_text" id="'+ id +'_text" readOnly="readonly"></textarea><strong class="share_big_quote share_right_quote">”</strong>';
            }
            if(!option.thumb){
            	$D.hide(this._shareBoxShowthumb);
            }
            this._shareBoxBody.innerHTML = areaHtml;
            this._shareBoxText = $D.id(id + '_text');
            
            var context = this;
            var observer = {
            	onSendButtonClick: function(e){
            		e.preventDefault();
            		e.stopPropagation();
            		$E.notifyObservers(context, 'clickSendButton');
            	},
            	onCloseButtonClick: function(e){
            		e.preventDefault();
            		e.stopPropagation();
            		context.hide();
            		$E.notifyObservers(context, 'clickCloseButton');
            	},
            	onTextAreaKeyUp: function(e){
            		e.stopPropagation();
					e.preventDefault();
					alloy.util.subStringByChar(e, option.limit);
            	},
			toggleThumb:function(e){
				e.preventDefault();
				e.stopPropagation();
				if($D.isShow(context._shareBoxThumb)){
					$D.hide(context._shareBoxThumb);
				}
				else{
					$D.show(context._shareBoxThumb);
				}
			}
            };
            
            this._sendButton = new J.ui.Button({
            	'appendTo' : this._shareBoxFooter,
				'className' : 'window_button window_ok',
				'isStopPropagation' : true,
				'text' : '发表' ,
				'event' : {
					'click' : observer.onSendButtonClick
				}
			});
			this._closeButton = new J.ui.Button({
            	'appendTo' : this._shareBoxTitle,
				'className' : 'textbox_button',
				'isStopPropagation' : true,
				'title' : '关闭' ,
				'event' : {
					'click' : observer.onCloseButtonClick
				}
			});
			this._sendButton.show();
			this._closeButton.show();
            
            this._shareBoxText.innerHTML = content;
            
            if(option.title){
            	this._shareBoxTitleTxt.innerHTML = option.title;
            	$D.show(this._shareBoxTitle);
            }
            if(option.hint){
            	var spliter = '',
            		node = null;
            	
            	for(var i=0; i<option.hint.length; i++){
            		node = $D.node('a', {
            			'href': '###',
            			'class': 'share_box_hintLink'
            		});
            		node.innerHTML = option.hint[i].text;
            		$E.on(node, 'click', option.hint[i].click);
            		this._shareBoxHint.appendChild(node);
            	}
            }
            if(option.limit){
            	//暂时去掉数字提示
//	            this._shareBoxCount.innerHTML = option.maxChar;
//            	$D.show(this._shareBoxCount);
            	$E.on(this._shareBoxText, 'keyup', observer.onTextAreaKeyUp);
            }
            $E.on(this._shareBoxShowthumb, 'click', observer.toggleThumb);
            
            this.setHeight(option.height);
            this.setWidth(option.width);
		},
		setHeight: function(height){
			var h = height - this._titleHeight - this._footerHeight;
			$D.setStyle(this._shareBoxText, 'height', h + 'px');
		},
		setWidth: function(width){
			$D.setStyle(this._el, 'width', width + 'px');
			$D.setStyle(this._shareBoxText, 'width', (width - this._padding - this._margin) + 'px');
		},
		addMask: function(el){
			if(!J.browser.ie) 
				return;
			
			if(J.isString(el)){
				var iframe = '<iframe class="ui_maskBgIframe" src="'+alloy.CONST.MAIN_URL+'domain.html"></iframe>';
				return el+iframe;
			}else{
				var iframe = $D.node('iframe',{
					'class': 'ui_maskBgIframe',
					'src': alloy.CONST.MAIN_URL+'domain.html'
				});	
				el.appendChild(iframe);
			}
		},
		getElement: function(){
			return this._el;
		},
		isShow: function(){
			return this._isShow;	
		},
		show: function(x, y){
			if(x && y){
				this._panel.setXY(x, y);
			}
			this._panel.show();
			this._isShow = true;
		},
		hide: function(){
			this._panel.hide();
			this._isShow = false;
			$E.notifyObservers(this, 'hide');
		},
		getValue: function(){
			return this._shareBoxText.value;
		},
        setValue: function(value){
            this._shareBoxText.value = value;
        },
		setHint: function(el){
			this._shareBoxHint.innerHTML = '';
			this._shareBoxHint.appendChild(el);
			$D.show(this._shareBoxHint);
		},
		setThumb: function(url){
			this._shareBoxThumb.src=url;
		}
	});
});		
		
		
/* == J.ui.DivSelect =============================================
 * Copyright (c) 2010, Tencent.com All rights reserved.
 * version: 1.0
 * rehorn
 * -------------------------------------------- 2011-3-14 ----- */
 
Jet().$package(function (J) {
    var packageContext = this,
    	$D = J.dom,
    	$S = J.string,
		$E = J.event;
	
	/*
       * div模式select相关，可以移植到其他地方 示例： html:<div id="testdiv"></div> js:
       * divSelect.show("testdiv","test",selOptions,"",160,"test()");
       * 
       */
      // var _divSelect;
      // var divSelect = {
      var DivSelect = J.ui.DivSelect = new J.Class({
        /*
         * 主调函数 参数含义：容器，名称，数据[数组]，默认项，宽度 注意：数据格式
         */

        init : function(objId, selectName, dataObj, selOption, width, isUpper) {

          this._selectName = selectName;
          this._dataObj = dataObj;
          this._selOption = selOption;
          this._isUpper = isUpper || false;

          // _divSelect = divSelect; ;
          var data = dataObj.data;
          var _Obj = document.getElementById(objId);
          if (!_Obj || typeof(_Obj) === "undefined") {
            return false;
          }
          var s1 = document.createElement("div");
          if (isNaN(width) || width == "") {
            width = 150;
          } else if (width < 26) {
            width = 26;
          }
          s1.style.width = width;
          var top = ""
          if(this._isUpper){
	          s1.style.position = "relative";
	          var height = (15*(data.length)); //每个item 15px
	          top = "top:-"+((height>150?150:height)+4)+"px;";
          }

          var str = "";
          /*
           * //判断是否有数据
           */
          // 判断是否有数据
          if (data.length > 0) {
            // 有数据时显示数据选项列表
            str += "<input type='hidden' name='" + selectName
                + "' id='" + selectName + "' value='"
                + this.relv(selOption, data) + "'>";
            str += "<div id='_a_" + selectName + "' style='width:"
                + width
                + "px;height:18px; border:1px #728EA4 solid;'>";

            str += "<div id='_v_"
                + selectName
                + "' style='position:relative;float:left;left:2px;width:"
                + (width - 22)
                + "px;height:18px;font-size:12px;overflow:hidden;line-height:18px;'>"
                + this.reStr(data, selOption) + "</div>";
            str += "<div id='_arr_"
                + selectName
                + "' class='divSelect_arr' style='position:relative;float:right;right:0px;width:18px;height:18px;text-align:center;font-family:Webdings;font-size:16px;overflow:hidden;background-color:#FFF;cursor:pointer!important;cursor:hand;'></div>";
            str += "</div>";
            str += "<div id='_b_"
                + selectName
                + "' style='position:absolute; background-color:#FFFFFF; width:"
                + width
                + "px; height:"
                + this.height(data.length)
                + "px;border:1px #728EA4 solid;overflow-x:hidden;overflow-y:auto;display:none; z-index:99999;" + top + "'>";
            for (var i = 0; i < data.length; i++) {
              var style = data[i][0] == selOption
                  ? this.style(2)
                  : this.style(1);
              str += "<div id='_s_" + selectName + i
                  + "' style='" + style + "' >" + data[i][1]
                  + "</div>";
            }
            str += "</div>";
          } else {
            // 没有数据时显示一个空窗体
            str += "<input type='hidden' name='" + selectName
                + "' id='" + selectName + "' value='"
                + selOption + "'>";
            str += "<div id='_a_" + selectName + "' style='width:"
                + width
                + "px;height:18px; border:1px #728EA4 solid;'>";
            str += "<div id='_v_"
                + selectName
                + "' style='position:relative;float:left;left:2px;width:"
                + (width - 22)
                + "px;height:18px;font-size:12px;overflow:hidden;line-height:18px;'></div>";
            str += "<div id='_arr_"
                + selectName
                + "' class='divSelect_arr' style='position:relative;float:right;right:0px;width:18px;height:18px;text-align:center;font-family:Webdings;font-size:16px;overflow:hidden;background-color:#FFF;cursor:pointer!important;cursor:hand;'></div>";
            str += "</div>";
            str += "<div id='_b_"
                + selectName
                + "' style='position:absolute; background-color:#FFFFFF; width:"
                + width
                + "px; height:"
                + this.height(0)
                + "px;border:1px #728EA4 solid;overflow-x:hidden;overflow-y:auto;display:none; z-index:99999;'></div>";
          }

          s1.innerHTML = str;
          _Obj.appendChild(s1);

          var divSelectObj = this;

          var clickShowOption = function() {
            divSelectObj.showOptions();
          }

          $E.on($D.id('_v_' + selectName), "click", clickShowOption);
          $E.on($D.id('_arr_' + selectName), "click",
                  clickShowOption);
          if (data.length > 0) {
            var optionOver = function() {
              divSelectObj.css(this, 3);
            };
            var optionOut = function() {
              divSelectObj.css(this, 1);
            };
            var optionClick = function() {
              divSelectObj.selected(this);
            };
            for (var i = 0; i < data.length; i++) {
              $E.on($D.id('_s_' + selectName + i), "mouseover",
                  optionOver);
              $E.on($D.id('_s_' + selectName + i), "mouseout",
                  optionOut);
              $E.on($D.id('_s_' + selectName + i), "click",
                  optionClick);
            }

          }
        },
        /*
         * clickShowOption : function(){ divSelectObj.showOptions(); },
         */
        // 返回选定项的值
        value : function(n) {
          n = n || this._selectName;
          return document.getElementById(n).value;
        },
        // 返回选定项的文本
        text : function(n) {
          n = n || this._selectName;
          return document.getElementById("_v_" + n).innerHTML;
        },
        selected : function(optionObj) {
          var data = this._dataObj.data;
          var value = optionObj.innerHTML;
          for (var i = 0; i < data.length; i++) {
            if (data[i][1] === value) {
              $D.id(this._selectName).value = data[i][0];
            }
            $D.id('_s_' + this._selectName + i).style.cssText = this.style(1);
          }

          $D.id("_v_" + this._selectName).innerHTML = value;

          optionObj.style.cssText = this.style(2);
          this.hidden();
          $E.notifyObservers(this, "selectedChanged");
        },
        relv : function(v, d) {
          for (var i = 0; i < d.length; i++) {
            if (d[i][0] == v) {
              return v;
            }
          }
          if (v == null || v == "") {
            return d[0][0];
          }
        },
        reStr : function(d, m) {
          for (var i = 0; i < d.length; i++) {
            if (d[i][0] == m) {
              return d[i][1];
            }
          }
          if (m == null || m == "") {
            return d[0][1];
          }
        },
        height : function(l) {
          var h;
          if (l > 10 || l < 1)
            h = 10 * 15;
          else
            h = l * 15;
          h += 2;
          return h;
        },
        showOptions : function(n) {
          n = n || this._selectName;
          var o = document.getElementById("_b_" + n)
          if (o.style.display == "none")
            o.style.display = "";
          else
            o.style.display = "none";

        },
        hidden : function() {
          document.getElementById("_b_" + this._selectName).style.display = "none";
        },
        style : function(m) {
          var cs = "";
          switch (m) {
            case 1 :
              cs = "height:15px; font-size:12px; line-height:15px; overflow:hidden; background-color:#FFFFFF; color:#000000; font-weight:normal;";
              break;
            case 2 :
              cs = "height:15px; font-size:12px; line-height:15px; overflow:hidden; background-color:#315DAD; color:#FFFFFF; font-weight:bold;";
              break;
            case 3 : //mouseover
              cs = "height:15px; font-size:12px; line-height:15px; overflow:hidden; background-color:#D8D8D8; color:#000000; font-weight:normal;";
              break;
          }
          return cs;
        },
        css : function(optionObj, type) {
          if (type === 1) {
            if ($D.id("_v_" + this._selectName).innerHTML != optionObj.innerHTML) {
              optionObj.style.cssText = this.style(type);
            }
          } else {
            if ($D.id("_v_" + this._selectName).innerHTML != optionObj.innerHTML) {
              optionObj.style.cssText = this.style(type);
            }
          }
        }
      });
      
});
	
	
/**  J.ui.Bubble
 * @deprecated QQ Web bubble 模块
 *  Copyright (c) 2009, Tencent.com All rights reserved.
 *  -------- 2009.11.17 -----
 *  
 *  -------------------------
 *  melody
 *  -------------------------
 * @version 1.0
 * @author Tencent
 *  
 **/


Jet().$package(function (J) {
    var $D = J.dom,
        $S = J.string,
        $E = J.event;
		
    /**
     * 气泡类
     * @class
     * @constructor
     * @param {Object} option 构造参数
     * {
     *   bubbleParent, {HTMLElement} 气泡的dom的父节点
     * }
     * @description 
     * 注意, bubble的自动关闭都是hide调用, 是不会把自己删除的, 要删除bubble, 调用close方法
     * 
     */
    var Bubble = J.ui.Bubble = J.Class(
    /**
     * @lends Bubble.prototype
     */
    {
        /**
         * 初始化气泡
         * @private
         * @ignore
         */
        init: function(option){
            option = option || {};
            var defaultOption = {
                bubbleParent: document.body,
                className: '',
                hasCloseButton: true,
                closeOnHide: false,
                zIndex: 1000000
            };
            option = this.option = J.extend(defaultOption, option);
            var id = this._getId();
            
            var html = '<div id="bubble_tip_pointer_' + id + '" class="bubble_tip_pointer bubble_tip_pointer_left"></div>\
	            <div class="bubble_tip_head"></div>\
	            <div class="bubble_tip_body">\
	                <div class="bubble_tip_title"><a id="bubble_tip_close_' + id + '" href="###" class="bubble_tip_close" title="关闭">x</a>\
                        <span id="bubble_tip_title_' + id + '"></span></div>\
	                <div id="bubble_tip_content_' + id + '" class="bubble_tip_content"></div>\
	            </div>\
	            <div id="bubble_tip_foot_' + id + '" class="bubble_tip_foot">\
	                <a id="bubble_tip_btn_next_' + id + '" href="###" class="bubble_tip_btn bubble_tip_btn_next"></a>\
                    <a id="bubble_tip_btn_ok_' + id + '" href="###" class="bubble_tip_btn bubble_tip_btn_ok"></a>\
	            </div>\
                <iframe width="100%" height="100%" class="bubble_tip_bg_iframe" src="about:blank"></iframe>';
	        var divNode = $D.node("div",{
	            'class': 'bubble_tip_container ' + option.className
	        });
	        divNode.innerHTML = html;
            $D.setCssText(divNode, 'left: -10000px; top: 0px; z-index: ' + option.zIndex + ';');
	        option.bubbleParent.appendChild(divNode);
            
            
            this._container = divNode;
            this._title = $D.id('bubble_tip_title_' + id);
            this._content = $D.id('bubble_tip_content_' + id);
            this._pointer = $D.id('bubble_tip_pointer_' + id);
            this._okBtn = $D.id('bubble_tip_btn_ok_' + id);
            this._nextBtn = $D.id('bubble_tip_btn_next_' + id);
            this._closeBtn = $D.id('bubble_tip_close_' + id);
            if(!option.hasCloseButton){
                $D.hide(this._closeBtn);
            }
            var context = this;
            
            var observer = {
                onCloseBtnClick: function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    context.hide();
                    $E.notifyObservers(context, 'onBubbleClose', context);
                },
                onOkButtonClick: function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    context.hide();
                    $E.notifyObservers(context, 'onBubbleOkBtnClick', context);
                },
                onNextButtonClick: function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    $E.notifyObservers(context, 'onBubbleNextBtnClick', context);
                }
            };
            
            $E.on(this._closeBtn, 'click', observer.onCloseBtnClick);
            $E.on(this._okBtn, 'click', observer.onOkButtonClick);
            $E.on(this._nextBtn, 'click', observer.onNextButtonClick);
            
        },
        /**
         * 获取容器的Dom元素
         * @return {HTMLElement}
         */
        getElement: function(){
            return this._container;
        },
        /**
         * 显示气泡
         * @param {Object} option
         * @example
         * option 的默认参数为:
         * {
         *       pointerPosition: 'top right',//箭头的位置
         *       pointerOffset: 20,//箭头在气泡边上的偏移值
         *       pointerSize: [18, 12],//箭头的高度/宽度
         *       position: [0,0],//气泡的位置,直接设置position的时候,不要设置target,否则不起作用
         *       target: null,//{HTMLElement} 气泡所指的dom节点, ps: 如果该属性存在, 则忽略position的设置
         *       targetOffset: [x, y]//气泡位置的便宜, x/y可正负 
         *  };
         *  
         * pointerPosition的值可为
         *  "top left"
         *  "top right"
         *  "bottom left"
         *  "bottom right"
         *  "left top"
         *  "left bottom"
         *  "right top"
         *  "right bottom"
         *  
         *  @description
         *  TODO 后续可添加通过设置targetPosition来直接指定箭头以及气泡的位置
         */
        show: function(option){
            option = option || {};
            var defaultOption = {
                pointerPosition: 'top right',
                pointerOffset: 20,
                pointerSize: [18, 12],
                position: [0, 0],
                target: null,
                targetOffset: [0, 0]
            };
            option = J.extend(defaultOption, option);
            //检查箭头的位置参数是否合法
            if(!this._checkPointerPosition(option.pointerPosition)){
                throw new Error('Bubble >>>> the pointerPosition\'s value is not correct');
            }
            //设置箭头在bubble内的位置
            this._setPointerPosition(option.pointerPosition, option.pointerOffset);
            //设置气泡的位置
            this._setBubblePosition(option);
            
            $D.show(this._container);
        },
        /**
         * 设置气泡的z-index
         * @param {Int} zIndex
         */
        setZIndex: function(zIndex){
            $D.setStyle(this._container, 'zIndex', zIndex);  
        },
        /**
         * 设置气泡外框的样式
         * @param {String} property 属性
         * @param {String} value 值
         */
        setContainerStyle: function(property, value){
            $D.setStyle(this._container, property, value);
        },
        /**
         * 设置标题文字
         * @param {String} text 标题文字
         */
        setTitle: function(text){
            this._title.innerHTML = text;
        },
        /**
         * 设置主题内容
         * @param {String} html 主题内容, 可包含html标签
         */
        setContent: function(html){
            this._content.innerHTML = html;  
        },
        /**
         * 显示一个的按钮
         * @param {String} type 按钮的类型
         * @param {String} text 按钮的文字
         */
        showButton: function(type, text){
            var btn = this['_' + type + 'Btn'];
            if(btn){
                btn.innerHTML = text;
                $D.show(btn);
            }
            return btn;
        },
        /**
         * 隐藏按钮
         * @param {String} type 按钮类型
         */
        hideButton: function(type){
            var btn = this['_' + type + 'Btn'];
            if(btn){
                $D.hide(btn);
            }
        },
        /**
         * 隐藏气泡
         */
        hide: function(){
            $D.hide(this._container); 
            if(this.option.closeOnHide){
                this.close();
            }
        },
        /**
         * 关闭并注销气泡
         */
        close: function(){
            if(!this._isClosed){
                this._isClosed = true;
                $E.off(this._closeBtn, 'click');
                $E.off(this._okBtn, 'click');
                $E.off(this._nextBtn, 'click');
                if(this._container.parentNode){
                    this._container.parentNode.removeChild(this._container);
                }
                for (var p in this) {
                    if (this.hasOwnProperty(p)) {
                        delete this[p];
                    }
                }
            }else{
                J.warn('Trying to close a closed bubbleTip!', 'BubbleTip');
            }
        },
        /**
         * 指示是否已关闭气泡
         */
        isClose: function(){
            return this._isClosed;
        },
        /**
         * 返回一个内部使用的id
         * @private
         * @return {Int} 
         */
        _getId: function(){
            if(!Bubble.__id){
                Bubble.__id = 0;
            }
            return Bubble.__id++;
        },
        /**
         * 设置箭头的指示方向和位置
         * @private
         * @param {String} position 箭头的位置, 由两个单词(top/bottom/left/right中的一个)组成
         * @param {Int} offset 箭头的偏移位置
         * @example
         *  position的值可为
         *  "top left"
         *  "top right"
         *  "bottom left"
         *  "bottom right"
         *  "left top"
         *  "left bottom"
         *  "right top"
         *  "right bottom"
         */
        _setPointerPosition: function(position, offset){
            var posArr = position.split(' ');
            var pointer = this._pointer;
            $D.setClass(pointer, 'bubble_tip_pointer bubble_tip_pointer_' + posArr[0]);
            $D.setCssText(pointer, '');
            $D.setStyle(pointer, posArr[1], offset + 'px');
        },
        /**
         * 设置气泡的位置
         * @private
         * @param {Object} option show 的参数
         */
        _setBubblePosition: function(option){
            var position = option.position;//直接设置position后就不要设置target
            
            if(option.target){
                var posArr = option.pointerPosition.split(' ');
                var posObj = this._calculateBubblePosition(option.target, option.pointerSize, option.pointerOffset);
                var sub = 0;
                if(/top|bottom/.test(posArr[0])){
                    sub = 1;
                }
                position[0] = posObj[posArr[sub] + sub];
                sub = (sub + 1) % 2;
                position[1] = posObj[posArr[sub] + sub];
            }
            var x = position[0] + option.targetOffset[0];
            var y = position[1] + option.targetOffset[1];
            $D.setStyle(this._container, 'left', x + 'px');
            $D.setStyle(this._container, 'top', y + 'px');
        },
        /**
         * 计算气泡的位置
         * @param {HTMLElement} target 箭头所指的dom
         * @param {Array} pointerSize 箭头的大小,[width, height]
         * @param {Int} pointerOffset 箭头的偏移
         * @private
         * @return {Object} 计算得到的结果
         * @example 
         * 返回的结果格式为
         * {
         *       top0: tt + th + ph,
         *       bottom0: tt - bh - ph,
         *       left0: tl + tw + ph,
         *       right0: tl - bw - ph,
         *       
         *       top1: tt + th / 2 - pw,
         *       bottom1: tt + th / 2 - bw + pw,
         *       left1: tl + tw / 2- pw,
         *       right1: tl + tw / 2 - bw + pw
         *   }
         */
        _calculateBubblePosition: function(target, pointerSize, pointerOffset){
            var container = this._container,
                targetPos = $D.getClientXY(target);
            var bw = $D.getOffsetWidth(container), bh = $D.getOffsetHeight(container),
                tw = $D.getWidth(target), th = $D.getHeight(target),
                tl = targetPos[0], tt = targetPos[1],
                pw = pointerOffset + (pointerSize[0] / 2), ph = pointerSize[1];
            return {
                top0: tt + th + ph,
                bottom0: tt - bh - ph,
                left0: tl + tw + ph,
                right0: tl - bw - ph,
                
                top1: tt + th / 2 - pw,
                bottom1: tt + th / 2 - bh + pw,
                left1: tl + tw / 2- pw,
                right1: tl + tw / 2 - bw + pw
            };
        },
        /**
         * 检查箭头的位置参参数是否合法
         * @private
         * @param {String} position 位置参数
         */
        _checkPointerPosition: function(position){
            var posArr = position.split(' ');
            var lrRegex = /left|right/,
                tbRegex = /top|bottom/;
            if(tbRegex.test(posArr[0]) && lrRegex.test(posArr[1])){
                return true;
            }else if(lrRegex.test(posArr[0]) && tbRegex.test(posArr[1])){
                return true;
            }
            return false;
        }
        
    });

});

/**
 * 富文本模块
 * @author azrael
 * 2011-5-16
 */
;Jx().$package(function (J) {
    var packageContext=this,
    $E = J.event, $D = J.dom, $B = J.browser;
/**
 * @class BaseEditor
 * 基本的富文本编辑器
 * @param {Object} option
 * @description
 * BaseEditor只处理编辑器自身的逻辑
 * 保存当前光标位置, 防止插入到页面其他地方
 * 
 * 富文本的扩展功能如设置字体样式/工具条等在RichEditor实现
 * @see J.ui.RichEditor
 * @example 
 * option = {
 *  appendTo: {HTMLElement} //富文本的容器
 *  className: {String},
 *  richClassName: {String},
 *  textClassName: {String},
 *  keepCursor: {Boolean} default: false //是否保存光标位置, 因为要进行保存选区和还原, 如果不关心光标位置, 则设置为false
 *  brNewline: {Boolean} default: false //使用统一使用br标签进行换行 
 *  clearNode: {Boolean} default: false //是否要对粘贴或拖拽进输入框的内容进行过滤, NOTE: opera只支持 ctrl+v 粘贴进来的内容
 *  nodeFilter: {Function} default: null //clearNode时过滤节点的函数, return true则不过滤该节点, 参数为 HTMLElement
 * }
 */
var BaseEditor = new J.Class(
{
    /**
     * 初始化代码
     */
    init: function(option){
        if(!option.appendTo){
            throw new Error('BaseEditor: appendTo is undefined.');
        }
        this.option = {
            keepCursor: option.keepCursor || false,
            brNewline: option.brNewline || false,
            clearNode: option.clearNode || false,
            nodeFilter: option.nodeFilter || null
        }
        var className = option.className || 'rich_editor'
        var container = this._container = $D.node('div', {
            'class': className
        });
        var divArea = this._divArea = $D.node('div', {
            'class': option.richClassName || (className + '_div')
        });
        var textArea = this._textArea = $D.node('textarea', {
            'class': option.textClassName || (className + '_text')
        });
        container.appendChild(divArea);
        container.appendChild(textArea);
        option.appendTo.appendChild(container);
        
        this.setState(true);
        this.clear();
        
        var context = this;
        
        // 私有方法
        this._private = {
            startTimeoutSaveRange : function(timeout){
                this.clearTimeoutSaveRange();
                this._keyupTimer = window.setTimeout(this.timeoutSaveRange, timeout || 0);
            },
            timeoutSaveRange : function(){
                context.saveRange();
            },
            clearTimeoutSaveRange : function(){
                if(this._keyupTimer){
                    window.clearTimeout(this._keyupTimer);
                    this._keyupTimer = 0;
                }
            },
            startTimeoutClearNodes : function(timeout){
                this.clearTimeoutClearNodes();
                this._clearNodesTimer = window.setTimeout(this.timeoutClearNodes, timeout || 0);
            },
            timeoutClearNodes : function(){
                context.clearNodes();
            },
            clearTimeoutClearNodes : function(){
                if(this._clearNodesTimer){
                    window.clearTimeout(this._clearNodesTimer);
                    this._clearNodesTimer = 0;
                }
            }
        };
        
        $E.on(divArea, 'blur', J.bind(BaseEditor.observer.onBlur, context));
        $E.on(divArea, 'mouseup', J.bind(BaseEditor.observer.onMouseup, context));
        $E.on(divArea, 'drop', J.bind(BaseEditor.observer.onDrop, context));
        $E.on(divArea, 'paste', J.bind(BaseEditor.observer.onPaste, context));
        $E.on(divArea, 'keyup', J.bind(BaseEditor.observer.onKeyup, context));
        if($B.ie){
            $E.on(divArea, 'keydown', J.bind(BaseEditor.observer.onBackspaceKeydown, context));
        }
        if($B.adobeAir){//air需要用keyup来监听ctrl+v
            $E.on(divArea, 'keyup', J.bind(BaseEditor.observer.onAdobeAirKeyup, context));
        }
        if(J.platform.linux && $B.firefox){
            //1. keydown事件在ubuntu的firefox用了中文输入法时不会触发
            $E.on(divArea, 'keypress', J.bind(BaseEditor.observer.onLinuxKeypress, context));
        }else if(J.platform.win && $B.opera){
            //1. windows的 opera的keydown事件无法阻止默认行为, 另外window的opera的 ctrl+ v的keyCode 是86
            //ubuntu的opera的ctrl+v的keyCode是118...
            $E.on(divArea, 'keypress', J.bind(BaseEditor.observer.onKeydown, context));
        }else {
            $E.on(divArea, 'keydown', J.bind(BaseEditor.observer.onKeydown, context));
        }
        $E.addObserver(this, 'Paste', J.bind(BaseEditor.observer.onEditorPaste, context));
        
    },
    /**
     * 返回是否启用了富文本编辑功能
     * @return {Boolean}
     */
    isEnable: function(){
        return this._isEnable;
    },
    /**
     * 设置是否启用富文本
     * @param {Boolean} state
     */
    setState: function(state){
        this._isEnable = state;
        var textArea = this._textArea;
        var divArea = this._divArea;
        if(state){
            $D.show(divArea);
            $D.hide(textArea);
            textArea.readonly = true;
            divArea.setAttribute('contentEditable', true);
        }else{
            $D.hide(divArea);
            $D.show(textArea);
            textArea.readonly = false;
            divArea.setAttribute('contentEditable', false);
        }
    },
    /**
     * 指示编辑框是否可编辑
     * @return {Boolean}
     */
    isEditable: function(){
        return this._isEditable;
    },
    /**
     * 设置是否可编辑, true 可编辑, false 只读
     * @param {Boolean} isEditable
     */
    setEditable: function(isEditable){ 
        this._isEditable = isEditable;
        if(this._isEnable){
            this._editArea.setAttribute('contenteditable', isEditable);
        }else{
            this.textArea.readonly = !isEditable;
        }
    },
    /**
     * 销毁
     */
    destory: function(){
        $E.off(divArea, 'focus');
        $E.off(divArea, 'blur');
        $E.off(divArea, 'mousedown');
        $E.off(divArea, 'mouseup');
        $E.off(divArea, 'keyup');
        $E.off(divArea, 'paste');
        $E.off(divArea, 'drop');
        $E.off(divArea, 'keypress');
        $E.off(divArea, 'keydown');
            
        this.setState(false);
        this._container.parentNode.removeChild(this._container);
        for (var p in this) {
            if (this.hasOwnProperty(p)) {
                delete this[p];
            }
        }
    },
    /**
     * 返回编辑区的html
     * @return {String}
     */
    getHtml: function(){
        return this._divArea.innerHTML;
    },
    /**
     * 设置编辑区的内容
     * @param {String} html
     */
    setHtml: function(html){
        this._divArea.innerHTML = html;
    },
    /**
     * 清空编辑器 
     */
    clear: function(){
        if(this._isEnable){
            if(this.option.keepCursor){
                this.saveRange(true);
            }
            if($B.ie){
                this.setHtml('');
            }else{
                this.setHtml('<br/>');
            }
        }else{
            this.setText('');
        }
    },
    /**
     * 设置纯文本输入框的内容
     * @param {String} text
     */
    setText: function(text){
        this._textArea.value = text;
    },
    /**
     * 获取纯文本框的内容
     * NOTE: 如果要取得富文本里的纯文本内容, 请先调用save方法
     * @see save
     * @return {String}
     */
    getText: function(){
        return this._textArea.value;
    },
    /**
     * 判断输入框内容是否是空的
     * @param {Boolean} 
     */
    isEmpty: function(){
        if(this._isEnable){
            var html = this.getHtml();
            if(html === ''){
                return true;
            }else if(!$B.ie && html.toLowerCase() === '<br>'){
                return true;
            }else{
                return false;
            }
        }else{
            var text = this.getText();
            if(text === ''){
                return true;
            }else{
                return false;
            }
        }
    },
    /**
     * 
     */
    focus: function(){
        if(this._isEnable){
            this._divArea.focus();
            if(this.option.keepCursor){
                this.restoreRange();
            }
        }else{
            this._textArea.focus();
        }
    },
    /**
     * 
     */
    blur: function(){
        if(this._isEnable){
            this._divArea.blur();
        }else{
            this._textArea.blur();
        }
    },
    /**
     * 把编辑区的内容保存到文本框
     * NOTE: 这里只是简单的转换, 子类最好根据需要重写该方法
     */
    save: function(){
        this.setText(this.getHtml());
    },
    /**
     * 把纯文本框里的文本还原到富文本输入框
     * NOTE: 这里只是简单的转换, 子类最好根据需要重写该方法
     */
    restore: function(){
        this.setHtml(this.getText());
    },
    /**
     * 获取输入框中的选中区
     * @return {Range}, null
     */
    getRange: function(){
        return BaseEditor.getRange(this._divArea);
    },
    /**
     * 保存当前光标位置
     * 如果调用时确认当前光标是在输入框中, 不执行检测会节约些许性能
     * @param {Boolean} checkRange 指示是否检查range是否在文本框中
     * 
     */
    saveRange: function(checkRange){
        var lastRange = checkRange ? this.getRange() : BaseEditor.getRange();
        if(!lastRange){
            return;
        }
        this._lastRange = lastRange;
//        if(lastRange.getBookmark){// for ie
//            this._lastBookmark = lastRange.getBookmark();
//        }
    },
    /**
     * 还原保存的光标位置
     * NOTE: 调用时需确保光标是在输入框中
     */
    restoreRange: function(){
        if(this._lastRange){
            var selection = BaseEditor.getSelection();
            if(selection.addRange){
                /*
                 * 对于高级浏览器, 直接把原来的range添加到selection就可以还原选区了
                 */
                selection.removeAllRanges();
                selection.addRange(this._lastRange);
            }else{//ie
                //NOTE: ie还可以使用其专有的bookmark来还原, 
                //但是如果在输入框以外的地方选中了文字, 偶尔会出现还原失败的情况
                /*if(this._lastBookmark){ //ie 
                /*
                 * 这里的原理是:
                 * 1. 先把保存lastRange的bookmark
                 * 2. 把新的range的选中位置移动到上次保存的bookmark
                 * 3. 选中该range就能把上次保存的选区还原了
                 *
                    var range = BaseEditor.getRange();
                    if(range){
                        range.moveToBookmark(this._lastBookmark);
                        range.select();
                    }
                }*/
                /*
                 * 这里的原理是:
                 * 1. 先把保存lastRange, 如"ABCDEFG"中的"CDE"
                 * 2. 把新的range的结尾移动到lastRange的开头(即"C"的左边),
                 * 3. 然后调用 collapse(false)把光标的插入点移动到range的结尾
                 * 也就是把range的开头和结尾合并在一起, 因为新的range的开头都是在内容的起点
                 * 不这样处理的话, 调用select之后会选中"AB"(即选中"C"之前的所有内容)
                 * 4. 把range的结尾移动到lastRange的结尾(即"E"的右边)
                 * 5. 选中该range就能把上次保存的选区还原了(即选中"CDE")
                 */
                var range = BaseEditor.getRange();
                if(range){
                    range.setEndPoint('EndToStart', this._lastRange);
                    range.collapse(false);
                    range.setEndPoint('EndToEnd', this._lastRange);
                    range.select();
                }
            }
        }
    },
    /**
     * 在光标处插入一段html
     * NOTE:调用时需确保光标在输入框中
     * @param {String} html
     */
    insertHtml: function(html){
        if(html === ''){
            return;
        }
        var range = BaseEditor.getRange();
        if(range.pasteHTML){//ie, ie9 也在这里
//            html += '<img style="display:inline;width:1px;height:1px;">';
            range.pasteHTML(html);
            range.collapse(false);
            range.select();
        }else if(range.createContextualFragment){//ie9竟然不支持这个方法
		    // 使用img标签是因为img是行内元素的同时, 又能设置宽高占位
            html += '<img style="display:inline;width:1px;height:1px;">';
            var fragment = range.createContextualFragment(html);
            var lastNode = fragment.lastChild;
			//如果已经选中了内容, 先把选中的删除
            range.deleteContents();
            range.insertNode(fragment);
            //插入后把开始和结束位置都放到lastNode后面, 然后添加到selection
            range.setEndAfter(lastNode);
            range.setStartAfter(lastNode);
            var selection = BaseEditor.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            //把光标滚动到可视区
//            if(lastNode.nodeType === 1){
//				  ff开了firbug的时候, 会导致样式错乱, 换用scrollTop的方式
//                lastNode.scrollIntoView();
//            }
            var divArea = this._divArea;
            var pos = $D.getRelativeXY(lastNode, divArea);
            divArea.scrollTop = pos[1] < divArea.scrollHeight ? divArea.scrollHeight : pos[1];
            // 删除附加的节点, 这里只能这样删, chrome直接remove节点会导致光标消失掉
            if(!$B.opera){//TODO opera的光标还原有问题, 要想办法解决
                document.execCommand('Delete', false, null);
            }
            if(BaseEditor.contains(divArea, lastNode)){//for opera
                divArea.removeChild(lastNode);
            }
        }
        if(this.option.keepCursor){
            //插入后把最后的range设置为刚刚的插入点
            this.saveRange();
        }
    },
    /**
     * 往纯文本框插入一段文本
     * @param {String} text
     */
    insertText: function(text){
        if(text === ''){
            return;
        }
        var textArea = this._textArea;
        if($B.ie){
            var range = BaseEditor.getRange();
            if(range){
                range.text = text;
            }else{
                textArea.value += text;
            }
        }else{
            if(J.isUndefined(textArea.selectionStart)){
                textArea.value += text;
            }else{
                var value = textArea.value,
                    start = textArea.selectionStart, 
                    end = textArea.selectionEnd,
                    cursorPoint = start + text.length;
                textArea.value = value.substring(0, start) + text + value.substring(end);
                textArea.setSelectionRange(cursorPoint, cursorPoint);
            };
            
        }
    },
    /**
     * 将输入框里的内容在光标处换行
     * NOTE: 执行该方法前, 需保证光标已经在输入框
     */
    newline: function(){
        if(this._isEnable){
            this.insertHtml('<br/>');
        }else{
            this.insertText('\n');
        }
    },
    /**
     * 清理节点, 把除了br,img之外的节点都清理掉
     */
    clearNodes: function(){
        /* 
         * 这里的原理是:
         * 倒序遍历输入框的直接子节点
         * 1. 如果是文本节点则跳过
         * 2. 如果是element,且不是br,则用其包含的文本保存替换该节点
         * 3. 如果是其他, 如comment,则移除
         * 最后把光标位置还原
         */
        var divArea = this._divArea;
        var text, textNode, cursorNode;
        var childNodes = divArea.childNodes;

        for(var c = childNodes.length - 1, node; c >= 0; c--){
            node = childNodes[c];
            if(node.nodeType === 3){//text
                
            }else if(node.nodeType === 1){//element
                if(node.nodeName !== 'BR'){
                    if(this.option.nodeFilter && this.option.nodeFilter(node)){
                        //nodeFilter返回true则不过滤
                    }else{
                        text = node.textContent || node.innerText || '';//innerText for ie
                        if(text !== ''){
                            textNode = document.createTextNode(text);
                            if(!cursorNode){
                                cursorNode = textNode;
                            }
                            divArea.replaceChild(textNode, node);
                        }else{
                            divArea.removeChild(node);
                        }
                    }
                    
                }
            }else{//comment etc.
                divArea.removeChild(node);
            }
        }
        if(cursorNode){//清除多余标签后还原光标位置
            var selection = BaseEditor.getSelection();
            if(selection.extend){//ff, chrome 要先扩展选区, 然后把选区开头合并到结尾
                //NOTE: chrome 拷贝某些html会有问题
                selection.extend(cursorNode, cursorNode.length);
                selection.collapseToEnd();
            }
        }
    }
});

BaseEditor.observer = {
    onBlur: function(e){
        //本来想在blur的时候保存range, 但是执行这个事件的时候,
        //光标已经不在输入框了, 也许ie可以用onfocusout事件来做
//        this.saveRange();
        this._private.clearTimeoutSaveRange();
    },
    onMouseup: function(e){
        if(this.option.keepCursor){
            this.saveRange();
        }
    },
    onLinuxKeypress: function(e){//only for linux firefox
        var keyCode = Number(e.keyCode), charCode = Number(e.charCode);
        var altKey = e.altKey, ctrlKey = e.ctrlKey, shiftKey = e.shiftKey;
        if(charCode === 118 && (ctrlKey && !altKey && !shiftKey)){// ctrl + v
            $E.notifyObservers(this, 'Paste', e);
        }else if(keyCode === 13 && this.option.brNewline){//enter no matter ctrl or not
            e.preventDefault();
            this.newline();
        }
    },
    onAdobeAirKeyup: function(e){//only for air ctrl+v
        var keyCode = Number(e.keyCode);
        var altKey = e.altKey, ctrlKey = e.ctrlKey, shiftKey = e.shiftKey;
        if(keyCode === 86 && (ctrlKey && !altKey && !shiftKey)){// ctrl + v
            $E.notifyObservers(this, 'Paste', e);
        }
    },
    onBackspaceKeydown: function(e){//for ie
        var keyCode = Number(e.keyCode);
        var altKey = e.altKey, ctrlKey = e.ctrlKey, shiftKey = e.shiftKey;
        if(keyCode === 8 && (!ctrlKey && !altKey && !shiftKey)){//BackSpace
            //ie 在输入框中选中了图片后按回退键, 跟点浏览器的后退按钮一个效果 >_<
            var selection = BaseEditor.getSelection();
            if (selection.type.toLowerCase() === 'control') {
                e.preventDefault();
                selection.clear();
            }
        }
    },
    onKeydown: function(e){//normal browser
        var keyCode = Number(e.keyCode);
        var altKey = e.altKey, ctrlKey = e.ctrlKey, shiftKey = e.shiftKey;
        if(keyCode === 86 && (ctrlKey && !altKey && !shiftKey)){// ctrl + v
            //1. opera没有onpaste事件, 因此只能监控ctrl+v的粘贴
            //2. ie剪贴板里有图片时, 监听不到onpaste事件
            $E.notifyObservers(this, 'Paste', e);
        }else if(keyCode === 13 && this.option.brNewline){//enter no matter ctrl or not
            e.preventDefault();
            this.newline();
        }
    },
    onKeyup: function(e){
        //TODO 判断如果是某些按键(如空格)就立即保存
        var keyCode = Number(e.keyCode);
        if(keyCode === 16 || keyCode === 17 || keyCode === 18){
            //排除掉单纯的shift,ctrl,alt键
        }else if(this.option.keepCursor){
            //延时进行保存, 避免连续输入文字的时候做了太多次操作
            this._private.startTimeoutSaveRange(100);
        }
    },
    onPaste: function(e){
        if(this.option.clearNode){
            //这里延时200毫秒, 如果onEditorPaste执行的时候也过滤的话,就可以取消这次了
            this._private.startTimeoutClearNodes(200);
        }
    },
    onDrop: function(e){
        if(this.option.clearNode){
            //因为发出这个事件的时候, 内容还没有粘贴到输入框, 所以要延时
            this._private.startTimeoutClearNodes();
        }
    },
    onEditorPaste: function(e){
        if($E.notifyObservers(this, 'EditorPaste', e)){//如果EditorPaste的监听者返回了false, 则不进行过滤处理
            if(this.option.clearNode){
                //因为发出这个事件的时候, 内容还没有粘贴到输入框, 所以要延时
                this._private.startTimeoutClearNodes();
            }
        }
    }
    
};

/**
 * 获取当前页面的selection对象
 * @return {Selection}
 */
BaseEditor.getSelection = function() {
    //先判断ie专有的, 因为ie9对range的支持不完全啊>_<
    return (document.selection) ? document.selection : window.getSelection();
};

/**
 * 获取选中区, 如果传入了container, 则返回container的range
 * @param {HTMLElement} container, 目标range的容器, 可选
 * @return {Range}, null
 */
BaseEditor.getRange = function(container) {
    var selection = BaseEditor.getSelection();
    if (!selection) {
        return null;
    }
    var range = selection.getRangeAt ? (selection.rangeCount ? selection
                .getRangeAt(0) : null) : selection.createRange();
    if(!range){
        return null;
    }
    if(container){
        if(BaseEditor.containsRange(container, range)){
            return range;
        }else{
            return null;
        }
    }else{
        return range;
    }
    
};

/**
 * 判断一个节点是否是某个父节点的子节点, 
 * 默认不包含parent === child的情况
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 * @param {Boolean} containSelf 指示是否可包含parent等于child的情况
 * @return {Boolean} 包含则返回true
 */
BaseEditor.contains = function(parent, child, containSelf){
    if(!containSelf && parent === child){
        return false;
    }
    if(parent.compareDocumentPosition){//w3c
        var res = parent.compareDocumentPosition(child);
        if(res == 20 || res == 0){
            return true;
        }
    }else{
        if(parent.contains(child)){//ie
            return true;
        }
    }
    return false;
};
/**
 * 判断一个range是否被包含在container中
 * @param {HTMLElement} container
 * @param {Range} range
 * @return {Boolean}
 */
BaseEditor.containsRange = function(container, range){
    var rangeParent = range.commonAncestorContainer || (range.parentElement && range.parentElement()) || null;
    if(rangeParent){
        return BaseEditor.contains(container, rangeParent, true);
    }
    return false;
};

/**
 * @class RichEditor
 * 富文本编辑器
 * @param {Object} option
 * @description
 * RichEditor实现了富文本的扩展功能如设置字体样式/工具条等
 * 包装了BaseEditor
 * @see J.ui.BaseEditor
 * @example 
 * option = {
 *  appendTo: {HTMLElement} //富文本的容器
 *  keepCursor: {Boolean} default: false //是否保存光标位置, 因为要进行保存选区和还原, 如果不关心光标位置, 则设置为false
 *  brNewline: {Boolean} default: false //使用统一使用br标签进行换行 
 *  clearNode: {Boolean} default: false //是否要对粘贴或拖拽进输入框的内容进行过滤, NOTE: opera只支持 ctrl+v 粘贴进来的内容
 * }
 */
var RichEditor = new J.Class({ extend: BaseEditor}, 
{
    init: function(option){
        var context = this;
        /**
         * 简化对父类方法的调用,每个子类都要有一个
         * @param func,String 方法名称
         * @ignore
         */
        this.callSuper = function(func){
            var slice = Array.prototype.slice;
            var a = slice.call(arguments, 1);
            RichEditor.superClass[func].apply(context, a.concat(slice.call(arguments)));
        };
        
        //调用父层初始化方法
        this.callSuper("init",option);
    }
    //TODO 未完成
});

J.ui.BaseEditor = BaseEditor;
J.ui.RichEditor = RichEditor;

// end
});
/**	
 * JET (Javascript Extension Tools) 
 * Copyright (c) 2009, All rights reserved.
 *
 * @fileOverview Jx!
 * @version	1.0
 * @author	Kinvix(<a href="mailto:Kinvix@gmail.com">Kinvix@gmail.com</a>)
 * @description 
 * 
 */

/**	
 * @description
 * Package: jet.console
 *
 * Need package:
 * jet.core.js
 * jet.string.js
 * jet.http.js
 * 
 */


/**
 * 10.[Browser part]: console 控制台
 */
Jx().$package(function(J){
	var $ = J.dom.id,
		$D = J.dom,
		$E = J.event,
		$S = J.string,
		$H = J.http;
		
	
	var topNamespace = this,
		query = J.string.mapQuery(window.location.search);
	var _open=window.open;
	var open=function(sURL, sName, sFeatures, bReplace){
		if(sName == undefined){
			sName="_blank";
		};
		if(sFeatures == undefined){
			sFeatures="";
		};
		if(bReplace == undefined){
			bReplace=false;
		};
		
		var win=_open(sURL, sName, sFeatures, bReplace);
		if(!win){
			J.out("你的机器上有软件拦截了弹出窗口");
			return false;
		}
		
		return true;
	};
	window.open = open;
	/**
	 * 日志对象
	 * @author tealin
	 * @class Log
	 * @name Log
	 */
	var Log = new J.Class(
		/**
		 * @lends Log
		 */
		{
		_defaultType : 3,
		_defaultTag : 'information',
		_defaultTemplate : '<%=msg%>(<%=type%>#<%=tag%>@<%=time%>)',
		/**
		 * 信息类型常量，一共五种类型:<br/><br/>
		 * PROFILE 	: 0 <br/>
		 * WARNING 	: 1 <br/>
		 * ERROR 	: 2 <br/>
		 * INFO 	: 3 <br/>
		 * DEBUG 	: 4 <br/>
		 * 
		 * @type Object
		 */
		TYPE : ['PROFILE' ,'WARNING', 'ERROR', 'INFO','DEBUG'],

		init : function(option){
			this.msg = option.msg||'';
			this.tag = option.tag||this._defaultTag;
			this.type = J.isUndefined(option.type)?this._defaultType:option.type;
			this.time = new Date().valueOf();
			this._template = option.template||this._defaultTemplate;
		},
//		setTemplate : function(template){
//			this._template = template;
//			try{
//				this.toString();
//			}catch(e){
//				alert("格式错误!输入格式类似为:<%=msg%>(<%=type%>#<%=tag%>@<%=time%>)");
//			}
//		},
		/**
		 * 格式化输出
		 * @param {String} template 输出模版
		 * @param {Object} data 模版数据
		 * @param {Boolen} isEncode 是否转义
		 * @return {String} 输出字符串
		 */
		format : function(data,isEncode,template){
			template = template||this._template;
			if(isEncode){
				return $S.encodeHtml($S.template(template,data));
			}else{
				return $S.template(template,data);
			}
		},
		/**
		 * 格式化数据对象
		 * @return {Object} 数据对象
		 */
		parseOption : function(){
			var context = this;
			var option = {
				msg : context.msg,
				time : context.time,
				type : context.TYPE[context.type],
				tag : context.tag		
			}
			return option;
		},
		/**
		 * 普通输出函数
		 * @param {Boolen} isEncode 是否转义
		 * @return {String} 输出字符串
		 */
		toString : function(isEncode,template){
			return this.format(this.parseOption(),isEncode,template||this._template);
		}
	});
	
	
	
	
	
	J.config={
		debugLevel: 1
	};
	
	
	
	
	
	/**
	 * Jx 控制台，用于显示调试信息以及进行一些简单的脚本调试等操作。可以配合 J.debug J.runtime 来进行数据显示和调试.
	 * 
	 * @type console
	 * @namespace
	 * @name console
	 */
	J.console = {
		/**
		 * 在console里显示信息
		 * 
		 * @param {String} msg 信息
		 * @param {Number} type 信息类型
		 * 
		 * @example
		 * J.console.print("这里是提示信息",J.console.TYPE.ERROR)
		 */
//		print : function(msg, type){
//			if(J.console.log){
//				J.console.log((type === 4 ? (new Date() + ":") : "") + msg);
//			}
//		}
	};

	/**
	 * 数据监控和上报系统
	 * 
	 * @ignore
	 * @type J.Report
	 */
	J.Report = {
		/**
		 * 数据分析上报接口
		 * 
		 * @param {string} source 数据来源
		 * @param {number} type 数据返回结果,<br/> <br/>1 加载完成 <br/>2 加载失败 <br/>3 数据异常
		 *            无法解释/截断 <br/>4 速度超时 <br/>5 访问无权限 <br/> 对应的转义符是 %status%
		 * 
		 * @param {string} url 请求的数据路径
		 * @param {number} time 响应时间
		 * @ignore
		 */
		receive : J.emptyFunc,
	
		/**
		 * 添加监控规则,
		 * 
		 * @param {String} url 需要监控的url
		 * @param {String} reportUrl 出现异常后上报的地址 上报地址有几个变量替换 <br/>%status% 数据状态
		 *            <br/>%percent% 统计百分比 <br/>%url% 监听的url地址,自动encode
		 *            <br/>%fullUrl% 监听的完整的url地址，包括这个地址请求时所带 <br/>%source% js处理来源
		 *            <br/>%time% 请求花掉的时间 <br/>%scale% 比例,通常是指 1:n 其中的 n 就是 %scale%
		 * 
		 * <br/>
		 * @example
		 * J.Report.addRule("http://imgcache.qq.com/data2.js","http://imgcache.qq.com/ok?flag1=3234&flag2=%status%&1=%percent%&flag4=123456");
		 * @ignore
		 */
		addRule : J.emptyFunc
	};
	
	

	
	J.extend(J.console,
	/**
	 * @lends console
	 */
	{
		/**
		 * 是否进行了初始化
		 * 
		 * @type Boolean
		 */
		_isCreated : false,
		/**
		 * 日志记录最大数目
		 */
		_maxLength : 1000,
	
		/**
		 * console表现模板
		 * 
		 * @type String
		 */
		_html :    '<div id="ConsoleBoxHead" class="consoleBoxHead">\
						<a href="###" id="ConsoleCloseButton" class="consoleCloseButton" title="关闭">X</a>\
						<a href="###" id="ConsoleClearButton" class="consoleCloseButton" title="清除所有日志">cls</a>\
						<a href="###" id="ConsoleRefreshButton" class="consoleCloseButton" title="还原所有日志">r</a>\
						<a href="###" id="ConsoleHelpButton" class="consoleCloseButton" title="控制台帮助">H</a>\
						<h5 class="title" title="控制台">Console</h5>\
					</div>\
					<div id="consoleMain" class="consoleMain">\
						<ul id="ConsoleOutput" class="consoleOutput"></ul>\
					</div>\
					<div class="consoleInputBox">\
						&gt;<input id="ConsoleInput" class="consoleInput" title="请输入控制台指令或者Javascript语句..." />\
					</div>',
	
		/**
		 * 提示框是否打开了
		 * 
		 * @type Boolean
		 */
		_opened : false,
		
		//日志记录对象
		_log_record: [],
		
		_cmd_history:[],
		_cmd_last_index:0,
		/**
		 * 是否为自定义的控制台 
		 */
		isCustomConsole : true,
		_templateArr : ['<%=msg%>','<%=msg%>(<%=type%>#<%=tag%>@<%=time%>)'],
		_templateType :0,
	
		/**
		 * 样式类
		 * 
		 * @type
		 */
		_typeInfo : [["log_profile_type", "└"], ["log_warning_type", "!"], ["log_error_type", "x"], ["log_info_type", "i"],["log_debug_type", "√"]],
		TYPE : {
			PROFILE : 0,
			WARNING : 1,
			ERROR : 2,
			INFO : 3,
			DEBUG : 4
		},
		/**
		 * 显示console
		 */
		show : function() {
			if (!this._isCreated) {
				this._create();
			}
			this._opened = true;
			
			this._main.style.display = "block";
			this.render();
			
				
			//输入焦点过来
			window.setTimeout(J.bind(this.focusCommandLine, this), 0);
		},
	
		/**
		 * 隐藏console
		 */
		hide : function(e) {
            e && e.preventDefault();
			this.clear();
			J.console._main.style.display = "none";
			J.console._opened = false;
			
		},
		
		/**
		 * 开启console
		 */
		enable : function() {
			J.option.console = true;
			this.show();
			
		},
		
		/**
		 * 关闭console
		 */
		disable : function() {
			J.option.console = false;
			this.hide();
			
		},
	
		/**
		 * 初始化控制台
		 * 
		 * @ignore
		 */
		_init : function() {
			// 快捷键开启
			$E.on(document, "keydown", J.bind(this.handleDocumentKeydown, this));
			if (J.option.console) {
				this.show();
			}
			this.setToDebug();
			//this.out("Welcome to JET(Javascript Extension Tools)...");
		},
		/**
		 * 建立控制台面板,初始化DOM事件监听
		 */
		_create:function(){
			
			
			$H.loadCss(J.path+"assets/jet.css");
			this._main = document.createElement("div");
			
			this._main.id="JxConsole";
			this._main.style.display="none";
			this._main.className = "consoleBox";
			this._main.innerHTML = this._html;
			window.document.body.appendChild(this._main);
			var w = $D.getClientWidth(),
				h = $D.getClientHeight(),
				w1 = 300,
				h1 = 310,
				l = w - 210 - w1,
				t = h - 50 - h1; 
			$D.setStyle(this._main,"top",t+"px");
			$D.setStyle(this._main,"left",l+"px");
			
			
			this._headEl = $("ConsoleBoxHead");
			this._inputEl = $("ConsoleInput");
			this._closeButtonEl = $("ConsoleCloseButton");
			this._clsButtonEl = $("ConsoleClearButton");
			this._refreshButtonEl = $("ConsoleRefreshButton");
			this._helpButtonEl = $("ConsoleHelpButton");
			this._outputEl = $("ConsoleOutput");
			this._consoleMainEl = $("consoleMain");
			if(J.ui.Drag){
				new J.ui.Drag(this._headEl,this._main);
			}
	
			// 绑定方法
			$E.on(this._inputEl, "keyup", J.bind(this.onInputKeyup,this));
			$E.on(this._clsButtonEl, "click", J.bind(this.clear,this));
			$E.on(this._refreshButtonEl, "click", J.bind(this.refresh,this));
			$E.on(this._helpButtonEl, "click", J.bind(this.help,this));
			$E.on(this._closeButtonEl, "click", J.bind(this.hide,this));
			
			
			//mobileSafari下控制台滚动条
			var options = {
				hScrollbar: true,
				vScrollbar: true,
				checkDOMChanges: false,
				desktopCompatibility: true
			};
			
			if(J.browser.mobileSafari){
				if(J.ui.iScroll && !this.consoleScroller){
					this.consoleScroller = new J.ui.iScroll(this._outputEl, options);
					//$D.setStyle(this._outputEl,"overflow","");
					J.debug("!!!!2", "console");
				}
			}

			
			this._isCreated = true;
			
			
			
			
		},
		
		handleDocumentKeydown: function(e){
			switch(e.keyCode){
				case 192:	// `~键:192
					if(e.ctrlKey&&e.shiftKey){
						
						this.toggleShow();
						e.preventDefault();
					}
					break;
				default: break;
			}
		},
		
		focusCommandLine: function(){
			this._inputEl.focus();
		},
		/**
		 * 控制台开关
		 */
		toggleShow:function(){
			if(this._opened){
				this.hide();
				
				//J.option.debug = J.DEBUG.NO_DEBUG;
			}else{
				this.show();
				//J.option.debug = J.DEBUG.SHOW_ALL;
				
			}
			
		},
		
		/**
		 * 控制台记录信息
		 * 
		 * @param {String} msg 要输出的信息
		 * @param {Number} type 要输出的信息的类型，可选项
		 * @return {String} 返回要输出的信息
		 */
		outConsoleShow:function(msg, type){
			this.outConsole(msg, type);
			
			if ((!this._opened) && J.option.console) {
				this.show();
			}
		},
		
		/**
		 * 向控制台输出信息并显示
		 * 
		 * @param {String} msg 要输出的信息
		 * @param {Number} type 要输出的信息的类型，可选项
		 * @return {String} 返回要输出的信息
		 */
		outConsole: function(log) {
			if(this._opened){
				var _item = document.createElement("li");
				this._outputEl.appendChild(_item);
				
				var _ti = J.console._typeInfo[log.type] || J.console._typeInfo[0];
				var template = this._templateArr[this._templateType];
				_item.className = _ti[0];
				_item.innerHTML = '<div class="log_icon" title="'+_ti[0]+'">' + _ti[1] + '</div><div class="log_text">' + log.toString(true,template)+'</div>';
				if(this.consoleScroller){
					this.consoleScroller.refresh();
				}
				this._consoleMainEl.scrollTop = this._consoleMainEl.scrollHeight;
			}
		},
		/**
		 * 往控制台打印
		 * @param {String} html 打印的信息
		 */
		print : function(html){
			var _item = document.createElement("li");
			this._outputEl.appendChild(_item);
			_item.innerHTML = html;
			this._consoleMainEl.scrollTop = this._consoleMainEl.scrollHeight;
		},
		/**
		 * 向控制台输出信息的方法,通过url里面的consolefilter参数可以控制tag输出
		 * 
		 * @param {String} msg 要输出的信息
		 * @param {String} tag 自定义标签
		 * @param {Number} type 要输出的信息的类型，可选项
		 * @return {String} 返回要输出的信息
		 */
		out:function(msg,tag,type){	
			//type = J.isUndefined(type)?0:type;
			var template = this._templateArr[this._templateType];
			var log = new Log({
						msg : msg,
						tag : tag,
						type : type
					});
			this.logRecord(log);
			//如果需要过滤显示的话需要特殊处理
			if(query&&query.consolefilter){
				var consolefilter = query.consolefilter;
				if(log.tag == consolefilter){
					if(!this.isCustomConsole){
						topNamespace.console.log(log.toString(false,template));
					}else{
						this.outConsole(log);
					}
				}
			}else{
				if(!this.isCustomConsole){
					topNamespace.console.log(log.toString(false,template));
				}else{
					this.outConsole(log);
				}
			}
		},
		/**
		 * 关键日志正常输出
		 * @param {String} msg 输出的日志
		 * @tag {String} tag 日志标志,默认为system
		 */

		profile : function(msg,tag){
			var type = 0;
			tag = tag||"system";
			this.out(msg,tag,type);
		},
		/**
		 * 关键日志警告输出
		 * @param {String} msg 输出的日志
		 * @tag {String} tag 日志标志,默认为system
		 */

		warn : function(msg,tag){
			var type = 1;
			this.out(msg,tag,type);
		},
		/**
		 * 关键日志错误输出
		 * @param {String} msg 输出的日志
		 * @tag {String} tag 日志标志,默认为system
		 */

		error : function(msg,tag){
			var type = 2;
			this.out(msg,tag,type);
		},
		/**
		 * 日志灌水输出
		 * @param {String} msg 输出的日志
		 * @tag {String} tag 日志标志,默认为system
		 */

		info : function(msg,tag){
			var type = 3;
			this.out(msg,tag,type);
		},
		/**
		 * 日志调试输出
		 * @param {String} msg 输出的日志
		 * @tag {String} tag 日志标志,默认为system
		 */

		debug : function(msg,tag){
			var type = 4;
			this.out(msg,tag,type);
		},
		/**
		 * 设置debug类型,是firebug or custom
		 */
		setToDebug:function(){
			if(query.console&&query.console == "firebug"){
				this.isCustomConsole = false;
			}else{
				this.isCustomConsole = true;
			}
		},
		/**
		 * 关闭out输出
		 */
		setToNoDebug:function(){
			this.out = J.emptyFunc;
		},
		/**
		 * log记录,当有query.console的时候,不限记录数量,没有时限制最大数量
		 * @param {Log} log 日志对象
		 */
		logRecord: function(log){
			this._log_record.push(log);
			if(!query.console){
				if(this._log_record.length>this._maxLength){
					this._log_record.shift();	
				}
			}
		},
		/**
		 * 设置模版类型
		 * @param {Int} temp 模版类型
		 */
		setTemplate : function(temp){
			if(this._templateArr[temp]){
				this._templateType = temp;
			}
		},
		/**
		 * 过滤输出,支持正则,不区分大小写
		 * @param {RegExp} s 过滤的字符活正则
		 */
		filter : function(s){
			var reg = new RegExp(s,"i");
			var result = [];
			var logArr = this._log_record;
			J.array.forEach(logArr,function(log){
				var logStr = log.toString(true);
				if(reg.test(logStr)){
					result.push(log);
				}
			});
			return result;
		},
		/**
		 * 过滤type
		 * @param {Log[]} logArr 日志数组
		 * @param {Int} type 类型
		 * @return {Log[]} logArr 匹配的日志数组
		 */
		filterByType : function(logArr,type){
			var result = [];
			logArr = logArr||[];
			J.array.forEach(logArr,function(log){
				var isFound = false;
				J.array.forEach(type,function(i){
					if(log.type == i){
						isFound = true;
					}
				});
				if(isFound){
					result.push(log);
				}
			});
			return result;
		},
		/**
		 * 过滤tag
		 * @param {Log[]} logArr 日志数组
		 * @param {String} tag 类型
		 * @return {Log[]} logArr 匹配的日志数组
		 */
		filterByTag : function(logArr,tag){
			var result = [];
			logArr = logArr||[];
			J.array.forEach(logArr,function(log){
				var isFound = false;
				J.array.forEach(tag,function(i){
					if(log.tag == i){
						isFound = true;
					}
				});
				if(isFound){
					result.push(log);
				}
			});
			return result;
		},
		/**
		 * 过滤Msg
		 * @param {Log[]} logArr 日志数组
		 * @param {String} msg 类型
		 * @return {Log[]} logArr 匹配的日志数组
		 */
		filterByMsg : function(logArr,msg){
			var result = [];
			logArr = logArr||[];
			J.array.forEach(logArr,function(log){
				var isFound = false;
				J.array.forEach(msg,function(i){
					if(log.msg.indexOf(i)>-1){
						isFound = true;
					}
				});
				if(isFound){
					result.push(log);
				}
			});
			return result;
		},
		/**
		 * 获取日志报告
		 * @author tealin
		 * @param {Int|Array} type 需要报告的类型,多选时用数组表示
		 * @param {String|Array} tag 需要报告的标志,多选时用数组表示
		 * @param {String|Array} msg 需要报告筛选的信息,多选时用数组表示
		 * @return {String} log 日志对象
		 */
		getReport : function(type,tag,msg){
			var result = [];
			var logArr = this._log_record;
			var context = this;
			
			//格式化各个参数
			if(!type||type == ""){
				type = false;
			}else if(!J.isArray(type)){
				type = [type];
			}
			if(!tag||tag == ""){
				tag = false;
			}else if(!J.isArray(tag)){
				tag = [tag];
			}
			if(!msg||msg == ""){
				msg = false;
			}else if(!J.isArray(msg)){
				msg = [msg];
			}
			if(type){
				logArr = this.filterByType(logArr,type);
			}
			if(tag){
				logArr = this.filterByTag(logArr,tag);
			}
			if(msg){
				logArr = this.filterByMsg(logArr,msg);
			}
			J.array.forEach(logArr,function(log){
				result.push(log.toString(false,context._templateArr[1]));
				
			});
			return result.join(",");
		},
		/**
		 * 渲染log列表
		 * @author tealin
		 */
		render : function(logArr){
			logArr = logArr||this._log_record;
			var context = this;
			//避免重复
			context.clear();
			J.array.forEach(logArr,function(log){
				context.outConsole(log);
			});
		},
		/**
		 * 清空log
		 */
		clear : function(e) {
            e && e.preventDefault();
			J.console._outputEl.innerHTML = "";
		},
		/**
		 * 刷新控制台
		 */
		refresh : function(e){
            e && e.preventDefault();
			this.clear();
			this.render();
		},
		/**
		 * 显示帮助
		 */
		help : function(e){
            e && e.preventDefault();
			var _rv = "&lt;&lt; Console Help &gt;&gt;<br/>\
								help|h  : 控制台帮助<br/>\
								clear|cls : 清空控制台输出<br/>\
								refresh|r : 刷新控制台输出<br/>\
								filter|f : 过滤控制台输出<br/>\
								setTemplate|s : 设置输出模版类型<br/>\
								hide  : 隐藏控制台，或者使用 Ctrl+Shift+`[~] 快捷键";
			this.print(_rv);
		},
		onInputKeyup : function(e){
			switch(e.keyCode){
				case 13://执行命令
					this._cmd_history.push(J.console._inputEl.value);
					this._cmd_last_index=this._cmd_history.length;
					this._execCommand(J.console._inputEl.value);
					break;
				case 38://上一命令
					if(this._cmd_history.length==0)return;
					var s="";
					if(this._cmd_last_index>0){
						this._cmd_last_index--;
						s=this._cmd_history[this._cmd_last_index];
					}else{
						this._cmd_last_index=-1;
					}
					J.console._inputEl.value=s;
					break;
				case 40://下一命令
					if(this._cmd_history.length==0)return;
					var s="";
					if(this._cmd_last_index<this._cmd_history.length-1){
						this._cmd_last_index++;
						s=this._cmd_history[this._cmd_last_index];
					}else{
						this._cmd_last_index=this._cmd_history.length;
					}
					J.console._inputEl.value=s;
					break;
				default:
					break;
			}
		},
		/**
		 * 执行命令
		 * @param {String} cmd 命令
		 */
		_execCommand : function(cmd) {
			// 控制台命令
			if(cmd == "help"||cmd == "h"){
				this.help();
			}else if(cmd == "clear"||cmd == "cls"){//清除控制台
				J.console.clear();
			}else if(cmd == "hide"){//隐藏控制台
				J.console.hide();
			}else if(cmd == "refresh"||cmd == "r"){
				this.refresh();
			}else if(new RegExp(/^(?:filter|f)(?:\(|\s+)(.+)(?:\)|\s*)$/i).test(cmd)){//过滤
				var filterCmd = RegExp.$1;
				var result = eval("this.filter('"+filterCmd+"')");
				if(result.length>0){
					this.render(result);
				}else{
					this.clear();
					this.out("NO RESULT!",1);
				}
			}else if(new RegExp(/^(?:setTemplate|s)(?:\(|\s+)(\d+)(?:\)|\s*)$/i).test(cmd)){
				var temp = parseInt(RegExp.$1);
				this.setTemplate(temp);
				this.refresh();
			}else{//执行js脚本
				this._execScript(cmd);
			}
			J.console._inputEl.value = "";
		},
		/**
		 * 执行js代码
		 * @param {String} cmd 代码
		 */
		_execScript : function(cmd){
			var _rv = '<span style="color:#ccff00">' + cmd + '</span><br/>';
			try {
				_rv += (eval(cmd) || "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")
				J.console.print(_rv, 0);
			} catch (e) {
				_rv += e.description;
				J.console.print(_rv, 1);
			}
		}
	});
	

	J.profile = J.console.profile;
	J.warn = J.console.warn;
	J.error = J.console.error;
	J.info = J.console.info;
	J.debug = J.console.debug;
	
	
	
	
		$E.onDomReady(function(){
				J.console._init();
				if(query.console == "true"){
					J.console=J.extend(J.console,{
						'profile':J.emptyFunc,
						'warn':J.emptyFunc,
						'error':J.emptyFunc,
						'info':J.emptyFunc,
						'debug':J.emptyFunc
					});
					J.console.show();
					
				}
		});
		if(query.console&&query.console == "firebug"){
			
			if(!topNamespace.console){
				// http://getfirebug.com/releases/lite/1.2/firebug-lite.js
				$H.loadScript(J.path+"firebug/firebug-lite.js",{
					onSuccess : function(){
						if(firebug){
							firebug.env.height = 220;
							// http://getfirebug.com/releases/lite/1.2/firebug-lite.css
							firebug.env.css = "../../source/firebug/firebug-lite.css";
							J.out("...控制台开启");
							J.out("...测试成功");
						}
						
					}
				});
			}
		}
	

	
	
	
	
	
	
	
	
	/**
	 * runtime处理工具静态类
	 * 
	 * @namespace runtime处理工具静态类
	 * @name runtime
	 */
	J.runtime = (function() {
		/**
		 * 是否debug环境
		 * 
		 * @return {Boolean} 是否呢
		 */
		function isDebugMode() {
			return (J.config.debugLevel > 0);
		}
	
		/**
		 * log记录器
		 * 
		 * @ignore
		 * @param {String} msg 信息记录器
		 */
		function log(msg, type) {
			var info;
			if (isDebugMode()) {
				info = msg + '\n=STACK=\n' + stack();
			} else {
				if (type == 'error') {
					info = msg;
				} else if (type == 'warn') {
					// TBD
				}
			}
			J.Debug.errorLogs.push(info);
		}
	
		/**
		 * 警告信息记录
		 * 
		 * @param {String} sf 信息模式
		 * @param {All} args 填充参数
		 */
		function warn(sf, args) {
			log(write.apply(null, arguments), 'warn');
		}
	
		/**
		 * 错误信息记录
		 * 
		 * @param {String} sf 信息模式
		 * @param {All} args 填充参数
		 */
		function error(sf, args) {
			log(write.apply(null, arguments), 'error');
		}
	
		/**
		 * 获取当前的运行堆栈信息
		 * 
		 * @param {Error} e 可选，当时的异常对象
		 * @param {Arguments} a 可选，当时的参数表
		 * @return {String} 堆栈信息
		 */
		function stack(e, a) {
			function genTrace(ee, aa) {
				if (ee.stack) {
					return ee.stack;
				} else if (ee.message.indexOf("\nBacktrace:\n") >= 0) {
					var cnt = 0;
					return ee.message.split("\nBacktrace:\n")[1].replace(/\s*\n\s*/g, function() {
						cnt++;
						return (cnt % 2 == 0) ? "\n" : " @ ";
					});
				} else {
					var entry = (aa.callee == stack) ? aa.callee.caller : aa.callee;
					var eas = entry.arguments;
					var r = [];
					for (var i = 0, len = eas.length; i < len; i++) {
						r.push((typeof eas[i] == 'undefined') ? ("<u>") : ((eas[i] === null) ? ("<n>") : (eas[i])));
					}
					var fnp = /function\s+([^\s\(]+)\(/;
					var fname = fnp.test(entry.toString()) ? (fnp.exec(entry.toString())[1]) : ("<ANON>");
					return (fname + "(" + r.join() + ");").replace(/\n/g, "");
				}
			}
	
			var res;
	
			if ((e instanceof Error) && (typeof arguments == 'object') && (!!arguments.callee)) {
				res = genTrace(e, a);
			} else {
				try {
					({}).sds();
				} catch (err) {
					res = genTrace(err, arguments);
				}
			}
	
			return res.replace(/\n/g, " <= ");
		}
	
		return {
			/**
			 * 获取当前的运行堆栈信息
			 * 
			 * @param {Error} e 可选，当时的异常对象
			 * @param {Arguments} a 可选，当时的参数表
			 * @return {String} 堆栈信息
			 */
			stack : stack,
			/**
			 * 警告信息记录
			 * 
			 * @param {String} sf 信息模式
			 * @param {All} args 填充参数
			 */
			warn : warn,
			/**
			 * 错误信息记录
			 * 
			 * @param {String} sf 信息模式
			 * @param {All} args 填充参数
			 */
			error : error,
			
			/**
			 * 是否调试模式
			 */
			isDebugMode : isDebugMode
		};
	
	})();

});















/**
 * [Javascript core part]: swfobject 扩展
 */
 
 
Jx().$package(function(J){




/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
/**
 * @namespace swfobject 名字空间
 * @name swfobject
 */
var swfobject = function() {
	
	var UNDEF = "undefined",
		OBJECT = "object",
		SHOCKWAVE_FLASH = "Shockwave Flash",
		SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
		FLASH_MIME_TYPE = "application/x-shockwave-flash",
		EXPRESS_INSTALL_ID = "SWFObjectExprInst",
		ON_READY_STATE_CHANGE = "onreadystatechange",
		
		win = window,
		doc = document,
		nav = navigator,
		
		plugin = false,
		domLoadFnArr = [main],
		regObjArr = [],
		objIdArr = [],
		listenersArr = [],
		storedAltContent,
		storedAltContentId,
		storedCallbackFn,
		storedCallbackObj,
		isDomLoaded = false,
		isExpressInstallActive = false,
		dynamicStylesheet,
		dynamicStylesheetMedia,
		autoHideShow = true,
	
	/* Centralized function for browser feature detection
		- User agent string detection is only used when no good alternative is possible
		- Is executed directly for optimal performance
	*/	
	ua = function() {
		var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
			u = nav.userAgent.toLowerCase(),
			p = nav.platform.toLowerCase(),
			windows = p ? /win/.test(p) : /win/.test(u),
			mac = p ? /mac/.test(p) : /mac/.test(u),
			webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
			ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
			playerVersion = [0,0,0],
			d = null;
		if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
			d = nav.plugins[SHOCKWAVE_FLASH].description;
			if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
				plugin = true;
				ie = false; // cascaded feature detection for Internet Explorer
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
				playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
			}
		}
		else if (typeof win.ActiveXObject != UNDEF) {
			try {
				var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
				if (a) { // a will return null when ActiveX is disabled
					d = a.GetVariable("$version");
					if (d) {
						ie = true; // cascaded feature detection for Internet Explorer
						d = d.split(" ")[1].split(",");
						playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
			}
			catch(e) {}
		}
		return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
	}(),
	
	/* Cross-browser onDomLoad
		- Will fire an event as soon as the DOM of a web page is loaded
		- Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
		- Regular onload serves as fallback
	*/ 
	onDomLoad = function() {
		if (!ua.w3) { return; }
		if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
			callDomLoadFunctions();
		}
		if (!isDomLoaded) {
			if (typeof doc.addEventListener != UNDEF) {
				doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
			}		
			if (ua.ie && ua.win) {
				doc.attachEvent(ON_READY_STATE_CHANGE, function() {
					if (doc.readyState == "complete") {
						doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
						callDomLoadFunctions();
					}
				});
				if (win == top) { // if not inside an iframe
					(function(){
						if (isDomLoaded) { return; }
						try {
							doc.documentElement.doScroll("left");
						}
						catch(e) {
							setTimeout(arguments.callee, 0);
							return;
						}
						callDomLoadFunctions();
					})();
				}
			}
			if (ua.wk) {
				(function(){
					if (isDomLoaded) { return; }
					if (!/loaded|complete/.test(doc.readyState)) {
						setTimeout(arguments.callee, 0);
						return;
					}
					callDomLoadFunctions();
				})();
			}
			addLoadEvent(callDomLoadFunctions);
		}
	}();
	
	function callDomLoadFunctions() {
		if (isDomLoaded) { return; }
		try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
			var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
			t.parentNode.removeChild(t);
		}
		catch (e) { return; }
		isDomLoaded = true;
		var dl = domLoadFnArr.length;
		for (var i = 0; i < dl; i++) {
			domLoadFnArr[i]();
		}
	}
	
	function addDomLoadEvent(fn) {
		if (isDomLoaded) {
			fn();
		}
		else { 
			domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
		}
	}
	
	/* Cross-browser onload
		- Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
		- Will fire an event as soon as a web page including all of its assets are loaded 
	 */
	function addLoadEvent(fn) {
		if (typeof win.addEventListener != UNDEF) {
			win.addEventListener("load", fn, false);
		}
		else if (typeof doc.addEventListener != UNDEF) {
			doc.addEventListener("load", fn, false);
		}
		else if (typeof win.attachEvent != UNDEF) {
			addListener(win, "onload", fn);
		}
		else if (typeof win.onload == "function") {
			var fnOld = win.onload;
			win.onload = function() {
				fnOld();
				fn();
			};
		}
		else {
			win.onload = fn;
		}
	}
	
	/* Main function
		- Will preferably execute onDomLoad, otherwise onload (as a fallback)
	*/
	function main() { 
		if (plugin) {
			testPlayerVersion();
		}
		else {
			matchVersions();
		}
	}
	
	/* Detect the Flash Player version for non-Internet Explorer browsers
		- Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
		  a. Both release and build numbers can be detected
		  b. Avoid wrong descriptions by corrupt installers provided by Adobe
		  c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
		- Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
	*/
	function testPlayerVersion() {
		var b = doc.getElementsByTagName("body")[0];
		var o = createElement(OBJECT);
        o.style.position = 'absolute';
        o.style.left = '-9999px';
        o.style.top = '-9999px';
        o.style.width = '1px';
        o.style.height = '1px';
		o.setAttribute("type", FLASH_MIME_TYPE);
		var t = b.appendChild(o);
		if (t) {
			var counter = 0;
			(function(){
				if (typeof t.GetVariable != UNDEF) {
					var d = t.GetVariable("$version");
					if (d) {
						d = d.split(" ")[1].split(",");
						ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
				else if (counter < 10) {
					counter++;
					setTimeout(arguments.callee, 10);
					return;
				}
				b.removeChild(o);
				t = null;
				matchVersions();
			})();
		}
		else {
			matchVersions();
		}
	}
	
	/* Perform Flash Player and SWF version matching; static publishing only
	*/
	function matchVersions() {
		var rl = regObjArr.length;
		if (rl > 0) {
			for (var i = 0; i < rl; i++) { // for each registered object element
				var id = regObjArr[i].id;
				var cb = regObjArr[i].callbackFn;
				var cbObj = {success:false, id:id};
				if (ua.pv[0] > 0) {
					var obj = getElementById(id);
					if (obj) {
						if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
							setVisibility(id, true);
							if (cb) {
								cbObj.success = true;
								cbObj.ref = getObjectById(id);
								cb(cbObj);
							}
						}
						else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
							var att = {};
							att.data = regObjArr[i].expressInstall;
							att.width = obj.getAttribute("width") || "0";
							att.height = obj.getAttribute("height") || "0";
							if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
							if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
							// parse HTML object param element's name-value pairs
							var par = {};
							var p = obj.getElementsByTagName("param");
							var pl = p.length;
							for (var j = 0; j < pl; j++) {
								if (p[j].getAttribute("name").toLowerCase() != "movie") {
									par[p[j].getAttribute("name")] = p[j].getAttribute("value");
								}
							}
							showExpressInstall(att, par, id, cb);
						}
						else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
							displayAltContent(obj);
							if (cb) { cb(cbObj); }
						}
					}
				}
				else {	// if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
					setVisibility(id, true);
					if (cb) {
						var o = getObjectById(id); // test whether there is an HTML object element or not
						if (o && typeof o.SetVariable != UNDEF) { 
							cbObj.success = true;
							cbObj.ref = o;
						}
						cb(cbObj);
					}
				}
			}
		}
	}
	
	function getObjectById(objectIdStr) {
		var r = null;
		var o = getElementById(objectIdStr);
		if (o && o.nodeName == "OBJECT") {
			if (typeof o.SetVariable != UNDEF) {
				r = o;
			}
			else {
				var n = o.getElementsByTagName(OBJECT)[0];
				if (n) {
					r = n;
				}
			}
		}
		return r;
	}
	
	/* Requirements for Adobe Express Install
		- only one instance can be active at a time
		- fp 6.0.65 or higher
		- Win/Mac OS only
		- no Webkit engines older than version 312
	*/
	function canExpressInstall() {
		return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
	}
	
	/* Show the Adobe Express Install dialog
		- Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
	*/
	function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
		isExpressInstallActive = true;
		storedCallbackFn = callbackFn || null;
		storedCallbackObj = {success:false, id:replaceElemIdStr};
		var obj = getElementById(replaceElemIdStr);
		if (obj) {
			if (obj.nodeName == "OBJECT") { // static publishing
				storedAltContent = abstractAltContent(obj);
				storedAltContentId = null;
			}
			else { // dynamic publishing
				storedAltContent = obj;
				storedAltContentId = replaceElemIdStr;
			}
			att.id = EXPRESS_INSTALL_ID;
			if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
			if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
			doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
			var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
				fv = "MMredirectURL=" + win.location.toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
			if (typeof par.flashvars != UNDEF) {
				par.flashvars += "&" + fv;
			}
			else {
				par.flashvars = fv;
			}
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			if (ua.ie && ua.win && obj.readyState != 4) {
				var newObj = createElement("div");
				replaceElemIdStr += "SWFObjectNew";
				newObj.setAttribute("id", replaceElemIdStr);
				obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						obj.parentNode.removeChild(obj);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			createSWF(att, par, replaceElemIdStr);
		}
	}
	
	/* Functions to abstract and display alternative content
	*/
	function displayAltContent(obj) {
		if (ua.ie && ua.win && obj.readyState != 4) {
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			var el = createElement("div");
			obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
			el.parentNode.replaceChild(abstractAltContent(obj), el);
			obj.style.display = "none";
			(function(){
				if (obj.readyState == 4) {
					obj.parentNode.removeChild(obj);
				}
				else {
					setTimeout(arguments.callee, 10);
				}
			})();
		}
		else {
			obj.parentNode.replaceChild(abstractAltContent(obj), obj);
		}
	} 

	function abstractAltContent(obj) {
		var ac = createElement("div");
		if (ua.win && ua.ie) {
			ac.innerHTML = obj.innerHTML;
		}
		else {
			var nestedObj = obj.getElementsByTagName(OBJECT)[0];
			if (nestedObj) {
				var c = nestedObj.childNodes;
				if (c) {
					var cl = c.length;
					for (var i = 0; i < cl; i++) {
						if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
							ac.appendChild(c[i].cloneNode(true));
						}
					}
				}
			}
		}
		return ac;
	}
	
	/* Cross-browser dynamic SWF creation
	*/
	function createSWF(attObj, parObj, id) {
		var r, el = getElementById(id);
		if (ua.wk && ua.wk < 312) { return r; }
		if (el) {
			if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
				attObj.id = id;
			}
			if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
				var att = "";
				for (var i in attObj) {
					if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
						if (i.toLowerCase() == "data") {
							parObj.movie = attObj[i];
						}
						else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							att += ' class="' + attObj[i] + '"';
						}
						else if (i.toLowerCase() != "classid") {
							att += ' ' + i + '="' + attObj[i] + '"';
						}
					}
				}
				var par = "";
				for (var j in parObj) {
					if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
						par += '<param name="' + j + '" value="' + parObj[j] + '" />';
					}
				}
				el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
				objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
				r = getElementById(attObj.id);	
			}
			else { // well-behaving browsers
				var o = createElement(OBJECT);
				o.setAttribute("type", FLASH_MIME_TYPE);
				for (var m in attObj) {
					if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
						if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							o.setAttribute("class", attObj[m]);
						}
						else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
							o.setAttribute(m, attObj[m]);
						}
					}
				}
				for (var n in parObj) {
					if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
						createObjParam(o, n, parObj[n]);
					}
				}
				el.parentNode.replaceChild(o, el);
				r = o;
			}
		}
		return r;
	}
	
	function createObjParam(el, pName, pValue) {
		var p = createElement("param");
		p.setAttribute("name", pName);	
		p.setAttribute("value", pValue);
		el.appendChild(p);
	}
	
	/* Cross-browser SWF removal
		- Especially needed to safely and completely remove a SWF in Internet Explorer
	*/
	function removeSWF(id) {
		var obj = getElementById(id);
		if (obj && obj.nodeName == "OBJECT") {
			if (ua.ie && ua.win) {
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						removeObjectInIE(id);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			else {
				obj.parentNode.removeChild(obj);
			}
		}
	}
	
	function removeObjectInIE(id) {
		var obj = getElementById(id);
		if (obj) {
			for (var i in obj) {
				if (typeof obj[i] == "function") {
					obj[i] = null;
				}
			}
			obj.parentNode.removeChild(obj);
		}
	}
	
	/* Functions to optimize JavaScript compression
	*/
	function getElementById(id) {
		var el = null;
		try {
			el = doc.getElementById(id);
		}
		catch (e) {}
		return el;
	}
	
	function createElement(el) {
		return doc.createElement(el);
	}
	
	/* Updated attachEvent function for Internet Explorer
		- Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
	*/	
	function addListener(target, eventType, fn) {
		target.attachEvent(eventType, fn);
		listenersArr[listenersArr.length] = [target, eventType, fn];
	}
	
	/* Flash Player and SWF content version matching
	*/
	function hasPlayerVersion(rv) {
		var pv = ua.pv, v = rv.split(".");
		v[0] = parseInt(v[0], 10);
		v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
		v[2] = parseInt(v[2], 10) || 0;
		return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
	}
	
	/* Cross-browser dynamic CSS creation
		- Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
	*/	
	function createCSS(sel, decl, media, newStyle) {
		if (ua.ie && ua.mac) { return; }
		var h = doc.getElementsByTagName("head")[0];
		if (!h) { return; } // to also support badly authored HTML pages that lack a head element
		var m = (media && typeof media == "string") ? media : "screen";
		if (newStyle) {
			dynamicStylesheet = null;
			dynamicStylesheetMedia = null;
		}
		if (!dynamicStylesheet || dynamicStylesheetMedia != m) { 
			// create dynamic stylesheet + get a global reference to it
			var s = createElement("style");
			s.setAttribute("type", "text/css");
			s.setAttribute("media", m);
			dynamicStylesheet = h.appendChild(s);
			if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
				dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
			}
			dynamicStylesheetMedia = m;
		}
		// add style rule
		if (ua.ie && ua.win) {
			if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
				dynamicStylesheet.addRule(sel, decl);
			}
		}
		else {
			if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
				dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
			}
		}
	}
	
	function setVisibility(id, isVisible) {
		if (!autoHideShow) { return; }
		var v = isVisible ? "visible" : "hidden";
		if (isDomLoaded && getElementById(id)) {
			getElementById(id).style.visibility = v;
		}
		else {
			createCSS("#" + id, "visibility:" + v);
		}
	}

	/* Filter to avoid XSS attacks
	*/
	function urlEncodeIfNecessary(s) {
		var regex = /[\\\"<>\.;]/;
		var hasBadChars = regex.exec(s) != null;
		return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
	}
	
	/* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
	*/
	var cleanup = function() {
		if (ua.ie && ua.win) {
			window.attachEvent("onunload", function() {
				// remove listeners to avoid memory leaks
				var ll = listenersArr.length;
				for (var i = 0; i < ll; i++) {
					listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
				}
				// cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
				var il = objIdArr.length;
				for (var j = 0; j < il; j++) {
					removeSWF(objIdArr[j]);
				}
				// cleanup library's main closures to avoid memory leaks
				for (var k in ua) {
					ua[k] = null;
				}
				ua = null;
				for (var l in swfobject) {
					swfobject[l] = null;
				}
				swfobject = null;
			});
		}
	}();
	
	return {
		/* Public API
			- Reference: http://code.google.com/p/swfobject/wiki/documentation
		*/ 
		registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
			if (ua.w3 && objectIdStr && swfVersionStr) {
				var regObj = {};
				regObj.id = objectIdStr;
				regObj.swfVersion = swfVersionStr;
				regObj.expressInstall = xiSwfUrlStr;
				regObj.callbackFn = callbackFn;
				regObjArr[regObjArr.length] = regObj;
				setVisibility(objectIdStr, false);
			}
			else if (callbackFn) {
				callbackFn({success:false, id:objectIdStr});
			}
		},
		
		getObjectById: function(objectIdStr) {
			if (ua.w3) {
				return getObjectById(objectIdStr);
			}
		},
		
		/**
		 * swfobject 嵌入flash的方法
		 * 
		 * @memberOf swfobject
		 * 
		 * @param {String} path swf文件的路径
		 * @returns 
		 * 
		 * @example
		 * Jx().$package(function(J){
		 * 	J.swfobject.embedSWF( path, 'swfSound_Flash_div', '1', '1', '8.0.0', './expressInstall.swf', flashvars, params, attributes);
		 * };
		 * 
		 */
		embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
			var callbackObj = {success:false, id:replaceElemIdStr};
			if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
				setVisibility(replaceElemIdStr, false);
				addDomLoadEvent(function() {
					widthStr += ""; // auto-convert to string
					heightStr += "";
					var att = {};
					if (attObj && typeof attObj === OBJECT) {
						for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
							att[i] = attObj[i];
						}
					}
					att.data = swfUrlStr;
					att.width = widthStr;
					att.height = heightStr;
					var par = {}; 
					if (parObj && typeof parObj === OBJECT) {
						for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
							par[j] = parObj[j];
						}
					}
					if (flashvarsObj && typeof flashvarsObj === OBJECT) {
						for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
							if (typeof par.flashvars != UNDEF) {
								par.flashvars += "&" + k + "=" + flashvarsObj[k];
							}
							else {
								par.flashvars = k + "=" + flashvarsObj[k];
							}
						}
					}
					if (hasPlayerVersion(swfVersionStr)) { // create SWF
						var obj = createSWF(att, par, replaceElemIdStr);
						if (att.id == replaceElemIdStr) {
							setVisibility(replaceElemIdStr, true);
						}
						callbackObj.success = true;
						callbackObj.ref = obj;
					}
					else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
						att.data = xiSwfUrlStr;
						showExpressInstall(att, par, replaceElemIdStr, callbackFn);
						return;
					}
					else { // show alternative content
						setVisibility(replaceElemIdStr, true);
					}
					if (callbackFn) { callbackFn(callbackObj); }
				});
			}
			else if (callbackFn) { callbackFn(callbackObj);	}
		},
		
		switchOffAutoHideShow: function() {
			autoHideShow = false;
		},
		
		ua: ua,
		
		getFlashPlayerVersion: function() {
			return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
		},
		
		hasFlashPlayerVersion: hasPlayerVersion,
		
		createSWF: function(attObj, parObj, replaceElemIdStr) {
			if (ua.w3) {
				return createSWF(attObj, parObj, replaceElemIdStr);
			}
			else {
				return undefined;
			}
		},
		
		showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
			if (ua.w3 && canExpressInstall()) {
				showExpressInstall(att, par, replaceElemIdStr, callbackFn);
			}
		},
		
		removeSWF: function(objElemIdStr) {
			if (ua.w3) {
				removeSWF(objElemIdStr);
			}
		},
		
		createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
			if (ua.w3) {
				createCSS(selStr, declStr, mediaStr, newStyleBoolean);
			}
		},
		
		addDomLoadEvent: addDomLoadEvent,
		
		addLoadEvent: addLoadEvent,
		
		getQueryParamValue: function(param) {
			var q = doc.location.search || doc.location.hash;
			if (q) {
				if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
				if (param == null) {
					return urlEncodeIfNecessary(q);
				}
				var pairs = q.split("&");
				for (var i = 0; i < pairs.length; i++) {
					if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
						return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
					}
				}
			}
			return "";
		},
		
		// For internal usage only
		expressInstallCallback: function() {
			if (isExpressInstallActive) {
				var obj = getElementById(EXPRESS_INSTALL_ID);
				if (obj && storedAltContent) {
					obj.parentNode.replaceChild(storedAltContent, obj);
					if (storedAltContentId) {
						setVisibility(storedAltContentId, true);
						if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
					}
					if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
				}
				isExpressInstallActive = false;
			} 
		}
	};
}();


	
	J.swfobject = swfobject;

;(function(){

// Flash Player Version Detection - Rev 1.6
// Detect Client Browser type
// Copyright(c) 2005-2006 Adobe Macromedia Software, LLC. All rights reserved.
var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

function ControlVersion()
{
	var version;
	var axo;
	var e;

	// NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry

	try {
		// version will be set for 7.X or greater players
		axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
		version = axo.GetVariable("$version");
	} catch (e) {
	}

	if (!version)
	{
		try {
			// version will be set for 6.X players only
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
			
			// installed player is some revision of 6.0
			// GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
			// so we have to be careful. 
			
			// default to the first public version
			version = "WIN 6,0,21,0";

			// throws if AllowScripAccess does not exist (introduced in 6.0r47)		
			axo.AllowScriptAccess = "always";

			// safe to call for 6.0r47 or greater
			version = axo.GetVariable("$version");

		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 4.X or 5.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			version = axo.GetVariable("$version");
		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 3.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			version = "WIN 3,0,18,0";
		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 2.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			version = "WIN 2,0,0,11";
		} catch (e) {
			version = -1;
		}
	}
	
	return version;
}

// JavaScript helper required to detect Flash Player PlugIn version information
function GetSwfVer(){
	// NS/Opera version >= 3 check for Flash plugin in plugin array
	var flashVer = -1;
	
	if (navigator.plugins != null && navigator.plugins.length > 0) {
		if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
			var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
			var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
			var descArray = flashDescription.split(" ");
			var tempArrayMajor = descArray[2].split(".");			
			var versionMajor = tempArrayMajor[0];
			var versionMinor = tempArrayMajor[1];
			var versionRevision = descArray[3];
			if (versionRevision == "") {
				versionRevision = descArray[4];
			}
			if (versionRevision[0] == "d") {
				versionRevision = versionRevision.substring(1);
			} else if (versionRevision[0] == "r") {
				versionRevision = versionRevision.substring(1);
				if (versionRevision.indexOf("d") > 0) {
					versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
				}
			}
			var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
			//alert("flashVer="+flashVer);
		}
	}
	// MSN/WebTV 2.6 supports Flash 4
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
	// WebTV 2.5 supports Flash 3
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
	// older WebTV supports Flash 2
	else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
	else if ( isIE && isWin && !isOpera ) {
		flashVer = ControlVersion();
	}	
	return flashVer;
}

// When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available
function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision)
{
	versionStr = GetSwfVer();
	if (versionStr == -1 ) {
		return false;
	} else if (versionStr != 0) {
		if(isIE && isWin && !isOpera) {
			// Given "WIN 2,0,0,11"
			tempArray         = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
			tempString        = tempArray[1];			// "2,0,0,11"
			versionArray      = tempString.split(",");	// ['2', '0', '0', '11']
		} else {
			versionArray      = versionStr.split(".");
		}
		var versionMajor      = versionArray[0];
		var versionMinor      = versionArray[1];
		var versionRevision   = versionArray[2];

        	// is the major.revision >= requested major.revision AND the minor version >= requested minor
		if (versionMajor > parseFloat(reqMajorVer)) {
			return true;
		} else if (versionMajor == parseFloat(reqMajorVer)) {
			if (versionMinor > parseFloat(reqMinorVer))
				return true;
			else if (versionMinor == parseFloat(reqMinorVer)) {
				if (versionRevision >= parseFloat(reqRevision))
					return true;
			}
		}
		return false;
	}
}

function AC_AddExtension(src, ext)
{
  if (src.indexOf('?') != -1)
    return src.replace(/\?/, ext+'?'); 
  else
    return src + ext;
}

function AC_Generateobj(objAttrs, params, embedAttrs) 
{ 
    var str = '';
    if (isIE && isWin && !isOpera)
    {
  		str += '<object ';
  		for (var i in objAttrs)
  			str += i + '="' + objAttrs[i] + '" ';
  		for (var i in params)
  			str += '><param name="' + i + '" value="' + params[i] + '" /> ';
  		str += '></object>';
    } else {
  		str += '<embed ';
  		for (var i in embedAttrs)
  			str += i + '="' + embedAttrs[i] + '" ';
  		str += '> </embed>';
    }

    document.write(str);
}

function AC_FL_RunContent(){
  var ret = 
    AC_GetArgs
    (  arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
     , "application/x-shockwave-flash"
    );
  AC_Generateobj(ret.objAttrs, ret.params, ret.embedAttrs);
}

function AC_GetArgs(args, ext, srcParamName, classid, mimeType){
  var ret = new Object();
  ret.embedAttrs = new Object();
  ret.params = new Object();
  ret.objAttrs = new Object();
  for (var i=0; i < args.length; i=i+2){
    var currArg = args[i].toLowerCase();    

    switch (currArg){	
      case "classid":
        break;
      case "pluginspage":
        ret.embedAttrs[args[i]] = args[i+1];
        break;
      case "src":
      case "movie":	
        args[i+1] = AC_AddExtension(args[i+1], ext);
        ret.embedAttrs["src"] = args[i+1];
        ret.params[srcParamName] = args[i+1];
        break;
      case "onafterupdate":
      case "onbeforeupdate":
      case "onblur":
      case "oncellchange":
      case "onclick":
      case "ondblClick":
      case "ondrag":
      case "ondragend":
      case "ondragenter":
      case "ondragleave":
      case "ondragover":
      case "ondrop":
      case "onfinish":
      case "onfocus":
      case "onhelp":
      case "onmousedown":
      case "onmouseup":
      case "onmouseover":
      case "onmousemove":
      case "onmouseout":
      case "onkeypress":
      case "onkeydown":
      case "onkeyup":
      case "onload":
      case "onlosecapture":
      case "onpropertychange":
      case "onreadystatechange":
      case "onrowsdelete":
      case "onrowenter":
      case "onrowexit":
      case "onrowsinserted":
      case "onstart":
      case "onscroll":
      case "onbeforeeditfocus":
      case "onactivate":
      case "onbeforedeactivate":
      case "ondeactivate":
      case "type":
      case "codebase":
        ret.objAttrs[args[i]] = args[i+1];
        break;
      case "id":
      case "width":
      case "height":
      case "align":
      case "vspace": 
      case "hspace":
      case "class":
      case "title":
      case "accesskey":
      case "name":
      case "tabindex":
        ret.embedAttrs[args[i]] = ret.objAttrs[args[i]] = args[i+1];
        break;
      default:
        ret.embedAttrs[args[i]] = ret.params[args[i]] = args[i+1];
    }
  }
  ret.objAttrs["classid"] = classid;
  if (mimeType) ret.embedAttrs["type"] = mimeType;
  return ret;
}
J.GetSwfVer= GetSwfVer;
})();


});

/**
 * [Javascript core part]: sound 扩展
 */
 
/**	
 * @description
 * Package: jet.sound
 * 
 * Need package:
 * jet.core.js
 * 
 */
Jx().$package(function(J){
	/**
	 * @namespace
	 * @name sound
	 */
	var $D = J.dom,
		$E = J.event,
		$B = J.browser,
		swfSound,
		activeXSound,
		audioSound,
		noneSound,
		soundModeDetector,
		soundObjectList,
		baseSoundPrototype,
		embedSWF,
		soundEventDispatcher;

	J.sound = J.sound || {};
	/**
	 * 声音类
	 * @memberOf
	 * @class
	 * @param {string} url: mp3 url
	 * @param {boolean} autoLoadAndPlay: 加载完成自动播放
	 * @param {boolean} needEventSupport: 是否需要事件监听
	 */
	baseSoundPrototype = {
		_volume : 100,
		_boolMute : false,
		_url : '',
		_id : -1,
		init : function(){ throw 'init does not implement a required interface'; },
		/*
		 * @param {string} url: mp3 url,可选
		 */
		load : function(){ throw 'load does not implement a required interface'; },
		getVolume : function(){
			return this._volume;
		},
		setVolume : function(value){
			if(!isNaN(value) && value>=0 && value<=100){
				this._volume=value;
				this._correctVolume();
				return true;
			}
			return false;
		},
		_correctVolume : function(){
			this._setDirectVolume(this._volume*J.sound.Global._volume*!this._boolMute*!J.sound.Global._boolMute/100);
		},
		_setDirectVolume : function(){ throw '_setDirectVolume does not implement a required interface'; },
		mute : function(){
			if(!this._boolMute){
				this._boolMute=true;
				this._correntVolume();
			}
		},
		unMute : function(){
			if(this._boolMute){
				this._boolMute=false;
				this._correntVolume();
			}
		},
		isMute : function(){
			return this._boolMute;
		},
		play : function(){ throw 'play does not implement a required interface'; },
		pause : function(){ throw 'pause does not implement a required interface'; },
		stop : function(){ throw 'stop does not implement a required interface'; },
		getDuration : function(){ throw 'getDuration does not implement a required interface'; },
		getPosition : function(){ throw 'getPosition does not implement a required interface'; },
		setPosition : function(){ throw 'setPosition does not implement a required interface'; },
		free : function(){ throw 'free does not implement a required interface'; }
	};
	audioSound = {
		init : function(url,autoLoadAndPlay,needEventSupport){
			var context=this;
			var autoLoadAndPlay = autoLoadAndPlay || false;
			this._needEventSupport = !!needEventSupport;
			this._url=url;
			this._id=soundObjectList.length;
			if(autoLoadAndPlay){
				var obj=new Audio();
				obj.id='audioSoundObject_'+this._id;
				this._onloadCallback=function(){
					context.play();
					context._obj.removeEventListener('canplay',context._onloadCallback,false);
					context._onloadCallback=null;
				}
				obj.addEventListener('canplay',this._onloadCallback,false);
				$D.id('sound_object_container').appendChild(obj);
				this._obj=obj;
				this.load.call(this,url);
			}
			soundObjectList.push(this);
		},
		load : function(url){
			var context=this;
			if(url) this._url=url;
			else if(!this._url) return;
			if(!this._obj){
				var obj=new Audio();
				obj.id='audioSoundObject_'+this._id;
				if(this._needEventSupport){
					obj.addEventListener('durationchange',function(){
						$E.notifyObservers(context,'durationchange');
					},false);
					obj.addEventListener('timeupdate',function(){
						$E.notifyObservers(context,'timeupdate');
					},false);
					obj.addEventListener('canplay',function(){
						$E.notifyObservers(context,'canplay');
					},false);
					obj.addEventListener('ended',function(){
						$E.notifyObservers(context,'ended');
					},false);
					obj.addEventListener('play',function(){
						$E.notifyObservers(context,'play');
					},false);
					obj.addEventListener('pause',function(){
						$E.notifyObservers(context,'pause');
					},false);
					obj.addEventListener('progress',function(){
						$E.notifyObservers(context,'progress');
					},false);
					obj.addEventListener('error',function(){
						$E.notifyObservers(context,'error');
					},false);
				}
				$D.id('sound_object_container').appendChild(obj);
				this._obj=obj;
			}
			this._obj.src=this._url;
			if($B.mobileSafari) this._obj.load();
		},
		_setDirectVolume : function(value){
			if(this._obj) this._obj.volume=value/100;
		},
		play : function(){
			if(this._obj) this._obj.play();
		},
		pause : function(){
			if(!this._obj) return;
			if(this._onloadCallback){
				this._obj.removeEventListener('canplay',this._onloadCallback,false);
				this._onloadCallback=null;
			}
			this._obj.pause();
		},
		stop : function(){
			if(this._obj){
				this._obj.pause();
				this.setPosition(0);
			}
		},
		getDuration : function(){
			if(!this._obj) return 0;
			return this._obj.duration;
		},
		getPosition : function(){
			if(!this._obj) return 0;
			return this._obj.currentTime;
		},
		setPosition : function(value){
			if(!this._obj) return false;
			var obj=this._obj;
			try{
				if(value>=0 && value<obj.duration){
					obj.currentTime=parseFloat(value);
					return true;
				}else{
					return false;
				}
			}catch(e){
				return false;
			}
		},
		buffered : function(){
			if(!this._obj) return 0;
			var obj=this._obj;
			if(!obj.buffered.length) return 0;
			return obj.buffered.end(0);
		},
		free : function(){
			if(this._obj){
				var obj=this._obj;
				obj.pause();
				$D.id('sound_object_container').removeChild(obj);
				this._obj=null;
			}
			soundObjectList[this._id]=null;
		}
	};
	/*activeXSound = {
		init : function(url,autoLoadAndPlay){
			var context=this;
			var autoLoadAndPlay = autoLoadAndPlay || false;
			this._url=url;
			this._id=soundObjectList.length;
			var d=$D.node('div',{
				id:'activeXSound_container_'+this._id
			});
			d.innerHTML='<object id="activeXSoundObject_'+this._id+'" CLASSID=CLSID:6BF52A52-394A-11D3-B153-00C04F79FAA6 TYPE="application/x-oleobject">\
				<PARAM NAME="AutoStart" VALUE="true">\
				<PARAM NAME="enableErrorDialogs" VALUE="false">\
				<PARAM NAME="uiMode" VALUE="full">\
			</OBJECT>';
			$D.id('sound_object_container').appendChild(d);
			soundObjectList.push(this);
			var obj=$D.id('activeXSoundObject_'+this._id);
			this._correctVolume();
			//TODO notifyObservers
			obj.ondurationchange=function(){
				$E.notifyObservers(context,'durationchange');
			}
			obj.ontimeupdate=function(){
				$E.notifyObservers(context,'timeupdate');
			}
			obj.oncanplay=function(){
				$E.notifyObservers(context,'canplay');
			}
			obj.onended=function(){
				$E.notifyObservers(context,'ended');
			}
			obj.onplay=function(){
				$E.notifyObservers(context,'play');
			}
			obj.onpause=function(){
				$E.notifyObservers(context,'pause');
			}
			obj.onprogress=function(){
				$E.notifyObservers(context,'progress');
			}
			obj.onerror=function(){
				$E.notifyObservers(context,'error');
			}
			if(autoLoadAndPlay){
				obj.onload=function(){context.play();}
				this.load();
			}
		},
		load : function(url){
			this._url=url || this._url;
			var obj=$D.id('activeXSoundObject_'+this._id);
			obj.URL=this._url;
			obj.controls.pause();
		},
		_setDirectVolume : function(value){
			var obj=$D.id('activeXSoundObject_'+this._id);
			obj.settings.volume=value;
		},
		play : function(){
			var obj=$D.id('activeXSoundObject_'+this._id);
			obj.controls.play();
		},
		pause : function(){
			var obj=$D.id('activeXSoundObject_'+this._id);
			obj.controls.pause();
		},
		stop : function(){
			var obj=$D.id('activeXSoundObject_'+this._id);
			obj.controls.stop();
		},
		getDuration : function(){
			var obj=$D.id('activeXSoundObject_'+this._id);
			return obj.currentMedia.duration;
		},
		getPosition : function(){
			var obj=$D.id('activeXSoundObject_'+this._id);
			return obj.controls.currentPosition;
		},
		setPosition : function(value){
			var obj=$D.id('activeXSoundObject_'+this._id);
			try{
				if(value>=0 && value<obj.currentMedia.duration){
					obj.controls.currentPosition=parseFloat(value);
					return true;
				}else{
					return false;
				}
			}catch(e){
				return false;
			}
		},
		buffered : function(){
			var obj=$D.id('activeXSoundObject_'+this._id);
			return obj.curentMedia.duration;
		},

		free : function(){
			this.stop();
			var d=$D.id('activeXSound_container_'+this._id);
			d.innerHTML='';
			$D.id('sound_object_container').removeChild(d);
			soundObjectList[this._id]=null;
		}
	};*/
	swfSound = {
		init : function(url,autoLoadAndPlay,needEventSupport){
			this._fid=-1;
			var context=this;
			var autoLoadAndPlay = autoLoadAndPlay || false;
			this._needEventSupport = !!needEventSupport;
			this._url=url;
			this._id=soundObjectList.length;
			if(autoLoadAndPlay){
				var obj=$D.id('JxSwfSound_Flash');
				this._fid=obj.loadSound(this._url,-1,true); //url, callbackid, playWhileReady
				this._correctVolume();
			}
			soundObjectList.push(this);
		},
		load : function(url){
			if(url) this._url=url;
			else if(!this._url) return;
			var obj=$D.id('JxSwfSound_Flash');
			if(this._fid!=-1){
				obj.free(this._fid);
			}
			this._fid=obj.loadSound(this._url,this._needEventSupport?this._id:-1,false);
			this._correctVolume();
		},
		_setDirectVolume : function(value){
			if(this._fid==-1) return;
			var obj=$D.id('JxSwfSound_Flash');
			obj.setVolume(this._fid,value);
		},
		play : function(){
			if(this._fid==-1) return;
			var obj=$D.id('JxSwfSound_Flash');
			obj.playSound(this._fid);
		},
		pause : function(){
			if(this._fid==-1) return;
			var obj=$D.id('JxSwfSound_Flash');
			obj.pauseSound(this._fid);
		},
		stop : function(){
			if(this._fid==-1) return;
			var obj=$D.id('JxSwfSound_Flash');
			obj.stopSound(this._fid);
		},
		getDuration : function(){
			if(this._fid==-1) return 0;
			var obj=$D.id('JxSwfSound_Flash');
			return obj.getDuration(this._fid);
		},
		getPosition : function(){
			if(this._fid==-1) return 0;
			var obj=$D.id('JxSwfSound_Flash');
			return obj.getPosition(this._fid);
		},
		setPosition : function(value){
			if(this._fid==-1) return false;
			var obj=$D.id('JxSwfSound_Flash');
			return obj.setPosition(this._fid,value);
		},
		buffered : function(){
			if(this._fid==-1) return 0;
			var obj=$D.id('JxSwfSound_Flash');
			return obj.getBuffered(this._fid);
		},
		free : function(){
			if(this._fid!=-1){
				var obj=$D.id('JxSwfSound_Flash');
				obj.free(this._fid);
			}
			soundObjectList[this._id]=null;
		}
	};
	embedSWF = function(path) {
		if (path == undefined) {
			path = "./swf/jxswfsound.swf";
		}

		var flashvars = false;

		var attributes = {
			id : 'JxSwfSound_Flash',
			name : 'JxSwfSound_Flash'
		};

		var params = {
			menu : 'false',
			wmode : 'transparent',
			swLiveConnect : 'true',
			allowScriptAccess : 'always'
		};

		var swapNode=$D.node('div',{
			id:'swfSound_Flash_div'
		});
		var container=$D.id('sound_object_container')
		container.appendChild(swapNode);
		$D.setStyle(container,'display','');
		// make sure the flash movie is visible, otherwise the onload is not fired!
		try {
			J.swfobject.embedSWF(path, 'swfSound_Flash_div', '1', '1', '8.0.0',
					'./swf/expressInstall.swf', flashvars, params, attributes);
		} catch (e) {
			J.error('J.Sound module error: ' + e.message, 'Sound');
			// alert( 'Seems like you are missing swfobject! - Please include
			// the swfobject javascript into your HTML!' );
		}
	};
	soundEventDispatcher = function(id,event){
		//alert('SoundEvent:'+id+' '+event);
		var obj=soundObjectList[id];
		if(obj) $E.notifyObservers(obj,event);
	};

	noneSound = {
		init : function(){},
		load : function(){},
		_correctVolume : function(){},
		play : function(){},
		pause : function(){},
		stop : function(){},
		getDuration : function(){return -1},
		getPosition : function(){return 0},
		setPosition : function(){return true},
		free : function(){}
	};
	
	soundModeDetector = function(){
        if(J.browser.chrome){
            return 1;//chrome新版有问题, 播放不了audio
        }else if(window.Audio && (new Audio).canPlayType('audio/mpeg')){
			return 3; //以上浏览器的高版本支持audio对象播放mp3格式
		}else if(J.browser.plugins.flash>=9){
			return 1; //支持flash控件
		}
		/*else if(!!window.ActiveXObject && new ActiveXObject("WMPlayer.OCX.7")){
			return 2; //支持wmp控件
		}*/
		else{
			return 0; //一直很安静
		}
	};
	soundObjectList=[];
	//J.profile('[J.sound]sound mode:'+soundModeDetector());
	switch(soundModeDetector()){
		case 1 : //flash mode
			J.sound = new J.Class(J.extend({},baseSoundPrototype,swfSound));
			J.sound.isReady=false;
			J.sound.init = function(path){
				if(J.sound.isReady) return;
				window.JxSwfSoundOnLoadCallback = function(){
					J.sound.isReady=true;
					var d=$D.id('sound_object_container');
					$D.setStyle(d,'width','1px');
					$D.setStyle(d,'height','1px');
					$E.notifyObservers(J.sound,'ready');
				};
				window.soundEventDispatcher=soundEventDispatcher;
				var d=$D.node('div',{
					id:'sound_object_container',
					style:'position:absolute;left:0;top:0;width:100px;height:100px;overflow:hidden;' //此处display不能为none, 否则会出现很多诡异的错误
				});
				(document.body || document.documentElement).appendChild(d);
				embedSWF(path);
			}
			break;
		/*case 2 : //activeX mode
			J.sound = new J.Class(J.extend({},baseSoundPrototype,activeXSound));
			J.sound.isReady=true;
			break;*/
		case 3 : //html5 mode
			J.sound = new J.Class(J.extend({},baseSoundPrototype,audioSound));
			J.sound.isReady=false;
			J.sound.init = function(){
				if(J.sound.isReady) return;
				var d=$D.node('div',{
					id:'sound_object_container',
					style:'position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;' //此处display不能为none, 否则会出现很多诡异的错误
				});
				(document.body || document.documentElement).appendChild(d);
				J.sound.isReady=true;
			}
			break;
		default : //none sound support
			J.sound = new J.Class(J.extend({},baseSoundPrototype,noneSound));
			J.sound.init = function(){};
			J.sound.isReady=false;
			break;
	}
	J.sound.Global = {
		_volume : 100, //between 0 to 100
		_boolMute : false,
		getVolume : function(){
			return this._volume;
		},
		setVolume : function(value){
			if(!isNaN(value) && value>=0 && value<=100){
				this._volume=value;
				//TODO set all sound volume
				for(var i=0,l=soundObjectList.length;i<l;i++){
					if(soundObjectList[i]!=null) soundObjectList[i]._correctVolume();
				}
				return true;
			}
			return false;
		},
		mute : function(){
			if(!this._boolMute){
				this._boolMute=true;
				//TODO mute all sound
				for(var i=0,l=soundObjectList.length;i<l;i++){
					if(soundObjectList[i]!=null) soundObjectList[i]._correctVolume();
				}
			}
		},
		unMute : function(){
			if(this._boolMute){
				this._boolMute=false;
				//TODO resume all sound
				for(var i=0,l=soundObjectList.length;i<l;i++){
					if(soundObjectList[i]!=null) soundObjectList[i]._correctVolume();
				}
			}
		},
		isMute : function(){
			return this._boolMute;
		},
		removeAll : function(){
			//TODO remove all sound
			for(var i=0,l=soundObjectList.length;i<l;i++){
					if(soundObjectList[i]!=null) soundObjectList[i].free();
			}
		}
	};
});

