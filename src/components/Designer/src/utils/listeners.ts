import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { Base } from 'diagram-js/lib/model';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { EventListenerForm, ThrowEventForm } from '/#/bpmn/bpmn-moddle/bpmn-form';
import Modeler from 'bpmn-js/lib/Modeler';
import { getProcessPrefix } from '@/components/Designer/src/utils/implType';
import { getModdle, getModeling } from '@/components/Designer/src/utils/tools';
import { without } from 'min-dash';
import {
  addExtensionElements,
  createModdleElement,
  getExtensionElementsList,
} from '@/components/Designer/src/utils/baseInfo';

/**
 * 获取事件监听器列表 execution listener list
 * @param modeler
 * @param element
 */
export function getExecutionListeners(modeler: Modeler, element: Base): ModdleElement[] {
  const prefix = getProcessPrefix(modeler);
  const businessObject = getListenersContainer(element);
  return getExtensionElementsList(businessObject, `${prefix}:EventListener `);
}

/**
 * 创建一个新的事件监听器并且修改元素的业务对象 《BR/>
 * create an empty execution listener and update element's businessObject
 * @param modeler
 * @param element
 */
export function addEmptyExtensionListener(modeler: Modeler, element: Base) {
  const prefix = getProcessPrefix(modeler);
  const moddle = getModdle(modeler);
  if (!moddle) {
    return;
  }
  const listener = moddle.create(`${prefix}:ExecutionListener`, {
    event: getDefaultEvent(element),
    class: '',
  });
  const businessObject = getListenersContainer(element);
  addExtensionElements(modeler, element, businessObject, listener);
}

/**
 * 根据props创建一个事件监听器
 * @param modeler
 * @param element
 * @param props
 */
export function addEventListener(modeler: Modeler, element: Base, props: EventListenerForm) {
  const prefix = getProcessPrefix(modeler);
  const moddle = getModdle(modeler);
  const businessObject = getListenersContainer(element);
  const listener = moddle!.create(`${prefix}:EventListener`, {});
  console.log(props, 'props');
  updateListenerProperty(modeler, element, listener, props);
  addExtensionElements(modeler, element, businessObject, listener);
}

/**
 * 获取默认事件
 * @param element
 */
export function getDefaultEvent(element: Base) {
  return is(element, 'bpmn:SequenceFlow') ? 'take' : 'start';
}

/**
 * 更新监听器属性
 * @param modeler
 * @param element
 * @param listener
 * @param props
 */
function updateListenerProperty(
  modeler: Modeler,
  element: Base,
  listener: ModdleElement,
  props: EventListenerForm
) {
  const modeling = getModeling(modeler);
  const prefix = getProcessPrefix(modeler);
  const {
    event,
    class: listenerClass,
    delegateExpression,
    entityType,
    throwEvent,
    signalName,
    messageName,
    errorCode,
  } = props;

  function updateProperty(key: string, value: string) {
    modeling?.updateModdleProperties(element, listener, { [`${prefix}:${key}`]: value });
  }
  event && updateProperty('event', event);
  listenerClass && updateProperty('class', listenerClass);
  delegateExpression && updateProperty('delegateExpression', delegateExpression);
  entityType && updateProperty('entityType', entityType);
  throwEvent && updateProperty('throwEvent', throwEvent);
  signalName && updateProperty('signalName', signalName);
  messageName && updateProperty('messageName', messageName);
  errorCode && updateProperty('errorCode', errorCode);
}

/**
 * 获取监听器容器
 * @param element
 */
export function getListenersContainer(element: Base): ModdleElement {
  const businessObject = getBusinessObject(element);
  return businessObject?.get('processRef') || businessObject;
}

//--- 全局事件 -----//

/**
 * 根据事件类型获取事件
 * @param element 当前panel选中的bpmn元素
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
  element: Base | undefined,
  suffix: 'Signal' | 'Escalation' | 'Error' | 'Message',
  eventForm: ThrowEventForm
) {
  if (!element) {
    return;
  }
  const modeling = getModeling(modeler);
  const root = modeler.getDefinitions();
  const eventProp = getEventProps(eventForm, suffix);
  const newEvent = createModdleElement(modeler, `bpmn:${suffix}`, { ...eventProp }, root);
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
export function removeGlobalEvent(modeler: Modeler, element: Base, props: ModdleElement) {
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
