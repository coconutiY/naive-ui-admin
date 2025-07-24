import { notNull } from './tools';
/**
 * 事件类型
 */
export type EventType = string | symbol;

/**
 * 事件回调函数
 */
export type Handler<T = any> = (event?: T) => void;

/**
 * 已经注册的事件的回调函数列表
 */
export type EventHandlerList = Array<Handler>;

/**
 * 事件类型及其相应事件回调列表的键值对
 */
export type EventHandlerMap = Map<EventType, EventHandlerList>;

/**
 * 事件订阅发布中心
 */
export default class Emitter {
  /**
   * 事件存储对象
   */
  private static _events: EventHandlerMap = new Map();

  /**
   * 向某个事件添加一个回调函数
   * @param type 事件名称
   * @param event 需要添加的回调函数
   * @param context 函数上下文
   * @param once 是否只执行一次回调
   */
  static _addListener(type: EventType, event: any, context?, once?: boolean) {
    event.context = context;
    event.once = once;
    const events = this._events.get(type);
    if (!notNull(events)) {
      this._events.set(type, [event]);
    } else {
      events.push(event);
    }
    return this;
  }

  /**
   * 向某个事件添加一个回调函数
   * @param type 事件名称
   * @param event 需要添加的回调函数
   * @param context 函数上下文
   */
  static addListener(type: EventType, event: Handler, context?) {
    return this._addListener(type, event, context);
  }

  /**
   * 查询当type回调函数数组中是否存在该回调函数
   * @param type
   * @param event
   */
  static hasListener(type: EventType, event: Handler) {
    const events = this._events.get(type);
    return events && events.includes(event);
  }

  /**
   * 订阅事件，并执行回调函数
   * @param type
   * @param event
   * @param context
   */
  static on(type: EventType, event: Handler, context?) {
    return this.addListener(type, event, context);
  }

  /**
   * 向事件中添加一个只执行一次的回调
   * @param type 事件类型
   * @param event
   * @param context
   */
  static once(type: EventType, event: Handler, context?) {
    this._addListener(type, event, context, true);
  }

  /**
   * 发布事件
   * @param type 事件类型
   * @param objs 参数列表
   */
  static emit(type: EventType, ...objs: any[]) {
    const events = this._events.get(type);
    if (!notNull(events)) {
      return false;
    }
    events.forEach((event: any) => {
      event.call(event.context || null, ...objs);
      if (event.once) {
        this.removeListener(type, event);
      }
    });
    return true;
  }

  /**
   * 移除某个事件的某个回调
   * @param type
   * @param event
   */
  static removeListener(type: EventType, event: Handler) {
    const events = this._events.get(type);
    if (!events) {
      return this;
    }
    const index = events.indexOf(event);
    if (index > -1) {
      events.splice(index, 1);
    }
    return this;
  }

  /**
   * 移除某个事件的所有回调
   * @param type
   */
  static removeAllListeners(type: EventType) {
    if (!notNull(type)) {
      this._events.clear();
    } else {
      this._events.delete(type);
    }
    return this;
  }

  /**
   * 获取一个type的所有回调函数
   */
  static listeners(type: EventType) {
    const events = this._events.get(type);
    return !notNull(events) ? [] : [...events];
  }

  /**
   * 统计某个事件的回调函数数量
   * @param type
   */
  static listenerCount(type: string) {
    const events = this._events.get(type);
    return !notNull(events) ? 0 : events.length;
  }

  /**
   * 获取发布的所有事件
   */
  static eventNames() {
    return Array.from(this._events.keys());
  }
}
