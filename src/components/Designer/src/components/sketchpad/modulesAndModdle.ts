import type { ModuleDeclaration } from 'didi';

//官方流程模拟 module
import TokenSimulationModule from 'bpmn-js-token-simulation';
// camunda 官方侧边栏扩展
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import CamundaExtensionModule from 'camunda-bpmn-moddle/resources/camunda.json';
// moddle JSON 定义文件
import camundaModdleDescriptors from '@/components/Designer/src/moddle/camunda.json';
// 创建/追加元素插件
import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';
// 翻译模块
import translate from '@/components/Designer/src/modules/Translate';
// 校验规则
import Rules from '@/components/Designer/src/modules/Rules';
//自动对齐
import AutoPlace from '@/components/Designer/src/modules/AutoPlace';
// 元素工厂
import ElementFactory from '@/components/Designer/src/modules/ElementFactory';
// 上下文菜单（右键菜单）
import EnhancementContextPad from '@/components/Designer/src/modules/ContextPad/EnhancementContextPad';
// 元素渲染器
import RewriteRenderer from '@/components/Designer/src/modules/Renderer/RewriteRenderer';
// 流程图校验
import lintModule from 'bpmn-js-bpmnlint';
import bpmnlint from '@/components/Designer/src/modules/Lint/bpmnlint';
// 小地图
import minimapModule from 'diagram-js-minimap';
// 网格线背景
import GridLineModule from 'diagram-js-grid-bg';

// 键盘绑定
import bpmnKeyboardBindings from 'bpmn-js/lib/features/keyboard';

/**
 * 画布初始化相关配置
 */
export type ModulesAndModdles = [
  ModuleDeclaration[],
  { [key: string]: any },
  { [key: string]: unknown }
];

/**
 * 获取designer画布初始化相关配置
 */
export default function initModules(): ModulesAndModdles {
  const modules: ModuleDeclaration[] = []; // modules 扩展模块数组
  const moddle: { [key: string]: any } = {}; // moddle 声明文件对象
  const options: { [key: string]: unknown } = {}; // modeler 其他配置
  // 置空 palette
  modules.push({
    paletteProvider: ['type', function () {}],
  });
  // 配置 contextPad
  modules.push(EnhancementContextPad);
  // 配置 自定义渲染
  modules.push(RewriteRenderer);
  // 配置模板选择弹窗（会影响默认 popupmenu）
  modules.push(
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
    CamundaExtensionModule
  );
  moddle['camunda'] = camundaModdleDescriptors;
  // 设置 lint 校验
  modules.push(lintModule);
  options['linting'] = {
    active: true,
    bpmnlint: bpmnlint,
  };
  // 设置 小地图
  modules.push(minimapModule);
  options['minimap'] = {
    open: true,
  };
  // 设置 自定义规则
  modules.push(Rules);
  // 设置 自动对齐
  modules.push(AutoPlace);
  // 设置 流程模拟
  modules.push(TokenSimulationModule);
  // 设置键盘事件绑定
  modules.push(bpmnKeyboardBindings);
  //元素仓库
  modules.push(ElementFactory);
  // 创建/追加元素插件
  modules.push(CreateAppendAnythingModule);
  // 配置 翻译
  modules.push(translate);
  // 设置 背景网格线
  modules.push(GridLineModule);
  return [modules, moddle, options];
}
