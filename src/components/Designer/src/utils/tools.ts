import { is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import { Moddle, ModdleElement } from 'bpmn-js/lib/model/Types';
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js';
import {
  MODELER_BPMN_FACTORY,
  MODELER_MODDLE,
  MODELER_MODELING,
} from '@/components/Designer/src/config/bpmnEnums';
import Modeler from 'bpmn-js/lib/Modeler';
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import { ScriptForm } from '/#/bpmn/declares/bpmn-form';
import { BpmnScript } from '/#/bpmn/declares/bpmn-instance';
import dayjs from 'dayjs';
import duration, { DurationUnitsObjectType } from 'dayjs/plugin/duration';

/**
 * 空格正则表达式
 */
const SPACE_REGEX = /\s/;

/**
 * QName正则表达式
 * 根据 http://www.w3.org/TR/REC-xml/#NT-NameChar 进行 QName 验证
 *  | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
 */
const QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

/**
 * 根据 BPMN 模式（QName - 命名空间）进行 ID 验证
 */
const ID_REGEX = /^[a-z_][\w-.]*$/i;

/**
 * 严格非空检查（适用于基础类型、数组、对象）
 * @param val 需要检查的值
 * @returns 当值不为 null/undefined 且满足以下条件时返回 true：
 *          - 数组：长度大于0
 *          - 对象：至少包含一个自身可枚举属性
 *          - 其他类型：自动转换为布尔值为 true
 */
export function notEmpty<T>(val: T | null | undefined): boolean {
  if (!notNull(val)) return false;

  const rawType = getRawType(val);

  switch (rawType) {
    case 'array':
      return (val as unknown[]).length > 0;
    case 'object':
      return Object.keys(val as object).length > 0;
    default:
      return Boolean(val);
  }
}

/**
 * 严格的空值检查（包括 null 和 undefined）
 * @param val 需要检查的值
 * @returns 当值不为 null 且不为 undefined 时返回 true
 */
export function notNull<T>(val: T | null | undefined): val is NonNullable<T> {
  return val !== null && val !== undefined;
}

export function isNull<T>(val: T | null | undefined) {
  return !notNull(val);
}

/**
 * 返回数据原始类型
 * @param value
 * @return { 'string' | 'array' | 'boolean' | 'number' | 'object' | 'function' } type
 */
export function getRawType(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

/**
 * 随机生成一个指定长度的 id， 默认长度为 8
 * @param length id长度
 * @param chars 字符集
 * @returns
 */
export function uuid(length = 8, chars?: string) {
  let result = '';
  const charsString = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = length; i > 0; --i) {
    result += charsString[Math.floor(Math.random() * charsString.length)];
  }
  return result;
}

/**
 * 判断是否为追加操作
 * @param element 当前操作元素
 */
export function isAppendAction(element?: Element) {
  return (
    !element ||
    isAny(element, ['bpmn:Process', 'bpmn:Collaboration', 'bpmn:Participant', 'bpmn:SubProcess'])
  );
}

/**
 * 检查字符串是否存在空格
 * @param value
 */
export function containsSpace(value: string) {
  return SPACE_REGEX.test(value);
}

/**
 * 校验流程节点ID
 * @param element
 * @param idValue
 */
export function isIdValid(element: ModdleElement, idValue: string) {
  const assigned = element.$model.ids.assigned(idValue);
  const idAlreadyExists = assigned && assigned !== element;
  if (!idValue) {
    return 'ID 不能为空.';
  }
  if (idAlreadyExists) {
    return 'ID 必须唯一';
  }
  return validateId(idValue);
}

/**
 *  校验ID的值
 * @param idValue
 */
export function validateId(idValue: string) {
  if (containsSpace(idValue)) {
    return 'ID 不能包含空格';
  }
  if (!ID_REGEX.test(idValue)) {
    if (QNAME_REGEX.test(idValue)) {
      return 'ID 不能包含前缀';
    }
    return 'ID 必须符合 BPMN 规范';
  }
}

/**
 * 创建脚本
 * @param modeler
 * @param props
 */
export function createScript(modeler: Modeler, props: ScriptForm): ModdleElement {
  const prefix = getProcessPrefix(modeler);
  const moddle = getModdle(modeler);
  const { scriptFormat, value, resource } = props;

  return moddle.create(`${prefix}:Script`, { scriptFormat, value, resource });
}

/**
 * 获取脚本类型
 * @param script
 */
export function getScriptType(script: ModdleElement & BpmnScript) {
  if (script.get('resource')) {
    return 'External Resource';
  }
  if (script.get('value')) {
    return 'Inline Script';
  }
  return 'none';
}

/**
 * 创建元素对象
 * @param modeller
 * @param elementType
 * @param properties 元素的属性值
 * @param parent 元素的父元素
 */
export function createElement(
  modeller: Modeler,
  elementType: string,
  properties: Record<string, any>,
  parent?: BpmnModdleEl
): BpmnModdleEl {
  const factory = getBpmnFactory(modeller);
  const element = factory.create(elementType, properties);
  parent && (element.$parent = parent);
  return element;
}

export function getBusinessObject(element: BpmnElement): BpmnModdleEl {
  // 存在泳池时，默认 "Collaboration" 节点替换为 "Process" 节点
  return is(element, 'bpmn:Collaboration')
    ? element.children[0].businessObject.processRef
    : (element && element.businessObject) || element;
}

/**
 * 获取 Modeling
 * @param modeler
 */
export function getModeling(modeler: Modeler) {
  return modeler.get<Modeling>(MODELER_MODELING);
}

/**
 * 获取 Moddle
 * @param modeler
 */
export function getModdle(modeler: Modeler) {
  return modeler.get<Moddle>(MODELER_MODDLE);
}

/**
 * 获取 bpmnFactory
 * @param modeler
 */
export function getBpmnFactory(modeler: Modeler) {
  return modeler.get<BpmnFactory>(MODELER_BPMN_FACTORY);
}

/**
 * 获取流程内属性活标签前缀（根据流程引擎决定）
 * @param modeler 模型（导入xml后才能有值，否则为undefined）
 */
export function getProcessPrefix(modeler: Modeler): string {
  return modeler.getDefinitions().targetNamespace;
}

/**
 * 获取指定日期的开始时间、截止时间
 * @param beginDate 开始日期
 * @param endDate 截止日期
 */

dayjs.extend(duration);

export function getDateRange(
  beginDate: dayjs.ConfigType,
  endDate: dayjs.ConfigType
): [string, string] {
  return [
    dayjs(beginDate).startOf('d').format('YYYY-MM-DD HH:mm:ss'),
    dayjs(endDate).endOf('d').format('YYYY-MM-DD HH:mm:ss'),
  ];
}

export function getDateDurationByDate(date: Date) {
  return dayjs.duration(date.getTime()).toISOString();
}

export function getDateDuration(date: DurationUnitsObjectType) {
  return dayjs.duration(date).toISOString();
}

export function getDateDurationByString(date: string) {
  return dayjs.duration(date);
}
