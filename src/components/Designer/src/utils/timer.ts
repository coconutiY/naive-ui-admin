import { getBusinessObject, getModdle, getModeling } from '@/components/Designer/src/utils/tools';
import { getTimerEventDefinition } from '@/components/Designer/src/utils/implType';
import Modeler from 'bpmn-js/lib/Modeler';
import { Moddle, ModdleElement } from 'bpmn-js/lib/model/Types';

/**
 * 获取定时器内部标签名称 <BR />
 * 1、timeDate 日期<BR />
 * 2、timeDuration 持续<BR />
 * 3、timeCycle 循环<BR />
 * @param element
 */
export function getTimerType(element: BpmnElement) {
  const businessObject = getBusinessObject(element);
  const timerEventDefinition = getTimerEventDefinition(businessObject);
  return getTimerDefinitionType(timerEventDefinition);
}

/**
 * 设置定时器内部标签名称 <BR />
 * 1、timeDate 日期<BR />
 * 2、timeDuration 持续<BR />
 * 3、timeCycle 循环<BR />
 * @param modeler
 * @param element
 * @param value
 */
export function setTimerType(modeler: Modeler, element: BpmnElement, value: string) {
  const modeling = getModeling(modeler);
  const moddle = getModdle(modeler);
  const businessObject = getBusinessObject(element);
  const timerEventDefinition = getTimerEventDefinition(businessObject);
  console.log('timerEventDefinition', timerEventDefinition);
  const timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);
  if (value === timerEventDefinitionType) {
    return;
  }
  const formalExpression = createTimerFormalExpression(moddle, timerEventDefinition);
  const newProps: Record<string, ModdleElement | undefined> = {
    timeDuration: undefined,
    timeDate: undefined,
    timeCycle: undefined,
  };
  if (value) {
    newProps[value] = formalExpression;
  }
  modeling.updateModdleProperties(element, timerEventDefinition, newProps);
}

/**
 * 获取定时器内部标签的值
 * @param element
 * @param type
 */
export function getTimerValue(element: BpmnElement, type: string) {
  if (!type) {
    return '';
  }
  const businessObject = getBusinessObject(element);
  const timerEventDefinition = getTimerEventDefinition(businessObject);
  if (!timerEventDefinition) {
    return '';
  }
  const timerEventFormalExpression = timerEventDefinition.get(type);
  return timerEventFormalExpression && timerEventFormalExpression.get('body');
}

/**
 * 设置定时器内部标签的值
 * @param modeler
 * @param element
 * @param type
 * @param value
 */
export function setTimerValue(modeler: Modeler, element: BpmnElement, type: string, value: string) {
  const modeling = getModeling(modeler);
  const moddle = getModdle(modeler);
  const businessObject = getBusinessObject(element);
  const timerEventDefinition = getTimerEventDefinition(businessObject);
  if (!timerEventDefinition) {
    return;
  }
  const timerEventFormalExpression = timerEventDefinition.get(type);
  if (!timerEventFormalExpression) {
    const expression = createTimerFormalExpression(moddle, timerEventDefinition);
    expression.set('body', value);
    return modeling.updateModdleProperties(element, timerEventDefinition, { [type]: expression });
  }
  modeling.updateModdleProperties(element, timerEventFormalExpression, { body: value });
}

/**
 * Get the timer definition type for a given timer event definition. <BR />
 * 获取定时器定义类型
 * @param  timer {ModdleElement<bpmn:TimerEventDefinition>}
 *
 * @return string|undefined the timer definition type
 */
export function getTimerDefinitionType(timer: ModdleElement | undefined): string | undefined {
  if (!timer) {
    return '';
  }
  const timeDate = timer.get('timeDate');
  if (typeof timeDate !== 'undefined') {
    return 'timeDate';
  }
  const timeCycle = timer.get('timeCycle');
  if (typeof timeCycle !== 'undefined') {
    return 'timeCycle';
  }
  const timeDuration = timer.get('timeDuration');
  if (typeof timeDuration !== 'undefined') {
    return 'timeDuration';
  }
}

/**
 * 创建定时器内部标签
 * @param moddle
 * @param eventDefinition
 */
function createTimerFormalExpression(moddle: Moddle, eventDefinition: ModdleElement) {
  const formalExpression = moddle!.create('bpmn:FormalExpression', {
    body: undefined,
  });
  formalExpression.$parent = eventDefinition;
  return formalExpression;
}
