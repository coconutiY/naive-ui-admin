import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import { ListenersForm, ThrowEventForm } from '/#/bpmn/bpmn-moddle/bpmn-form';
import Modeler from 'bpmn-js/lib/Modeler';
import {
  createElement,
  getModdle,
  getModeling,
  getProcessPrefix,
} from '@/components/Designer/src/utils/tools';
import { without } from 'min-dash';
import { BpmnField } from '/#/bpmn/bpmn-moddle/bpmn-instance';
import {
  addExtensionElements,
  getExtensionElements,
  removeExtensionElements,
} from '@/components/Designer/src/utils/extensionProperties';

/**
 * 获取监听器容器
 * @param element
 */
export function getListenersContainer(element: BpmnElement): ModdleElement {
  const businessObject = getBusinessObject(element);
  return businessObject?.get('processRef') || businessObject;
}

//--- 全局事件 -----//

/**
 * 根据事件类型获取事件
 * @param modeler
 * @param suffix 对应的消息类型
 */
export function getGlobalEvents(
  modeler: Modeler,
  suffix: 'Signal' | 'Escalation' | 'Error' | 'Message'
): ModdleElement[] {
  const definitions = modeler.getDefinitions();
  return getGlobalEventsList(definitions, suffix);
}

function getGlobalEventsList(
  definitions: ModdleElement,
  suffix: 'Signal' | 'Escalation' | 'Error' | 'Message'
): ModdleElement[] {
  const events = filterElementsByType(definitions.rootElements, `bpmn:${suffix}`);
  if (!events) {
    return [];
  }
  return events;
}

/**
 * 添加事件
 * @param modeler
 * @param element
 * @param suffix
 * @param eventForm
 */
export function addGlobalEvent(
  modeler: Modeler,
  element: BpmnElement | undefined,
  suffix: 'Signal' | 'Escalation' | 'Error' | 'Message',
  eventForm: ThrowEventForm
) {
  if (!element) {
    return;
  }
  const modeling = getModeling(modeler);
  const root = modeler.getDefinitions();
  const eventProp = getEventProps(eventForm, suffix);
  const newEvent = createElement(modeler, `bpmn:${suffix}`, { ...eventProp }, root);
  modeling.updateModdleProperties(element, root, {
    rootElements: [...root.get('rootElements'), newEvent],
  });
}

/**
 * 移除事件
 * @param modeler
 * @param element
 * @param props
 */
export function removeGlobalEvent(modeler: Modeler, element: BpmnElement, props: ModdleElement) {
  const modeling = getModeling(modeler);
  const businessObject = getBusinessObject(element);
  const root = businessObject && businessObject.$parent;
  const newData = without(root.rootElements, props);
  modeling.updateModdleProperties(element, root, { rootElements: newData });
}

/**
 * 编辑事件
 * @param modeler 画布对象
 * @param element 需要修改的事件
 * @param props  事件对象
 */
export function editGlobalEvent(
  modeler: Modeler,
  element: ModdleElement | undefined,
  props: ThrowEventForm
) {
  if (!element) {
    return;
  }
  const modeling = getModeling(modeler);
  const businessObject = getBusinessObject(element);
  const eventProps = getEventProps(props, props.type);
  modeling.updateModdleProperties(element, businessObject, { ...eventProps });
}

/**
 * 获取消息的标签属性
 * @param eventForm
 * @param suffix
 */
function getEventProps(
  eventForm: ThrowEventForm,
  suffix: 'Signal' | 'Escalation' | 'Error' | 'Message'
) {
  switch (suffix) {
    case 'Signal':
      return {
        id: eventForm.id,
        name: eventForm.name,
        scope: eventForm.scope,
      };
    case 'Escalation':
      return {
        id: eventForm.id,
        name: eventForm.name,
        escalationCode: eventForm.escalationCode,
      };
    case 'Error':
      return {
        id: eventForm.id,
        name: eventForm.name,
        errorCode: eventForm.errorCode,
      };
    default:
      return {
        id: eventForm.id,
        name: eventForm.name,
      };
  }
}

/**
 * 根据标签名称获取元素
 * @param objectList
 * @param type
 */
function filterElementsByType(objectList: ModdleElement[], type: string) {
  const list = objectList || [];
  return list.filter((element) => is(element, type));
}

//--- 执行监听器 ExecutionalListeners -----//

const EXECUTIONAL_SUFFIX = 'ExecutionListener';

/**
 * 获取执行监听器列表 execution listener list
 * @param modeler
 * @param element
 */
export function getExecutionListeners(modeler: Modeler, element: BpmnElement): ModdleElement[] {
  const prefix = getProcessPrefix(modeler);
  const businessObject = getListenersContainer(element);
  return getExtensionElements(businessObject, `${prefix}:${EXECUTIONAL_SUFFIX}`);
}

/**
 * 创建一个新的执行监听器并且修改元素的业务对象 《BR/>
 * create an empty execution listener and update element's businessObject
 * @param modeler
 * @param element
 */
export function addEmptyExtensionListener(modeler: Modeler, element: BpmnElement) {
  const prefix = getProcessPrefix(modeler);
  const moddle = getModdle(modeler);
  const listener = moddle!.create(`${prefix}:${EXECUTIONAL_SUFFIX}`, {
    event: getDefaultEvent(element),
    class: '',
  });
  const businessObject = getListenersContainer(element);
  addExtensionElements(modeler, element, businessObject, listener);
}

