import Modeler from 'bpmn-js/lib/Modeler';
import { getModeling, getProcessPrefix } from '@/components/Designer/src/utils/tools';
import { isAsyncAfter, isAsyncBefore, isExclusive } from '@/components/Designer/src/utils/implType';

// 只有在bpmn:Task中的扩展属性
/**
 * 获取为异步前 <BR/>
 * @param modeler
 * @param element
 */
export function getAsyncBefore(modeler: Modeler, element: BpmnElement): boolean {
  const prefix = getProcessPrefix(modeler);
  return isAsyncBefore(element.businessObject, prefix);
}

/**
 * 设置为异步前 <BR/>
 * @param modeler
 * @param element
 * @param value
 */
export function setAsyncBefore(modeler: Modeler, element: BpmnElement, value: boolean) {
  const prefix = getProcessPrefix(modeler);
  const modeling = getModeling(modeler);
  // overwrite the legacy `async` property, we will use the more explicit `asyncBefore`
  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:asyncBefore`]: value,
    [`${prefix}:async`]: undefined,
  });
}

/**
 * 获取是否为异步前
 * @param modeler
 * @param element
 */
export function getAsyncAfter(modeler: Modeler, element: BpmnElement): boolean {
  const prefix = getProcessPrefix(modeler);
  return isAsyncAfter(element.businessObject, prefix);
}

/**
 * 设置为异步后
 * @param modeler
 * @param element
 * @param value
 */
export function setAsyncAfter(modeler: Modeler, element: BpmnElement, value: boolean) {
  const prefix = getProcessPrefix(modeler);
  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:asyncAfter`]: value,
  });
}

/**
 * 获取是否为排他（单独执行）
 * @param modeler
 * @param element
 */
export function getExclusive(modeler: Modeler, element: BpmnElement): boolean {
  const prefix = getProcessPrefix(modeler);
  return isExclusive(element.businessObject, prefix);
}

/**
 * 设置为排他（单独执行）
 * @param modeler
 * @param element
 * @param value
 */
export function setExclusive(modeler: Modeler, element: BpmnElement, value: boolean) {
  const prefix = getProcessPrefix(modeler);
  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:exclusive`]: value,
  });
}
