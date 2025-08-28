import Modeler from 'bpmn-js/lib/Modeler';
import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { find } from 'min-dash';
import { is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import {
  getBusinessObject,
  getProcessPrefix,
  notEmpty,
  notNull,
} from '@/components/Designer/src/utils/tools';
import { getExtensionElements } from '@/components/Designer/src/utils/extensionProperties';
import {
  CONDITIONAL_SOURCES,
  LISTENER_ALLOWED_TYPES,
} from '@/components/Designer/src/config/bpmnEnums';

type ImplementationType =
  | 'dmn'
  | 'connector'
  | 'external'
  | 'class'
  | 'expression'
  | 'delegateExpression'
  | 'script'
  | undefined;

/**
 * 获取节点事件定义
 * @param element
 * @param eventType
 */
export function getEventDefinition(
  element: BpmnElement,
  eventType: string
): ModdleElement | undefined {
  const businessObject = getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];
  return find(eventDefinitions, function (definition: any) {
    return is(definition, eventType);
  });
}

/**
 * 获取消息事件
 * @param element
 */
export function getMessageEventDefinition(element: BpmnElement): ModdleElement | undefined {
  if (is(element, 'bpmn:ReceiveTask')) {
    return getBusinessObject(element);
  }
  return getEventDefinition(element, 'bpmn:MessageEventDefinition');
}

/**
 * 获取定时器事件
 * @param element
 */
export function getTimerEventDefinition(element: BpmnElement): ModdleElement {
  return getEventDefinition(element, 'bpmn:TimerEventDefinition');
}

/**
 * getServiceTaskLikeBusinessObject
 * 获取一个 'ServiceTaskLike' 业务对象。
 * 如果给定的元素不是 'servicetaskLike '，则返回 'false'
 * @param modeler
 * @param element
 */
export function getServiceTaskLikeBusinessObject(modeler: Modeler, element: BpmnElement) {
  if (is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent')) {
    const messageEventDefinition = getMessageEventDefinition(element);
    if (messageEventDefinition) {
      element = messageEventDefinition;
    }
  }
  return isServiceTaskLike(modeler, element) && getBusinessObject(element);
}

/**
 * 获取流程监听器业务对象
 * @param modeler
 * @param businessObject
 */
function getListenerBusinessObject(
  modeler: Modeler,
  businessObject: BpmnElement
): ModdleElement | undefined {
  const prefix = getProcessPrefix(modeler);
  if (isAny(businessObject, [`${prefix}:ExecutionListener`, `${prefix}:TaskListener`])) {
    return businessObject as ModdleElement;
  }
}

/**
 * 返回给定元素的实现类型。
 * 可能的实现类型有:
 * - dmn
 * - connector
 * - external
 * - class
 * - expression
 * - delegateExpression
 * - script
 * - or undefined, when no matching implementation type is found
 * @param modeler
 * @param element
 * @returns
 */
export function getImplementationType(modeler: Modeler, element: BpmnElement): ImplementationType {
  const prefix = getProcessPrefix(modeler);
  const businessObject =
    getListenerBusinessObject(modeler, element) ||
    getServiceTaskLikeBusinessObject(modeler, element);

  if (!businessObject) {
    return;
  }

  if (isDmnCapable(modeler, businessObject)) {
    const decisionRef = businessObject.get(`${prefix}:decisionRef`);
    if (typeof decisionRef !== 'undefined') {
      return 'dmn';
    }
  }

  if (isServiceTaskLike(modeler, businessObject)) {
    const connectors = getExtensionElements(businessObject, `${prefix}:Connector`);
    if (connectors.length) {
      return 'connector';
    }
  }

  if (isExternalCapable(modeler, businessObject)) {
    const type = businessObject.get(`${prefix}:type`);
    if (type === 'external') {
      return 'external';
    }
  }

  const cls = businessObject.get(`${prefix}:class`);
  if (typeof cls !== 'undefined') {
    return 'class';
  }

  const expression = businessObject.get(`${prefix}:expression`);
  if (typeof expression !== 'undefined') {
    return 'expression';
  }

  const delegateExpression = businessObject.get(`${prefix}:delegateExpression`);
  if (typeof delegateExpression !== 'undefined') {
    return 'delegateExpression';
  }

  const script = businessObject.get('script');
  if (typeof script !== 'undefined') {
    return 'script';
  }
}

// ----- 节点类型判断 ----- //

/**
 * 是否服务任务 Check whether an element is ServiceTaskLike 检查元素是否为 'ServiceTaskLike'
 * @param modeler
 * @param element
 */
export function isServiceTaskLike(modeler: Modeler, element: BpmnElement): boolean {
  return is(element, `${getProcessPrefix(modeler)}:ServiceTaskLike`);
}

/**
 * 是否DMN决策任务 Returns 'true' if the given element is 'DmnCapable'
 * @param modeler
 * @param element bpmn元素
 */
export function isDmnCapable(modeler: Modeler, element: BpmnElement): boolean {
  return is(element, `${getProcessPrefix(modeler)}:DmnCapable`);
}

