import Modeler from 'bpmn-js/lib/Modeler';
import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { find } from 'min-dash';
import { is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject, notEmpty } from '@/components/Designer/src/utils/tools';
import { getExtensionElements } from '@/components/Designer/src/utils/extensionProperties';

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
 * 获取流程内属性活标签前缀（根据流程引擎决定）
 * @param modeler 模型（导入xml后才能有值，否则为undefined）
 */
export function getProcessPrefix(modeler: Modeler): string {
  return modeler.getDefinitions().targetNamespace;
}

///////////////////////////////////////////// bpmn 基础类方法

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
 * 获取节点消息事件
 * @param element
 */
export function getMessageEventDefinition(element: BpmnElement): ModdleElement | undefined {
  if (is(element, 'bpmn:ReceiveTask')) {
    return getBusinessObject(element);
  }
  return getEventDefinition(element, 'bpmn:MessageEventDefinition');
}

//bpmn 根据流程引擎的扩展方法
/**
 * 是否服务任务 Check whether an element is ServiceTaskLike 检查元素是否为 'ServiceTaskLike'
 * @param element
 */
export function isServiceTaskLike(element: BpmnElement): boolean {
  return is(element, `${getProcessPrefix}:ServiceTaskLike`);
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

export function isTimerSupported(element: BpmnElement) {
  return (
    isAny(element, ['bpmn:StartEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']) &&
    notEmpty(getTimerEventDefinition(element))
  );
}

export function getTimerEventDefinition(element: BpmnElement): ModdleElement {
  return getEventDefinition(element, 'bpmn:TimerEventDefinition');
}

/**
 * getServiceTaskLikeBusinessObject
 * 获取一个 'ServiceTaskLike' 业务对象。
 * 如果给定的元素不是 'servicetaskLike '，则返回 'false'
 * @param element
 */
export function getServiceTaskLikeBusinessObject(element: BpmnElement): ModdleElement | false {
  if (is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent')) {
    const messageEventDefinition = getMessageEventDefinition(element);
    if (messageEventDefinition) {
      element = messageEventDefinition;
    }
  }
  return isServiceTaskLike(element) && getBusinessObject(element);
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
    getListenerBusinessObject(modeler, element) || getServiceTaskLikeBusinessObject(element);

  if (!businessObject) {
    return;
  }

  if (isDmnCapable(modeler, businessObject)) {
    const decisionRef = businessObject.get(`${prefix}:decisionRef`);
    if (typeof decisionRef !== 'undefined') {
      return 'dmn';
    }
  }

  if (isServiceTaskLike(businessObject)) {
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
