import { getBusinessObject } from '@/components/Designer/src/utils/tools';
import { ModdleElement } from 'moddle';
import { getEventDefinition } from '@/components/Designer/src/utils/implType';

export function getTimerType(element: BpmnElement) {
  const businessObject = getBusinessObject(element);
  const timerEventDefinition = getTimerEventDefinition(businessObject);
  console.log(timerEventDefinition, 'timerEventDefinition');
  return getTimerDefinitionType(timerEventDefinition);
}

export function getTimerEventDefinition(element: BpmnElement): ModdleElement | undefined {
  return getEventDefinition(element, 'bpmn:TimerEventDefinition');
}

/**
 * Get the timer definition type for a given timer event definition.
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>} timer
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
