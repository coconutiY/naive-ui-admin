
import Modeler from 'bpmn-js/lib/Modeler';
import { getProcessPrefix } from '@/components/Designer/src/utils/implType';
import { getModeling } from '@/components/Designer/src/utils/tools';
import { Base } from 'diagram-js/lib/model';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { ModdleElement } from 'bpmn-js/lib/model/Types';

// 只有在bpmn:Task中的扩展属性
/**
 * 获取为异步前 <BR/>
 * @param modeler
 * @param element
 */
export function getAsyncBefore(modeler: Modeler, element: Base): boolean {
  const prefix = getProcessPrefix(modeler);
  return isAsyncBefore(element.businessObject, prefix);
}

/**
 * 设置为异步前 <BR/>
 * @param modeler
 * @param element
 * @param value
 */
export function setAsyncBefore(modeler: Modeler, element: Base, value: boolean) {
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
export function getAsyncAfter(modeler: Modeler, element: Base): boolean {
  const prefix = getProcessPrefix(modeler);
  return isAsyncAfter(element.businessObject, prefix);
}

/**
 * 设置为异步后
 * @param modeler
 * @param element
 * @param value
 */
export function setAsyncAfter(modeler: Modeler, element: Base, value: boolean) {
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
export function getExclusive(modeler: Modeler, element: Base): boolean {
  const prefix = getProcessPrefix(modeler);
  return isExclusive(element.businessObject, prefix);
}

/**
 * 设置为排他（单独执行）
 * @param modeler
 * @param element
 * @param value
 */
export function setExclusive(modeler: Modeler, element: Base, value: boolean) {
  const prefix = getProcessPrefix(modeler);
  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:exclusive`]: value,
  });
}

// 是否支持异步属性
/**
 * 获取是否为异步延续
 * @param modeler
 * @param element
 */
export function isAsynchronous(modeler: Modeler, element: Base): boolean {
  const prefix = getProcessPrefix(modeler);
  return is(element, `${prefix}:AsyncCapable`);
}

/**
 * 检查是否为异步前 <BR/>
 * Returns true if the attribute 'asyncBefore' is set to true.
 * @param bo
 * @param prefix
 */
function isAsyncBefore(bo: ModdleElement, prefix: string): boolean {
  return !!(bo.get(`${prefix}:asyncBefore`) || bo.get(`${prefix}:async`));
}

/**
 * 检查是否为异步后 <BR/>
 * Returns true if the attribute 'asyncAfter' is set to true.
 * @param bo
 * @param prefix
 */
function isAsyncAfter(bo: ModdleElement, prefix: string): boolean {
  return !!bo.get(`${prefix}:asyncAfter`);
}

/**
 * 检查是否排他（单独执行）<BR/>
 * Returns true if the attribute 'exclusive' is set to true.
 * @param bo
 * @param prefix
 */
function isExclusive(bo: ModdleElement, prefix: string): boolean {
  return !!bo.get(`${prefix}:exclusive`);
}

/**
 * 是否异步
 * @param bo
 * @param prefix
 */
export function isAsync(bo: ModdleElement, prefix: string): boolean {
  return isAsyncAfter(bo, prefix) || isAsyncBefore(bo, prefix);
}
