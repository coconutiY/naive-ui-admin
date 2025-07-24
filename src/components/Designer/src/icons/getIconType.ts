import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { isEventSubProcess, isExpanded, isInterrupting } from 'bpmn-js/lib/util/DiUtil';
import { isPlane } from 'bpmn-js/lib/util/DrilldownUtil';
import { Base } from 'diagram-js/lib/model';

export default function getBpmnIconType(element: Base): string {
  // const { type: elementType } = element;

  let elementType: string;
  if (element.type === 'label') {
    const businessObject = getBusinessObject(element);
    elementType = businessObject.$type;
  } else {
    elementType = element.type;
  }

  let type = getRawType(elementType);

  /**
   * 事件定义类型
   */
  const eventDefinition = getEventDefinition(element);

  if (eventDefinition) {
    type = `${getEventDefinitionPrefix(eventDefinition)}${type}`;

    // (1.1) interrupting / non interrupting
    if (
      (is(element, 'bpmn:StartEvent') && !isInterrupting(element)) ||
      (is(element, 'bpmn:BoundaryEvent') && !isCancelActivity(element))
    ) {
      type = `${type}NonInterrupting`;
    }

    return type;
  }

  /**
   * 子流程类型
   */
  if (is(element, 'bpmn:SubProcess') && !is(element, 'bpmn:Transaction')) {
    if (isEventSubProcess(element)) {
      type = `Event${type}`;
    } else {
      const expanded = isExpanded(element) && !isPlane(element);
      type = `${expanded ? 'Expanded' : 'Collapsed'}${type}`;
    }
  }

  /**
   * 条件流转和默认流转
   */
  if (isDefaultFlow(element)) {
    type = 'DefaultFlow';
  }

  if (isConditionalFlow(element)) {
    type = 'ConditionalFlow';
  }

  return type;
}

const getRawType = (type: string) => {
  return type.split(':')[1];
};

const getEventDefinition = (element: Base) => {
  const businessObject = getBusinessObject(element),
    eventDefinitions = businessObject.eventDefinitions;

  return eventDefinitions && eventDefinitions[0];
};
const getEventDefinitionPrefix = (eventDefinition: Base) => {
  const rawType = getRawType(eventDefinition.$type);
  return rawType.replace('EventDefinition', '');
};
const isCancelActivity = (element: Base) => {
  const businessObject = getBusinessObject(element);
  return businessObject && businessObject.cancelActivity !== false;
};

/**
 * 判断是否是默认流转类型
 * @param element bpmn元素
 */
const isDefaultFlow = (element: Base) => {
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
};

/**
 * 判断是否是条件流转类型
 * @param element bpmn元素
 */
const isConditionalFlow = (element: Base) => {
  const businessObject = getBusinessObject(element);
  const sourceBusinessObject = getBusinessObject(element.source);
  if (!is(element, 'bpmn:SequenceFlow') || !sourceBusinessObject) {
    return false;
  }
  return businessObject.conditionExpression && is(sourceBusinessObject, 'bpmn:Activity');
};