/**
 * 是否外部任务 Returns 'true' if the given element is 'ExternalCapable'
 * @param modeler
 * @param element bpmn元素
 */
export function isExternalCapable(modeler: Modeler, element: BpmnElement): boolean {
  return is(element, `${getProcessPrefix(modeler)}:ExternalCapable`);
}

export function isTimer(element: BpmnElement) {
  return (
    isAny(element, ['bpmn:StartEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']) &&
    notEmpty(getTimerEventDefinition(element))
  );
}

/**
 * 父节点符合条件的连线 <BR/>
 * 检查条件父节点是否符合条件
 * @param element
 */
export function isConditionalSource(element: BpmnElement) {
  return isAny(element, CONDITIONAL_SOURCES);
}

/**
 * 是否是 定义条件的事件 （ 控制变量 Variables 配置 ）  <BR/>
 * 检查元素是否为条件定义相关
 * @param element
 */
export function isConditionEventDefinition(element: BpmnElement): boolean {
  return (
    is(element, 'bpmn:Event') &&
    notEmpty(getEventDefinition(element, 'bpmn:ConditionalEventDefinition'))
  );
}

/**
 * 是否启动事件
 * @param element
 */
export function isExtendStartEvent(element: BpmnElement): boolean {
  return is(element, 'bpmn:StartEvent');
}

/**
 * 是否连接线
 * @param element
 */
export function isConditional(element: BpmnElement): boolean {
  return (
    (is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)) ||
    isConditionEventDefinition(element)
  );
}

/**
 * 是否可分配用户
 * @param modeler
 * @param element
 */
export function isAssignable(modeler: Modeler, element: BpmnElement) {
  const prefix = getProcessPrefix(modeler);
  return is(element, `${prefix}:Assignable`);
}

/**
 * 是否任务
 **/
export function isTaskListener(element: BpmnElement) {
  return is(element, 'bpmn:UserTask');
}

/**
 * 是否任务
 **/
export function isProcess(element: BpmnElement) {
  return is(element, 'bpmn:Process');
}

/**
 * 是否可执行
 * @param element
 */
export function isExecutable(element: BpmnElement) {
  if (isAny(element, LISTENER_ALLOWED_TYPES)) {
    return true;
  }
  if (is(element, 'bpmn:Participant')) {
    return notNull(element.businessObject.processRef);
  }
  return false;
}

export function isCancelActivity(element: BpmnElement) {
  const businessObject = getBusinessObject(element);
  return businessObject && businessObject.cancelActivity !== false;
}

/**
 * 判断是否是默认流转类型
 * @param element bpmn元素
 */
export function isDefaultFlow(element: BpmnElement) {
  const businessObject = getBusinessObject(element);
  const sourceBusinessObject = getBusinessObject(element.source);

  if (!is(element, 'bpmn:SequenceFlow') || !sourceBusinessObject) {
    return false;
  }
  return (
    sourceBusinessObject.default &&
    sourceBusinessObject.default === businessObject &&
    (is(sourceBusinessObject, 'bpmn:Gateway') || is(sourceBusinessObject, 'bpmn:Activity'))
  );
}

/**
 * 判断是否是条件流转类型
 * @param element bpmn元素
 */
export function isConditionalFlow(element: BpmnElement) {
  const businessObject = getBusinessObject(element);
  const sourceBusinessObject = getBusinessObject(element.source);
  if (!is(element, 'bpmn:SequenceFlow') || !sourceBusinessObject) {
    return false;
  }
  return businessObject.conditionExpression && is(sourceBusinessObject, 'bpmn:Activity');
}

/**
 * 获取是否为异步延续
 * @param modeler
 * @param element
 */
export function isAsynchronous(modeler: Modeler, element: BpmnElement): boolean {
  const prefix = getProcessPrefix(modeler);
  return is(element, `${prefix}:AsyncCapable`);
}

/**
 * 检查是否为异步前 <BR/>
 * Returns true if the attribute 'asyncBefore' is set to true.
 * @param bo
 * @param prefix
 */
export function isAsyncBefore(bo: ModdleElement, prefix: string): boolean {
  return !!(bo.get(`${prefix}:asyncBefore`) || bo.get(`${prefix}:async`));
}

/**
 * 检查是否为异步后 <BR/>
 * Returns true if the attribute 'asyncAfter' is set to true.
 * @param bo
 * @param prefix
 */
export function isAsyncAfter(bo: ModdleElement, prefix: string): boolean {
  return !!bo.get(`${prefix}:asyncAfter`);
}

/**
 * 检查是否排他（单独执行）<BR/>
 * Returns true if the attribute 'exclusive' is set to true.
 * @param bo
 * @param prefix
 */
export function isExclusive(bo: ModdleElement, prefix: string): boolean {
  return !!bo.get(`${prefix}:exclusive`);
}

/**
 * 是否异步
 * @param bo
 * @param prefix
 */
export function isAsync(bo: ModdleElement, prefix: string): boolean {
  return isAsyncAfter(bo, prefix) || isAsyncBefore(bo, prefix);
}
