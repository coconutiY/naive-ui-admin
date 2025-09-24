import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import {
  createElement,
  getModeling,
  getProcessPrefix,
} from '@/components/Designer/src/utils/tools';
import { getEventDefinition } from '@/components/Designer/src/utils/implType';
import Modeler from 'bpmn-js/lib/Modeler';
import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { defaultConditionTypeOptions } from '@/components/Designer/src/config/selectOptions';

// 1. 条件变量部分
/**
 * 获取条件变量的值
 * @param element
 */
export function getVariableNameValue(element: BpmnElement) {
  if (getConditionalEventDefinition(element)) {
    return getConditionalEventDefinition(element).get('variableName');
  }
}

/**
 * 设置条件变量的值
 * @param modeler
 * @param element
 * @param value
 */
export function setVariableNameValue(
  modeler: Modeler,
  element: BpmnElement,
  value: string | undefined
) {
  const modeling = getModeling(modeler);
  const eventDefinition = getConditionalEventDefinition(element);
  if (eventDefinition && modeling) {
    modeling.updateModdleProperties(element, eventDefinition, { variableName: value || '' });
  }
}

//  条件事件部分
/**
 * 获取条件事件的值
 * @param element
 */
export function getVariableEventsValue(element: BpmnElement) {
  if (getConditionalEventDefinition(element)) {
    return getConditionalEventDefinition(element).get('variableEvents');
  }
}

/**
 * 设置条件事件的值
 * @param modeler
 * @param element
 * @param value
 */
export function setVariableEventsValue(
  modeler: Modeler,
  element: BpmnElement,
  value: string | undefined
) {
  const modeling = getModeling(modeler);
  const eventDefinition = getConditionalEventDefinition(element);
  if (eventDefinition && modeling) {
    modeling.updateModdleProperties(element, eventDefinition, { variableName: value || '' });
  }
}

//  元素条件类型
/**
 * 获取元素条件的值
 * @param element
 */
export function getConditionTypeValue(element: BpmnElement): string {
  const conditionExpression = getConditionExpression(element);
  if (conditionExpression) {
    return conditionExpression.get('language') === undefined ? 'expression' : 'script';
  }
  if (element?.source?.businessObject?.default === element.businessObject) {
    return 'default';
  }
  return 'none';
}

/**
 * 获取条件事件的值
 * @param modeler
 * @param element
 * @param value
 */
export function setConditionTypeValue(modeler: Modeler, element: BpmnElement, value: string) {
  if (!value || value === 'none' || value === 'default') {
    updateCondition(modeler, element);
    return setDefaultCondition(modeler, element, value === 'default');
  }
  const attributes = {
    // body: '',
    language: value === 'script' ? '' : undefined,
  };
  const parent = is(element, 'bpmn:SequenceFlow')
    ? getBusinessObject(element)
    : getConditionalEventDefinition(element);
  const formalExpressionElement = createElement(
    modeler,
    'bpmn:FormalExpression',
    attributes,
    parent
  );
  updateCondition(modeler, element, formalExpressionElement);
}

// 4. 元素条件表达式
/**
 * 获取条件表达式的值
 * @param element
 */
export function getConditionExpressionValue(element: BpmnElement): string | undefined {
  const conditionExpression = getConditionExpression(element);
  if (conditionExpression) {
    return conditionExpression.get('body');
  }
}

/**
 * 设置条件表达式的值
 * @param modeler
 * @param element
 * @param body
 */
export function setConditionExpressionValue(
  modeler: Modeler,
  element: BpmnElement,
  body: string | undefined
) {
  const parent = is(element, 'bpmn:SequenceFlow')
    ? getBusinessObject(element)
    : getConditionalEventDefinition(element);
  const formalExpressionElement = createElement(
    modeler,
    'bpmn:FormalExpression',
    { body: `\$\{${body}\}` },
    parent
  );
  updateCondition(modeler, element, formalExpressionElement);
}

// 5. 元素脚本来源类型
/**
 * 获取脚本来源的值
 * @param modeler
 * @param element
 */
export function getConditionScriptTypeValue(
  modeler: Modeler,
  element: BpmnElement
): string | undefined {
  const prefix = getProcessPrefix(modeler);
  const conditionExpression = getConditionExpression(element)!;
  console.log(conditionExpression);
  if (conditionExpression.get('body') !== undefined) return 'inline';
  if (conditionExpression.get(`${prefix}:resource`) !== undefined) return 'external';
  return 'none';
}

