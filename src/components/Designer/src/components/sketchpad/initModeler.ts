import { Ref } from 'vue';
import Modeler from 'bpmn-js/lib/Modeler';
import type { BaseViewerOptions } from 'bpmn-js/lib/BaseViewer';
import Emitter from '@/components/Designer/src/utils/event-emitter';
import { ViewerOptions } from 'diagram-js/lib/model';
import enhancementContextmenu from '@/components/Designer/src/modules/ContextMenu/EnhancementContextmenu';
import EmptyXml from '@/components/Designer/src/utils/empty-xml';
import { MODELER_INIT } from '@/components/Designer/src/config/bpmnEnums';

export default function initModeler(
  designer: Ref<HTMLElement | undefined>,
  modelerModules: ViewerOptions<Element>
) {
  const options: BaseViewerOptions = {
    container: designer?.value as HTMLElement,
    additionalModules: modelerModules[0] || [],
    moddleExtensions: modelerModules[1] || {},
    ...modelerModules[2],
  };
  const modeler: Modeler = new Modeler(options);
  // 扩展上下文菜单
  enhancementContextmenu(modeler);
  // 画布创建完成
  Emitter.emit(MODELER_INIT, modeler);
  return modeler;
}

/**
 * 创建一个新的流程图
 * @param modeler 流程modeler对象
 * @param bpmnXml 流程xml字符串
 * @param processId 流程id
 * @param processName 流程名称
 * @Step1 初始化存储和时间戳。
 * @Step2 获取或设置流程ID、名称及引擎类型。
 * @Step3 生成BPMN XML字符串（若未提供则使用默认模板）。
 * @Step4 导入XML到Modeler并处理可能产生的警告信息。
 */
export async function createNewDiagram(
  modeler: Modeler,
  bpmnXml?: string,
  processId?: string,
  processName?: string
) {
  try {
    const timestamp = Date.now();
    const relaId: string = processId ? processId : `Process_${timestamp}`;
    const relaName: string = processName || `流程_${timestamp}`;
    const xmlString = bpmnXml || EmptyXml(relaId, relaName, 'camunda');
    const { warnings } = await modeler.importXML(xmlString);
    if (warnings && warnings.length) {
      warnings.forEach((warn) => console.warn(warn));
    }
  } catch (error) {
    console.error(
      `[Process Designer Warn]: ${typeof error === 'string' ? error : (error as Error)?.message}`
    );
  }
}
