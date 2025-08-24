import { getBusinessObject } from '@/components/Designer/src/utils/tools';
import Modeler from 'bpmn-js/lib/Modeler';
import CommandStack from 'diagram-js/lib/command/CommandStack';

const UPDATE_COMMAND = 'element.updateModdleProperties';

/**
 * 单独设置某个指定对象属性的一个属性
 * @param element
 * @param moddleElement
 * @param type
 * @param value
 */
export function setModdlePropertyCommand(
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  type: string,
  value?: unknown
): CommandContext {
  const properties = { [type]: value };
  return {
    cmd: UPDATE_COMMAND,
    context: { element, moddleElement, properties },
  };
}

/**
 * 更新指定对象属性的多个属性
 * @param element
 * @param moddleElement
 * @param properties
 */
export function setModdlePropertiesCommand(
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  properties: Record<string, any>
): CommandContext {
  return {
    cmd: UPDATE_COMMAND,
    context: { element, moddleElement, properties },
  };
}

/**
 * 设置 businessObject 的单个属性
 * @param element
 * @param type
 * @param value
 */
export function setBoPropertyCommand(
  element: BpmnElement,
  type: string,
  value?: unknown
): CommandContext {
  return setModdlePropertyCommand(element, getBusinessObject(element), type, value);
}

/**
 * 直接设置 businessObject 的多个属性
 * @param element
 * @param properties
 */
export function setBoPropertiesCommand(
  element: BpmnElement,
  properties: Record<string, any>
): CommandContext {
  return setModdlePropertiesCommand(element, getBusinessObject(element), properties);
}

/**
 * 设置 ModdleElement 类型元素的单个属性
 * @param element
 * @param moddleElement
 * @param type
 * @param value
 */
export function setModdleElPropertyCommand(
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  type: string,
  value?: unknown
): CommandContext {
  return setModdlePropertyCommand(element, moddleElement, type, value);
}

/**
 * 设置 ModdleElement 类型元素的单个属性
 * @param modeler 画布对象
 * @param element 待更新的元素
 * @param moddleElement 修改的元素（businessObject）
 * @param type 修改的元素类型
 * @param value 修改的元素值
 */
export function setModdleElProperty(
  modeler: Modeler,
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  type: string,
  value?: unknown
) {
  const command = setModdlePropertyCommand(element, moddleElement, type, value);
  return execSingleCommand(modeler, command.context);
}

/**
 * 设置 ModdleElement 类型元素的多个属性
 * @param element
 * @param moddleElement
 * @param properties
 */
export function setModdleElPropertiesCommand(
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  properties: Record<string, any>
): CommandContext {
  return setModdlePropertiesCommand(element, moddleElement, properties);
}

/**
 * 设置 ModdleElement 类型元素的多个属性
 * @param modeler
 * @param element
 * @param moddleElement
 * @param properties
 */
export function setModdleElProperties(
  modeler: Modeler,
  element: BpmnElement,
  moddleElement: BpmnModdleEl,
  properties: Record<string, any>
) {
  const command = setModdlePropertiesCommand(element, moddleElement, properties);
  return execMultiCommands(modeler, [command]);
}

/**
 * 执行多个命令
 * @param modeler
 * @param commands
 */
export function execMultiCommands(modeler: Modeler, commands: Array<CommandContext | undefined>) {
  try {
    const commandStack = modeler.get<CommandStack>('commandStack');
    commandStack.execute('multi-commands', commands);
  } catch (e) {
    console.error('元素更新异常：' + e);
  }
}

/**
 * 执行单个命令
 * @param modeler
 * @param context
 */
export function execSingleCommand(modeler: Modeler, context: CommandContext['context']) {
  try {
    const commandStack = modeler.get<CommandStack>('commandStack');
    commandStack.execute(UPDATE_COMMAND, context);
  } catch (e) {
    console.error('元素更新异常：' + e);
  }
}
