# pubAndSub.js  基于浏览器内置API实现的发布订阅模式封装

## 原理
本库不依赖任何第三方库，仅利用浏览器内置的MessageChannel实现发布订阅模式

## 快速开始

### 安装
```html
  <script src="pubAndSub.js"></script>
```

### 订阅事件
sub方法接受三个参数，第一个是要订阅的事件名，第二个是订阅事件所触发的回调函数，第三个参数是触发回调执行时的this指向，相同事件可以重复订阅多次
```javascript
  //例1(基本)
  pubAndSub.sub("topic",function(arg){
    console.log(arg);
  });
  
  //例2(设定this指针)
  pubAndSub.sub("topic",function(a){
    //this指向document
    console.log(this);
  },document);

  //例3(订阅多个事件)
  //第一个事件
  pubAndSub.sub("topic",function(arg){
    console.log(arg)
  });

  //第二个事件
  pubAndSub.sub("topic",function(arg){
    console.log(this)
  },document);

  //第三个事件
  pubAndSub.sub("topic",function(arg){
    console.log("topic");
  },document);
``` 

### 发布事件
pub方法接受两个参数，第一个是要发布的事件名称，第二个确定是否要异步执行所有事件（可以缺省，默认异步执行，当此参数为false时，将按照事件订阅的先后顺序执行）
```javascript
  //例1(基本):
  pubAndSub.pub("topic",{
    parm1:'A',
    parm2:'B'
  });

  //例2(同步执行):
  pubAndSub.pub("topic",{
    parm1:'A',
    parm2:'B'
  },false);
```

## 优雅降级

由于并不是所有浏览器都支持MessageChannel，因此对于不支持MessageChannel的浏览器，pubAndSub.js内部使用addEventListener来代替MessageChannel，以保证可以正常执行。
