/**
 * Created by xmg on 2017/2/21.
 */
(function (window, undefined) {

    // 用于创建njQuery对象的工厂方法
    var njQuery = function(selector) {
        return new njQuery.fn.init( selector );
    };
    // 修改njQuery的原型
    njQuery.fn = njQuery.prototype = {
        constructor: njQuery,
        init:  function (selector) {
            // 1.传入 '' null undefined NaN  0  false , 直接返回空对象, this
            if(!selector){
                return this;
            }
            // 判断是否是Function
            else if(njQuery.isFunction(selector)){
               njQuery.ready(selector);
            }
            // 2.传入的是字符串, 那么需要判断是选择器还是html代码片段
            else if(njQuery.isString(selector)){
                // 0.为了防止用户是猴子派来的, 所以先去掉空格
                selector = njQuery.trim(selector);
                // 2.1如果是html代码片段, 会先根据html代码片段创建DOM元素, 然后将创建好的元素添加到jQ对象中
                // 最简单的代码片段: <a>
                // 先你判断是否以<开头, 再判断是否以>结尾, 再判断长度是否>=3
                if(njQuery.isHTML(selector)){
                    // console.log('代码片段');
                    // 1.先手动创建一个DOM元素
                    var temp = document.createElement('div');
                    // 2.利用innerHTML将代码片段直接写入创建的DOM元素中
                    temp.innerHTML = selector;
                    /*
                     // 3.从临时的DOM元素中取出创建好的元素
                     for(var i = 0, len = temp.children.length; i < len; i++){
                     // console.log(temp.children[i]);
                     this[i] = temp.children[i];
                     }
                     // 4.给jQ对象添加lenght属性
                     this.length = temp.children.length;
                     */
                    /*
                     谁调用就push到谁上, 一般情况下都是利用数组调用, 所以都是push到了数组上
                     如果利用apply修改了push内部的this, 那么push就是push到修改之后的那个对象上
                     也就是说把push的this修改为了谁, 将来就push到谁上
                     apply有一个特点, 会将传入的参数依次取出来传入给指定的方法
                     */
                    [].push.apply(this, temp.children);
                }
                // 2.2如果是选择器, 将查找的DOM元素存储到当前jQ对象中返回
                else{
                    // console.log('选择器');
                    // 1.根据传入的选择器在当前界面中查找对应的元素
                    var nodes = document.querySelectorAll(selector);
                    /*
                     // 2.将查找的DOM元素存储到当前jQ对象中返回
                     for(var i = 0, len = nodes.length; i < len; i++){
                     this[i] = nodes[i];
                     }
                     this.length = nodes.length;
                     */
                    [].push.apply(this, nodes);
                }
            }
            // 3.传入的是数组, 会把数组/伪数组中的每一个项添加到jQ对象中
            else if(njQuery.isArraylike(selector)){
                // 1.先将伪数组转化为真数组
                selector = [].slice.call(selector);
                // 2.再利用apply将真数组设置给jQ对象
                [].push.apply(this, selector);
            }
            // 4.其它情况,直接把传入的内容添加到jQ对象中
            else{
                this[0] = selector;
                this.length = 1;
            }

        },
        jquery: '6.6.6',
        selector: '',
        length: 0,
        toArray: function () {
            return [].slice.call(this);
        },
        get: function (index) {
            // 1.判断有没有传入index
            if(arguments.length == 0){
                return this.toArray();
            }
            // 2.判断是否是正数
            else if(index >= 0){
                return this[index];
            }
            // 3.判断是否是负数
            else{
                return this[this.length + index];
            }
        },
        eq: function (index) {
            /*
            // 1.判断有没有传入index
            if(arguments.length == 0){
                return njQuery();
            }
            // 2.判断是否是正数
            else if(index >= 0){
                return njQuery(this.get(index));
            }
            // 3.判断是否是负数
            else{
                return njQuery(this.get(index));
            }
            */
            return (arguments.length == 0) ? njQuery() : njQuery(this.get(index));
        },
        first: function () {
            return this.eq(0);
        },
        last: function () {
            return this.eq(-1);
        },
        /*[].push.apply(jq)*/
        push: [].push,
        sort: [].sort,
        splice: [].splice,
        // 遍历当前jQ实例
        each: function (fn) {
            njQuery.each(this, fn);
        },
        // 遍历指定对象, 根据fn的返回结果生成一个新数组
        map: function (fn) {
            return njQuery.map(this, fn);
        }
    };
    
    // 修改init函数的原型为njQuery的原型
    njQuery.fn.init.prototype = njQuery.fn;

    // 将内部创建的njQuery对象暴露给外界使用
    window.njQuery = window.$ = njQuery;

    /*
    直接写在这个地方弊端:
    1.随着代码量的增加, 后期不利于维护
    2.由于这里定义的都是一些工具方法, 所以我们希望大家都能使用, 但是由于定义在了init上, 外界无法访问init, 所以外界无法访问
    */
    // 给外界提供一个动态扩展静态属性/方法和实例属性/方法的方法
    njQuery.extend = njQuery.prototype.extend = function (obj) {
        for(var key in obj){
            this[key] = obj[key];
        }
    }
    
    // 扩展一些静态工具方法
    /*
    好处: 
    1.让外界可以使用内部工具方法
    2.将某个类型的工具方法集中到一起管理, 便于后期维护
    */
    njQuery.extend({
        // 判断是否是字符串
        isString : function (content) {
        return typeof content === 'string';
    },
        // 判断是否是HTML代码片段
        isHTML : function (html) {
            if(!njQuery.isString(html)){
                return false;
            }
            return html.charAt(0) === '<' &&
                html.charAt(html.length - 1) === '>' &&
                html.length >= 3;
        },
        // 取出两端空格
        trim : function (str) {
            // 1.判断是否是字符串, 如果不是就直接返回传入的内容
            if(!njQuery.isString(str)){
                return str;
            }
            // 2.判断当前浏览器是否支持自带的trim方法, 如果支持就用系统的
            if(str.trim){
                return str.trim();
            }else{
                return str.replace(/^\s+|\s+$/g, '');
            }
        },
        // 判断是否是对象
        isObject: function (obj) {
            // 对null特殊处理
            if(obj == null){
                return false;
            }
            return typeof obj === 'object';
        },
        // 判断是否是window
        isWindow: function (w) {
            return w.window === window;
        },
        // 判断是否是真/伪数组
        isArraylike : function (arr) {
            // 1.排除非对象和window
            if (!njQuery.isObject(arr) ||
                njQuery.isWindow(arr)){
                return false;
            }
            // 2.判断是否是真数组
            else if(({}).toString.apply(arr) === '[object Array]'){
                return true;
            }
            // 3.判断是否是伪数组
            else if('length' in arr &&
                (arr.length == 0 ||
                arr.length - 1 in arr)){
                return true;
            }
            return false;
        },
        // 判断是否是Function
        isFunction : function (fn) {
            return typeof fn === 'function';
        },
        // 对函数的处理
        ready: function (fn) {
            // 处理传入函数的情况
            // 1.直接判断当前document.readyState的状态
            if(document.readyState === 'complete'){
                fn();
            }
            // 2.判断当前浏览器是否支持addEventListener
            else if(document.addEventListener){
                addEventListener('DOMContentLoaded', fn);
            }
            // 3.如果当前浏览器不支持addEventListener, 那么我们就使用attachEvent
            else{
                document.attachEvent('onreadystatechange', function () {
                    // 由于onreadystatechange事件肯能触发多次, 所以需要进一步判断是否真正的加载完毕
                    if(document.readyState === 'complete'){
                        fn();
                    }
                });
            }
        },
        // 遍历指定的对象
        each: function (obj, fn) {
            // 1.判断是否是数组(包含真数组和伪数组)
            if(njQuery.isArraylike(obj)){
                for(var i = 0, len = obj.length; i < len; i++){
                    if(fn.call(obj[i], i, obj[i]) == false){
                        break;
                    }
                }
            }
            // 2.判断是否是对象
            else if(njQuery.isObject(obj)){
                for(var key in obj){
                    if(fn.call(obj[key], key, obj[key]) == false){
                        break;
                    }
                }
            }
            return obj;
        },
        // 遍历指定对象, 根据fn的返回结果生成一个新数组
        map: function (obj, fn) {
            var res = [];
            // 1.判断是否是数组
            if(njQuery.isArraylike(obj)){
                for(var i = 0, len = obj.length; i < len; i++){
                    var temp = fn(obj[i], i);
                    if(temp){
                        res.push(temp)
                    } 
                }
            }
            // 2.判断是否是对象
            else if(njQuery.isObject(obj)){
                for(var key in obj){
                    var temp = fn(obj[key], key);
                    if(temp){
                        res.push(temp);
                    }
                }
            }
            return res;
        }
    });
    
    // 扩展一些实例方法(DOM操作)
    njQuery.fn.extend({
        empty: function () {
            // 1.遍历传入的对象
            for(var i = 0, len = this.length; i < len; i++){
                // 2.利用innerHTML清空元素中的内容
                this[i].innerHTML = '';
            }
            // 3.返回this
            return this;
        },
        remove: function () {
            // 1.遍历jQ实例对象, 取出每一个元素
            for(var i = 0, len = this.length; i < len; i++){
                // 2.找到当前遍历到元素的父元素
                this[i].parentNode.removeChild(this[i]);
            }
            return this;
        },
        html: function (html) {
            // 1.判断有没有传入参数
            if(arguments.length == 0){
                return this[0].innerHTML;
            }
            // 2.如果传入了参数, 那么就给遍历所有的元素设置值
            else{
                /*
                for(var i = 0, len = this.length; i < len; i++){
                    this[i].innerHTML = html;
                }
                */
                // this是jQ实例
                this.each(function () {
                    // this是遍历到的值
                    // 如果不明白, 请看each内部实现
                    this.innerHTML = html;
                });
                return this;
            }
           
        },
        text: function (text) {
            // 1.判断有没有传入参数
            if(arguments.length == 0){
                var res = '';
                // 获取所有元素的内容拼接之后返回
                this.each(function () {
                    res += this.innerText;
                });
                return res;
            }
            // 2.如果没有参数参数, 直接更改元素的内容即可
            else{
                this.each(function () {
                    this.innerText = text;
                });
                return this;
            }
        },
        appendTo: function (target) {
            // 1.对传入的数据进行统一包装处理
            target = $(target);

            // 定义数组保存结果
            var res = [];
            // 2.通过外循环遍历target
            for(var i = 0, len = target.length; i < len; i++){
                // 3.通过内循环遍历source
                for(var j = 0, jLen = this.length; j < jLen; j++){
                    // 判断是否是第一次添加, 如果是第一次就添加对象本身
                    if(i == 0) {
                        var temp = this[j];
                        target[i].appendChild(temp);
                        res.push(temp);
                    }
                    // 如果不是第一次添加, 那么就添加克隆版本
                    else{
                        var temp = this[j].cloneNode(true);
                        target[i].appendChild(temp);
                        res.push(temp);
                    }
                }
            }

            return  res;
        },
        prependTo: function (target) {
            // 1.对传入的数据进行统一包装处理
            target = $(target);

            // 定义数组保存结果
            var res = [];
            // 2.通过外循环遍历target
            for(var i = 0, len = target.length; i < len; i++){
                // 3.通过内循环遍历source
                for(var j = 0, jLen = this.length; j < jLen; j++){
                    // 判断是否是第一次添加, 如果是第一次就添加对象本身
                    if(i == 0) {
                        var temp = this[j];
                        target[i].insertBefore(temp, target[i].firstChild);
                        res.push(temp);
                    }
                    // 如果不是第一次添加, 那么就添加克隆版本
                    else{
                        var temp = this[j].cloneNode(true);
                        target[i].insertBefore(temp, target[i].firstChild);
                        res.push(temp);
                    }
                }
            }

            return  res;
        },
        append: function (content) {
            // 1.遍历当前jQ实例,取出每一个元素
            this.each(function () {
                this.innerHTML += content;
            });
            return this;
        },
        prepend: function (content) {
            // 1.判断是否是字符串
            if(njQuery.isString(content)){
                // 遍历当前jQ实例,取出每一个元素
                this.each(function () {
                    this.innerHTML = content + '\n' + this.innerHTML;
                });
            }else{
                this.prependTo.call(content, this);
            }
            return this;
        }
    });
    
    // 扩展一些实例方法(样式相关)
    njQuery.fn.extend({
        // 设置或者获取属性节点的值
        attr: function (attr, value) {
            // 1.判断是否是字符串
            if(njQuery.isString(attr)){
                // 判断传入了几个参数
                // 1.1如果传入了一个参数, 那么返回第一个元素的属性节点值
                if(arguments.length == 1){
                    return this[0].getAttribute(attr);
                }
                // 1.2如果传入了两个参数, 那么就遍历当前jQ实例, 取出每一个元素设置属性节点的值
                else if(arguments.length == 2){
                    this.each(function () {
                        this.setAttribute(attr, value);
                    });
                }
            }
            // 2.判断是否是对象
            else if(njQuery.isObject(attr)){
                // 2.1遍历传入的对象
                for(var key in attr){
                    // 2.1遍历当前jQ实例中所有的元素
                    this.each(function () {
                        // 给每个遍历到的元素设置当前遍历到的属性节点值
                        this.setAttribute(key, attr[key]);
                    });
                }
                
            }
            
            return this;
        }
    });
    
})(window);