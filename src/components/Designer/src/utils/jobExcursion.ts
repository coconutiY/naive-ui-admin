import Modeler from 'bpmn-js/lib/Modeler';
import {
  getProcessPrefix,
  getServiceTaskLikeBusinessObject,
} from '@/components/Designer/src/utils/implType';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { Base } from 'diagram-js/lib/model';
import { getModeling } from '@/components/Designer/src/utils/tools';
import {
  createModdleElement,
  getExtensionElementsList,
} from '@/components/Designer/src/utils/baseInfo';
import { ModdleElement } from 'bpmn-js/lib/model/Types';
import { isAsync } from '@/components/Designer/src/utils/asyncContinuations';

/**
 * 是否显示重试周期
 * @param modeler
 * @param element bpmn元素
 */
export function retryTimeCycleVisible(modeler: Modeler, element: Base): boolean {
  const prefix = getProcessPrefix(modeler);
  const businessObject = getBusinessObject(element);
  return (
    (is(element, `${prefix}:AsyncCapable`) && isAsync(businessObject, prefix)) ||
    !!isTimerEvent(element)
  );
}

/**
 * 是否显示任务优先级
 * @param modeler
 * @param element bpmn元素
 */
export function taskPriorityVisible(modeler: Modeler, element: Base): boolean {
  const prefix = getProcessPrefix(modeler);
  const businessObject = getBusinessObject(element);
  return (
    (is(element, `${prefix}:JobPriorized`) && isAsync(businessObject, prefix)) ||
    is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef')) ||
    !!isTimerEvent(element)
  );
}

/**
 * 是否可执行
 * @param modeler
 * @param element bpmn元素
 */
export function isJobExecutable(modeler: Modeler, element: Base): boolean {
  return retryTimeCycleVisible(modeler, element) || taskPriorityVisible(modeler, element);
}

/**
 * 获取任务优先级
 * @param modeler
 * @param element bpmn元素
 */
export function getExternalTaskValue(modeler: Modeler, element: Base): string | undefined {
  const prefix = getProcessPrefix(modeler);
  const businessObject = getRelativeBusinessObject(modeler, element);
  return businessObject.get(`${prefix}:taskPriority`);
}
/**
 * 设置任务优先级
 * @param modeler
 * @param element bpmn元素
 * @param value 需要设置的值
 */
export function setExternalTaskValue(modeler: Modeler, element: Base, value: string | undefined) {
  const prefix = getProcessPrefix(modeler);
  const modeling = getModeling(modeler);
  const businessObject = getRelativeBusinessObject(modeler, element);
  modeling?.updateModdleProperties(element, businessObject, {
    [`${prefix}:taskPriority`]: value,
  });
}

/**
 *  获取重试周期
 * @param modeler
 * @param element bpmn元素
 */
export function getRetryTimeCycleValue(modeler: Modeler, element: Base): string | undefined {
  const prefix = getProcessPrefix(modeler);
  const businessObject = getBusinessObject(element);
  const failedJobRetryTimeCycle = getExtensionElementsList(
    businessObject,
    `${prefix}:FailedJobRetryTimeCycle`
  )[0];
  return failedJobRetryTimeCycle && failedJobRetryTimeCycle.body;
}

/**
 *  设置重试周期
 * @param element bpmn元素
 * @param value 需要设置的值
 */
export function setRetryTimeCycleValue(modeler: Modeler, element: Base, value: string | undefined) {
  const prefix = getProcessPrefix(modeler);
  const modeling = getModeling(modeler);
  const businessObject = getBusinessObject(element);

  let extensionElements = businessObject.get('extensionElements');
  if (!extensionElements) {
    extensionElements = createModdleElement(
      modeler,
      'bpmn:ExtensionElements',
      { values: [] },
      businessObject
    );
    modeling?.updateModdleProperties(element, businessObject, { extensionElements });
  }

  let failedJobRetryTimeCycle = getExtensionElementsList(
    businessObject,
    `${prefix}:FailedJobRetryTimeCycle`
  )[0];
  if (!failedJobRetryTimeCycle) {
    failedJobRetryTimeCycle = createModdleElement(
      modeler,
      `${prefix}:FailedJobRetryTimeCycle`,
      {},
      extensionElements
    );
    modeling?.updateModdleProperties(element, extensionElements, {
      values: [...extensionElements.get('values'), failedJobRetryTimeCycle],
    });
  }

  modeling?.updateModdleProperties(element, failedJobRetryTimeCycle, { body: value });
}

/**
 * 是否外部任务
 * @param modeler
 * @param element bpmn元素
 */
function isExternalTaskLike(modeler: Modeler, element: Base): boolean {
  const prefix = getProcessPrefix(modeler);
  const bo = getServiceTaskLikeBusinessObject(element),
    type = bo && bo.get(`${prefix}:type`);
  return bo && is(bo, `${prefix}:ServiceTaskLike`) && type && type === 'external';
}

/**
 * 获取业务对象
 * @param modeler
 * @param element bpmn元素
 */
function getRelativeBusinessObject(modeler: Modeler, element: Base): ModdleElement {
  let businessObject;
  if (is(element, 'bpmn:Participant')) {
    businessObject = getBusinessObject(element).get('processRef');
  } else if (isExternalTaskLike(modeler, element)) {
    businessObject = getServiceTaskLikeBusinessObject(element);
  } else {
    businessObject = getBusinessObject(element);
  }
  return businessObject;
}

/**
 * 是否定时事件
 * @param element bpmn元素
 */
function isTimerEvent(element: Base): ModdleElement | undefined | false {
  // return is(element, 'bpmn:Event') && getTimerEventDefinition(element);
  return is(element, 'bpmn:Event');
}
