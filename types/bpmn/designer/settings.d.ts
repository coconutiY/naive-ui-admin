import { ViewerOptions } from 'diagram-js/lib/model/Types';
import { ModuleDeclaration } from 'didi';
import { TranslateResult } from 'vue-i18n';

/**
 * @description: 配置项
 * 字符串值
 * default: 默认
 * rewrite: 重写
 * custom: 自定义
 * enhancement: 增强
 */
export interface EditorSettings {
  language: string;
  processName: string;
  processId: string;
  processEngine: 'flowable' | 'activiti' | 'camunda';
  paletteMode: 'default' | 'custom' | 'rewrite' | 'enhancement';
  penalMode: 'default' | 'custom' | 'rewrite';
  contextPadMode: 'default' | 'rewrite' | 'enhancement';
  rendererMode: 'default' | 'rewrite' | 'enhancement' | 'custom';
  //背景
  bg: string;
  //工具栏
  toolbar: boolean;
  // 小地图
  miniMap: boolean;
  // 快捷键
  contextmenu: boolean;
  // 自定义右键菜单
  customContextmenu: boolean;
  // 其他模块
  otherModule: boolean;
  templateChooser: boolean;
  //是否使用Lint
  useLint: boolean;
  // 自定义主题
  customTheme: Record<string, string | number>;
}

export type ModelerOptions<E extends Element> = ViewerOptions<E> & {
  additionalModules: ModuleDeclaration[];
  moddleExtensions: object;
};

// bpmn.js 事件参数
// 1. canvas 事件
type CanvasEventParams = {
  svg: SVGElement;
  viewport: SVGElement;
};

export type PaletteElement = {
  group: string;
  type: string;
  className: string;
  title: TranslateResult | undefined;
  visible: boolean;
};