/**
 * 根据props创建一个执行监听器
 * @param modeler
 * @param element
 * @param props
 */
export function addExecutionListener(modeler: Modeler, element: BpmnElement, props: ListenersForm) {
  const prefix = getProcessPrefix(modeler);
  const moddle = getModdle(modeler);
  const businessObject = getListenersContainer(element);
  const listener = moddle!.create(`${prefix}:${EXECUTIONAL_SUFFIX}`, {});
  updateListenerProperty(modeler, element, listener, props);
  addExtensionElements(modeler, element, businessObject, listener);
}

/**
 * 修改执行监听器的属性
 * @param modeler
 * @param element
 * @param props
 * @param listener
 */
export function updateExecutionListener(
  modeler: Modeler,
  element: BpmnElement,
  props: ListenersForm,
  listener: ModdleElement
) {
  removeExtensionElements(modeler, element, getListenersContainer(element), listener);
  addExecutionListener(modeler, element, props);
}

/**
 * 单个移除执行监听器
 * @param modeler
 * @param element
 * @param listener
 */
export function removeExecutionListener(
  modeler: Modeler,
  element: BpmnElement,
  listener: ModdleElement
) {
  removeExtensionElements(modeler, element, getListenersContainer(element), listener);
}

/**
 * 获取监听器类型
 * @param modeler
 * @param listener
 */
export function getExecutionListenerType(modeler: Modeler, listener: ModdleElement) {
  return getListenerType(modeler, listener, EXECUTIONAL_SUFFIX);
}

/**
 * 获取默认事件类型
 * @param element
 */
export function getDefaultEvent(element: BpmnElement) {
  return is(element, 'bpmn:SequenceFlow') ? 'take' : 'start';
}

//--- 执行监听器 TaskListeners -----//

const TASK_SUFFIX = 'TaskListener';

/**
 * 获取任务监听器列表 task listener list
 * @param modeler
 * @param element
 */
export function getTaskListeners(modeler: Modeler, element: BpmnElement): ModdleElement[] {
  const prefix = getProcessPrefix(modeler);
  const businessObject = getListenersContainer(element);
  return getExtensionElements(businessObject, `${prefix}:${TASK_SUFFIX}`);
}

/**
 * 根据props创建一个任务监听器
 * @param modeler
 * @param element
 * @param props
 */
export function addTaskListener(modeler: Modeler, element: BpmnElement, props: ListenersForm) {
  const prefix = getProcessPrefix(modeler);
  const moddle = getModdle(modeler);
  const businessObject = getListenersContainer(element);
  const listener = moddle.create(`${prefix}:${TASK_SUFFIX}`, {});
  updateListenerProperty(modeler, element, listener, props);
  addExtensionElements(modeler, element, businessObject, listener);
}

/**
 * 修改任务监听器的属性
 * @param modeler
 * @param element
 * @param props
 * @param listener
 */
export function updateTaskListener(
  modeler: Modeler,
  element: BpmnElement,
  props: ListenersForm,
  listener: ModdleElement
) {
  removeExtensionElements(modeler, element, getListenersContainer(element), listener);
  addTaskListener(modeler, element, props);
}

//--- 通用 Common -----//
/**
 * 更新执行/任务监听器属性
 * @param modeler
 * @param element
 * @param listener
 * @param props
 */
export function updateListenerProperty(
  modeler: Modeler,
  element: BpmnElement,
  listener: ModdleElement,
  props: ListenersForm
) {
  const modeling = getModeling(modeler);
  const prefix = getProcessPrefix(modeler);
  const { event, type, value, fields } = props;
  const properties = { event: event };
  if (type === 'class') {
    properties[`${prefix}:class`] = value;
  } else if (type === 'expression') {
    properties[`${prefix}:expression`] = value;
  } else if (type === 'delegateExpression') {
    properties[`${prefix}:delegateExpression`] = value;
  }
  if (fields) {
    properties[`fields`] = fields.map((field: BpmnField) => {
      return createField(modeler, field);
    });
  }
  modeling.updateModdleProperties(element, listener, properties);
}

/**
 * 创建 监听器的注入字段 实例
 * @param modeler
 * @param field
 */
export function createField(modeler: Modeler, field: BpmnField) {
  const moddle = getModdle(modeler);
  const prefix = getProcessPrefix(modeler);
  const { name, fieldType, string, expression } = field;
  const fieldConfig = fieldType === 'string' ? { name, string } : { name, expression };
  return moddle!.create(`${prefix}:Field`, fieldConfig);
}

/**
 * 获取监听器类型
 * @param modeler
 * @param listener
 * @param suffix
 */
export function getListenerType(
  modeler: Modeler,
  listener: ModdleElement,
  suffix: 'ExecutionListener' | 'TaskListener'
) {
  const prefix = getProcessPrefix(modeler);
  if (isAny(listener, [`${prefix}:${suffix}`])) {
    if (listener.get(`${prefix}:class`)) return 'class';
    if (listener.get(`${prefix}:expression`)) return 'expression';
    if (listener.get(`${prefix}:delegateExpression`)) return 'delegateExpression';
    if (listener.get('script')) return 'script';
  }
  return '';
}

/**
 * 单个移除(执行/任务)监听器
 * @param modeler
 * @param element
 * @param listener
 */
export function removeListener(modeler: Modeler, element: BpmnElement, listener: ModdleElement) {
  removeExtensionElements(modeler, element, getListenersContainer(element), listener);
}
