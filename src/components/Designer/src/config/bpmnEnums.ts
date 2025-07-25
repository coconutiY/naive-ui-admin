export const LISTENER_ALLOWED_TYPES = [
  'bpmn:Activity',
  'bpmn:Event',
  'bpmn:Gateway',
  'bpmn:SequenceFlow',
  'bpmn:Process',
  'bpmn:Participant',
];

/**
 * 多实例常量
 * @type enum
 */
export enum MULTIPLE_CONST {
  /**
   * 实例总数
   */
  INSTANCE_NUM = 'nrOfInstances',
  /**
   * 当前活动的（尚未完成的）实例数量。对于串行多实例来说，这个值始终是 1
   */
  ACTIVE_NUM = 'nrOfActiveInstances',
  /**
   * 已经完成的实例的数量
   */
  COMPLETE_NUM = 'nrOfCompletedInstances',
}

export const MODELER_INIT = Symbol('modeler-init');

// provide/inject 数据
export const MODELER = Symbol('modeler');
export const ACTIVE_ID = Symbol('active_id');
export const ACTIVE_ELEMENT = Symbol('active_element');
