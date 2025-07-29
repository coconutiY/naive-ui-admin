import { Base } from 'diagram-js/lib/model';
import { isAny, is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getModeling } from '@/components/Designer/src/utils/tools';
import { getEventDefinition, getProcessPrefix } from '@/components/Designer/src/utils/implType';
import Modeler from 'bpmn-js/lib/Modeler';
import { Connection } from 'diagram-js/lib/model/Types';
import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { createModdleElement } from '@/components/Designer/src/utils/baseInfo';

/**
 * 配置项可见性 <BR/>
 * 在下列元素中可见
 */
const CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway',
];
const defaultConditionTypeOptions: Record<string, string>[] = [
  { label: '无条件( None )', value: 'none' },
  { label: '默认路径( Default )', value: 'default' },
  { label: '条件表达式( Expression )', value: 'expression' },
  { label: '条件脚本( Script )', value: 'script' },
];

/**
 * 父节点符合条件的连线 <BR/>
 * 检查条件父节点是否符合条件
 * @param element
 */
export function isConditionalSource(element: Base) {
  return isAny(element, CONDITIONAL_SOURCES);
}

/**
 * 是否是 定义条件的事件 （ 控制变量 Variables 配置 ）  <BR/>
 * 检查元素是否为条件定义相关
 * @param element
 */
export function isConditionEventDefinition(element: Base): boolean {
  return (
    is(element, 'bpmn:Event') && !!getEventDefinition(element, 'bpmn:ConditionalEventDefinition')
  );
}

/**
 * 是否启动事件
 * @param element
 */
export function isExtendStartEvent(element: Base): boolean {
  return is(element, 'bpmn:StartEvent');
}

/**
 * 是否连接线
 * @param element
 */
export function isCanbeConditional(element: Base): boolean {
  // return (is(element, 'bpmn:SequenceFlow') && isConditionalSource((element as ConnectionLike)?.source)) || isConditionEventDefinition(element);
  return (
    (is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)) ||
    isConditionEventDefinition(element)
  );
}

// 1. 条件变量部分
/**
 * 获取条件变量的值
 * @param element
 */
export function getVariableNameValue(element: Base) {
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
export function setVariableNameValue(modeler: Modeler, element: Base, value: string | undefined) {
  const modeling = getModeling(modeler);
  const eventDefinition = getConditionalEventDefinition(element);
  if (eventDefinition && modeling) {
    modeling.updateModdleProperties(element, eventDefinition, { variableName: value || '' });
  }
}

// 2. 条件事件部分
/**
 * 获取条件事件的值
 * @param element
 */
export function getVariableEventsValue(element: Base) {
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
export function setVariableEventsValue(modeler: Modeler, element: Base, value: string | undefined) {
  const modeling = getModeling(modeler);
  const eventDefinition = getConditionalEventDefinition(element);
  if (eventDefinition && modeling) {
    modeling.updateModdleProperties(element, eventDefinition, { variableName: value || '' });
  }
}

// 3. 元素条件类型
/**
 * 获取元素条件的值
 * @param element
 */
export function getConditionTypeValue(element: Base): string {
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
export function setConditionTypeValue(modeler: Modeler, element: Base | any, value: string) {
  if (!value || value === 'none' || value === 'default') {
    updateCondition(modeler, element);
    return setDefaultCondition(modeler, element as Connection, value === 'default');
  }
  const attributes = {
    // body: '',
    language: value === 'script' ? '' : undefined,
  };
  const parent = is(element, 'bpmn:SequenceFlow')
    ? getBusinessObject(element)
    : (getConditionalEventDefinition(element) as ModdleElement);
  const formalExpressionElement = createModdleElement(
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
export function getConditionExpressionValue(element: Base): string | undefined {
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
  element: Base,
  body: string | undefined
) {
  const parent = is(element, 'bpmn:SequenceFlow')
    ? getBusinessObject(element)
    : (getConditionalEventDefinition(element) as ModdleElement);
  const formalExpressionElement = createModdleElement(
    modeler,
    'bpmn:FormalExpression',
    { body },
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
export function getConditionScriptTypeValue(modeler: Modeler, element: Base): string | undefined {
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
  element: Base,
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

// 6. 元素脚本 语言类型
/**
 * 获取脚本语言类型的值
 * @param element
 */
export function getConditionScriptLanguageValue(element: Base): string | undefined {
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
  element: any,
  value: string | undefined
) {
  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, getConditionExpression(element)!, { language: value });
}

// 7. 元素脚本 body
/**
 * 获取元素脚本的值
 * @param element
 */
export const getConditionScriptBodyValue = (element: Base): string | undefined => {
  return getConditionExpression(element)?.get('body');
};

/**
 * 设置元素脚本的值
 * @param modeler
 * @param element
 * @param value
 */
export function setConditionScriptBodyValue(
  modeler: Modeler,
  element: Base,
  value: string | undefined
) {
  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, getConditionExpression(element)!, { body: value });
}

// 8. 元素脚本 source
/**
 * 获取元素脚本来源的值
 * @param modeler
 * @param element
 */
export function getConditionScriptResourceValue(
  modeler: Modeler,
  element: Base
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
  element: any,
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
export function getConditionTypeOptions(element: Base): Record<string, string>[] {
  if (is(element, 'bpmn:SequenceFlow')) {
    return defaultConditionTypeOptions;
  }
  return defaultConditionTypeOptions.filter((condition) => condition.value !== 'default');
}

/**
 * 获取条件事件定义
 * @param element
 */
function getConditionalEventDefinition(
  element: Base | ModdleElement
): ModdleElement | false | undefined {
  return !is(element, 'bpmn:Event')
    ? false
    : getEventDefinition(element, 'bpmn:ConditionalEventDefinition');
}

/**
 * 获取给定元素的条件表达式的值
 * @param element
 */
function getConditionExpression(element: Base | ModdleElement): ModdleElement | undefined {
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
function updateCondition(modeler: Modeler, element: Base, condition?: string | ModdleElement) {
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
function setDefaultCondition(modeler: Modeler, element: Connection, isDefault: boolean) {
  const modeling = getModeling(modeler);
  modeling.updateProperties(element.source, { default: isDefault ? element : undefined });
}
