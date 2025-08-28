import { getBusinessObject, getModdle, getModeling } from '@/components/Designer/src/utils/tools';
import { ModdleElement } from 'moddle';
import { getTimerEventDefinition } from '@/components/Designer/src/utils/implType';
import Modeler from 'bpmn-js/lib/Modeler';
import { Moddle } from 'bpmn-js/lib/model/Types';

export function getTimerType(element: BpmnElement) {
  const businessObject = getBusinessObject(element);
  const timerEventDefinition = getTimerEventDefinition(businessObject);
  console.log(timerEventDefinition, 'timerEventDefinition');
  return getTimerDefinitionType(timerEventDefinition);
}

export function setTimerType(modeler: Modeler, element: BpmnElement, value: string) {
  const modeling = getModeling(modeler);
  const moddle = getModdle(modeler);
  const businessObject = getBusinessObject(element);
  const timerEventDefinition = getTimerEventDefinition(businessObject);
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
 * Get the timer definition type for a given timer event definition.
 *
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

function createTimerFormalExpression(moddle: Moddle, eventDefinition: ModdleElement) {
  const formalExpression = moddle!.create('bpmn:FormalExpression', {
    body: undefined,
  });
  formalExpression.$parent = eventDefinition;
  return formalExpression;
}