/**
 * 设置脚本来源的值
 * @param modeler
 * @param element
 * @param value
 */
export function setConditionScriptTypeValue(
  modeler: Modeler,
  element: BpmnElement,
  value: string | undefined
) {
  const prefix = getProcessPrefix(modeler);
  const modeling = getModeling(modeler);
  let props;
  if (!value || value === 'none') {
    props = { body: undefined, [`${prefix}:resource`]: undefined };
  }
  if (value === 'inline') {
    props = { body: '', [`${prefix}:resource`]: undefined };
  }
  if (value === 'external') {
    props = { body: undefined, [`${prefix}:resource`]: '' };
  }
  modeling.updateModdleProperties(element, getConditionExpression(element)!, props);
}

// 元素脚本 语言类型
/**
 * 获取脚本语言类型的值
 * @param element
 */
export function getConditionScriptLanguageValue(element: BpmnElement): string | undefined {
  return getConditionExpression(element)?.get('language');
}

/**
 * 设置脚本语言类型的值
 * @param modeler
 * @param element
 * @param value
 */
export function setConditionScriptLanguageValue(
  modeler: Modeler,
  element: BpmnElement,
  value: string | undefined
) {
  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, getConditionExpression(element)!, { language: value });
}

//  元素脚本 body
/**
 * 获取元素脚本的值
 * @param element
 */
export function getConditionScriptBodyValue(element: BpmnElement): string | undefined {
  return getConditionExpression(element)?.get('body');
}

/**
 * 设置元素脚本的值
 * @param modeler
 * @param element
 * @param value
 */
export function setConditionScriptBodyValue(
  modeler: Modeler,
  element: BpmnElement,
  value: string | undefined
) {
  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, getConditionExpression(element)!, { body: value });
}

// 元素脚本 source
/**
 * 获取元素脚本来源的值
 * @param modeler
 * @param element
 */
export function getConditionScriptResourceValue(
  modeler: Modeler,
  element: BpmnElement
): string | undefined {
  const prefix = getProcessPrefix(modeler);
  return getConditionExpression(element)?.get(`${prefix}:resource`);
}

/**
 * 设置元素脚本来源的值
 * @param modeler
 * @param element
 * @param value
 */
export function setConditionScriptResourceValue(
  modeler: Modeler,
  element: BpmnElement,
  value: string | undefined
) {
  const modeling = getModeling(modeler);
  const prefix = getProcessPrefix(modeler);
  modeling.updateModdleProperties(element, getConditionExpression(element)!, {
    [`${prefix}:resource`]: value,
  });
}

///////// helpers
/**
 * 获取事件的条件定义选项
 * @param element
 */
export function getConditionTypeOptions(element: BpmnElement): Record<string, string>[] {
  if (is(element, 'bpmn:SequenceFlow')) {
    return defaultConditionTypeOptions;
  }
  return defaultConditionTypeOptions.filter((condition) => condition.value !== 'default');
}

/**
 * 获取条件事件定义
 * @param element
 */
function getConditionalEventDefinition(element: BpmnElement): ModdleElement | false | undefined {
  return !is(element, 'bpmn:Event')
    ? false
    : getEventDefinition(element, 'bpmn:ConditionalEventDefinition');
}

/**
 * 获取给定元素的条件表达式的值
 * @param element
 */
function getConditionExpression(element: BpmnElement): ModdleElement | undefined {
  const businessObject = getBusinessObject(element);
  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression');
  }
  if (getConditionalEventDefinition(businessObject)) {
    return (getConditionalEventDefinition(businessObject) as ModdleElement).get('condition');
  }
}

/**
 * 更新条件
 * @param modeler
 * @param element
 * @param condition
 */
function updateCondition(
  modeler: Modeler,
  element: BpmnElement,
  condition?: string | ModdleElement
) {
  const modeling = getModeling(modeler);
  if (is(element, 'bpmn:SequenceFlow')) {
    modeling.updateProperties(element, { conditionExpression: condition });
  } else {
    modeling.updateModdleProperties(element, getConditionalEventDefinition(element), {
      condition,
    });
  }
}

/**
 * 设置默认条件
 * @param modeler
 * @param element
 * @param isDefault
 */
function setDefaultCondition(modeler: Modeler, element: BpmnElement, isDefault: boolean) {
  const modeling = getModeling(modeler);
  console.log('source', element.source);
  console.log('default', element);
  modeling.updateProperties(element.source, { default: isDefault ? element : undefined });
}
