declare interface BpmnScript {
  scriptFormat?: string;
  resource?: string;
  value?: string;
}

declare interface BpmnField {
  name: string;
  expression?: string;
  stringValue?: string;
  string?: string;
  fieldType?: 'string' | 'expression';
}

export declare interface BpmnExecutionListener {
  event: string;
  expression?: string;
  class?: string;
  delegateExpression?: string;
  script?: BpmnScript;
  fields: BpmnField[];
}

/**
 * 任务监听器，event等属性值因引擎而异，此为camunda
 */
export declare interface BpmnTaskListener {
  event: 'create' | 'assignment' | 'complete' | 'update' | 'delete' | 'timeout';
  expression?: string;
  class?: string;
  delegateExpression?: string;
  script?: BpmnScript;
  fields?: BpmnField[];
}

export declare interface BpmnThrowEvent {
  id: string;
  name: string;
}

/**
 * 多实例表单参数接口
 * @interface
 */
export declare interface BpmnMultiInstanceForm {
  /**
   * 循环基数
   * @type {string | number}
   */
  loopCardinality?: number | string;
  /**
   * 完成条件(一个布尔表达式)
   * @type {string}
   */
  completionCondition?: any;
  /**
   * 元素集合（一个流程变量)
   * @type {string | string[] }
   */
  collection?: string;
  /**
   * 元素变量（同时也支持通过inputDataItem 设置）
   * @type {string}
   */
  elementVariable?: string;
  /**
   * 失败重试周期
   * @type {string}
   */
  failedJobRetryTimeCycle?: string;
  /**
   * 是否顺序执行（串行/并行）
   * @type {boolean}
   */
  isSequential?: boolean;
  /**
   * 是否异步执行前任务
   * @type {boolean}
   */
  asyncBefore?: boolean;
  /**
   * 是否异步执行后任务
   * @type {boolean}
   */
  asyncAfter?: boolean;
  /**
   * 是否独立执行(独占)
   * @type {boolean}
   */
  exclusive?: boolean;
}

declare type MultiType = 'None' | 'Parallel' | 'Serial' | 'Cycle';

declare type LOOP_TYPE = 'multi' | 'standard' | 'none';

/**
 * 标准循环特征表单接口
 * @interface
 */
export declare interface BpmnStandardLoopForm {
  /**
   * 是否在循环前进行测试
   * @type {boolean}
   */
  testBefore: boolean;
  /**
   * 最大循环次数
   * @type {number | string}
   */
  loopMaximum?: number | string;
  /**
   * 一个布尔的表达式，用于控制循环是否继续。只要布尔值为true，活动节点（Activity）就继续循环。
   * @type {string}
   */
  loopCondition?: string;
}

/**
 * 循环特征的完成条件的额外记录标签
 */
export declare interface BpmnCompleteCondition {
  type: string;
  operationValue?: string;
  value?: number | string;
}

declare interface BpmnExtensionProperty {
  id?: string;
  name?: string;
  value?: string;
}

declare interface BpmnExtensionProperties {
  values: BpmnExtensionProperty[];
}
