let hasMessageChannel = !!MessageChannel,
  events = {},
  mediator;

/**
 * 执行异步任务
 * @param  {Array} task 执行异步任务[Function,context]
 * @param  {Object} data 事件
 * @return {Void}
 */
function runTask(task, data) {
  try {
    task[0].call(task[1] === undefined ? task[0] : task[1], data);
  } catch (e) {
    console.error(e);
  }
}

/**
 * 事件队列构造器
 */
function Queue() {
  this.Q = [];
}

Queue.prototype = {
  /**
   * 添加任务
   * @param  {Array} task 数组:[ function , context ]
   * @return {Void}
   */
  add(task) {
    this.Q.push(task);
  },
  /**
   * 执行事件队列
   * @param  {Object} data 参数
   * @return {Void}
   */
  handle(data) {
    this.Q.forEach((task) => {
      runTask(task, data);
    });
  }
}

//messageChannel方式的实现
const immediate = {
  channel: hasMessageChannel ? new MessageChannel() : null,
  subscribe(subject, context) {
    if (!this.channel.port1.onmessage) {
      immediate.channel.port1.onmessage = function (event) {
        let key = event.data.subject,
          _event = event.data.event,
          hander;
        hander = events[key];
        if (hander && hander.Q) {
          hander.Q.handle(_event);
        }
        return false;
      }
    }
  },
  publish(subject, detail) {
    this.channel.port2.postMessage(detail);
  }
}

//addEventListener的实现
const broderCast = {
  /**
   * 订阅
   * @param  {String} subject  主题
   * @param  {Function} listener 事件监听
   * @param  {This} context  执行事件上下文
   * @return {Void}
   */
  subscribe(subject) {
    events[subject].proxy = function (event) {
      let key = event.detail.subject,
        _event = event.detail.event,
        hander;
      hander = events[key];
      if (hander && hander.Q) {
        hander.Q.handle(_event);
      }
      return false;
    }
    document.addEventListener(subject, events[subject].proxy, false);
  },
  /**
   * 发布事件
   * @param  {[type]} subject [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} sync    是否是异步事件,true:异步事件;false:同步事件
   * @return {[type]}         [description]
   */
  publish(subject, data) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent(subject, true, true, data);
    document.dispatchEvent(event);
  }
}

//优先使用messageChannel的方式
mediator = hasMessageChannel ? immediate : BorderCast;



const eventBus = {
  sub(subject, event, context) {
    let key = "bus_" + subject.toLowerCase(),
      task = [event, context];
    if (events[key]) { //如果存在直接添加
      events[key].Q.add(task);
    } else { //否则创建新的Q
      let Q = new Queue();
      Q.add(task);
      events[key] = {
        Q
      };
      mediator.subscribe(key);
    }
  },
  pub(subject, data, sync) {
    let key = "bus_" + subject.toLowerCase(),
      detail;
    sync = sync === undefined ? true : sync;
    detail = {
      'subject': key,
      'event': data,
      bubbles: true,
      cancelable: true
    };
    if (sync) { //异步

      mediator.publish(key, detail);
    } else { //同步
      let hander = events[key];
      if (hander && hander.Q) {
        hander.Q.handle(data);
      }
    }
  }
}

if (typeof exports === 'object') {
  // Assume nodejs
  module.exports = EventBus;
} else {
  if (typeof define === 'function') {
    // AMD module
    define([], function () {
      return eventBus;
    });
  } else if (window) {
    window.pubAndSub = eventBus;
  }
}