import Viewer from 'bpmn-js/lib/Viewer';
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js';
import Canvas from 'diagram-js/lib/core/Canvas';
import Overlays from 'diagram-js/lib/features/overlays/Overlays';
import { Base } from 'diagram-js/lib/model';
import Modeler from 'bpmn-js/lib/Modeler';
import { Moddle } from 'moddle';
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import { defineStore } from 'pinia';
import { App } from 'vue';

/**
 * 详情查看提示框缓存
 */
export type Tip = {
  id: string;
  mountNode: HTMLElement;
  tipInstance: App<Element>;
};

/**
 * 详情查看缓存
 */
interface ViewerStore {
  viewerInstance?: Viewer | null;
  overlays?: Overlays | null;
  tip?: object | null;
  canvas: Canvas | null;
  modeling: Modeling | null;
}

/**
 * 流程设计器缓存
 */
interface ModelerStore extends ViewerStore {
  activeElement: Base | undefined;
  activeElementId: string | undefined;
  modeler: Modeler | null;
  moddle: Moddle | null;
  modeling: Modeling | null;
  canvas: Canvas | null;
  elementRegistry: ElementRegistry | null;
  canRedo: boolean;
  canUndo: boolean;
}

/**
 * 流程展示器缓存默认值
 */
// const defaultViewerState: ViewerStore = {
//   viewerInstance: undefined,
//   overlays: null,
//   canvas: null,
//   modeling: null,
//   tip: null,
// };

/**
 * 流程展示器缓存默认值
 */
const defaultViewersState: { data: Map<string, ViewerStore> } = {
  data: new Map<string, ViewerStore>(),
};

/**
 * 流程设计器缓存默认值
 */
// const defaultModelerState: ModelerStore = {
//   activeElement: undefined,
//   activeElementId: undefined,
//   modeler: null,
//   moddle: null,
//   modeling: null,
//   canvas: null,
//   elementRegistry: null,
//   canUndo: false,
//   canRedo: false,
// };

/**
 * 流程设计器缓存默认值
 */
const defaultModelersState: { data: Map<string, ModelerStore> } = {
  data: new Map<string, ModelerStore>(),
};

//viewers
export const userViewersStore = defineStore('viewers', {
  state: () => defaultViewersState,
  getters: {
    getViewerInstance: (state) => {
      return (id: string) => state.data.get(id)?.viewerInstance;
    },
    getOverlays: (state) => {
      return (id: string) => state.data.get(id)?.overlays;
    },
    getCanvas: (state) => {
      return (id: string) => state.data.get(id)?.canvas;
    },
    getModeling: (state) => {
      return (id: string) => state.data.get(id)?.modeling;
    },
    getTip: (state) => {
      return (id: string) => state.data.get(id)?.tip;
    },
  },
  actions: {
    setViewerInstance(id: string, viewer: Viewer | null) {
      const data = {
        ...this.$state.data.get(id),
        viewerInstance: viewer,
      } as ViewerStore;
      this.$state.data.set(id, data);
    },
    setOverlays(id: string, overlays: Overlays) {
      const data = {
        ...this.$state.data.get(id),
        overlays: overlays,
      } as ViewerStore;
      this.$state.data.set(id, data);
    },
    setCanvas(id: string, canvas: Canvas) {
      const data = {
        ...this.$state.data.get(id),
        canvas: canvas,
      } as ViewerStore;
      this.$state.data.set(id, data);
    },
    setModeling(id: string, modeling: Modeling) {
      const data = {
        ...this.$state.data.get(id),
        modeling: modeling,
      } as ViewerStore;
      this.$state.data.set(id, data);
    },
    setTip(id: string, tip: Tip) {
      const data = {
        ...this.$state.data.get(id),
        tip: tip,
      } as ViewerStore;
      this.$state.data.set(id, data);
    },
    destroyTip(id: string) {
      const data = this.$state.data.get(id);
      if (data) {
        const { tipInstance, mountNode } = data.tip as Tip;
        tipInstance.unmount();
        document.body.removeChild(mountNode);
        data.tip = null;
        this.$state.data.set(id, data);
      }
    },
  },
});

//modelers
export const useModelersStore = defineStore('modelers', {
  state: () => defaultModelersState,
  getters: {
    getActive: (state) => {
      return (id: string) => state.data.get(id)?.activeElement;
    },
    getActiveId: (state) => {
      return (id: string) => state.data.get(id)?.activeElementId;
    },
    getModeler: (state) => {
      return (id: string) => state.data.get(id)?.modeler;
    },
    getModdle: (state) => {
      return (id: string) => state.data.get(id)?.moddle;
    },
    getModeling: (state) => {
      return (id: string) => state.data.get(id)?.modeling;
    },
    getCanvas: (state) => {
      return (id: string) => state.data.get(id)?.canvas;
    },
    getElRegistry: (state) => {
      return (id: string) => state.data.get(id)?.elementRegistry;
    },
  },
  actions: {
    setModeler(modeler: Modeler | null, id: string) {
      const data = {
        ...this.$state.data.get(id),
        modeler: modeler,
      } as ModelerStore;
      this.$state.data.set(id, data);
    },
    setModules<K extends keyof ModelerStore>(key: K, module: any, id: string) {
      const data = { ...this.$state.data.get(id) } as ModelerStore;
      data[key] = module;
      this.$state.data.set(id, data);
    },
    setElement(element: Base, id: string) {
      const data = {
        ...this.$state.data.get(id),
        activeElement: element,
        activeElementId: id,
      } as ModelerStore;
      this.$state.data.set(id, data);
    },
  },
});

//editor
// export const useEditorStore = defineStore('editor', {
//   state: () => editorState,
//   getters: {
//     getLocales: (state): EditorSettings['language'] => state.editorSettings.language,
//     getProcessDef: (state): Pick<EditorSettings, 'processName' | 'processId'> => ({
//       processName: state.processSetting.processName,
//       processId: state.processSetting.processId,
//     }),
//     getProcessEngine: (state): EditorSettings['processEngine'] =>
//       state.editorSettings.processEngine,
//     getEditorConfig: (
//       state
//     ): Omit<EditorSettings, 'language' | 'processName' | 'processId' | 'processEngine'> => ({
//       bg: state.editorSettings.bg,
//       paletteMode: state.editorSettings.paletteMode,
//       penalMode: state.editorSettings.penalMode,
//       contextPadMode: state.editorSettings.contextPadMode,
//       rendererMode: state.editorSettings.rendererMode,
//       toolbar: state.editorSettings.toolbar,
//       miniMap: state.editorSettings.miniMap,
//       contextmenu: state.editorSettings.contextmenu,
//       customContextmenu: state.editorSettings.customContextmenu,
//       otherModule: state.editorSettings.otherModule,
//       templateChooser: state.editorSettings.templateChooser,
//       useLint: state.editorSettings.useLint,
//       customTheme: state.editorSettings.customTheme,
//     }),
//   },
//   actions: {
//     updateConfiguration(conf: Partial<EditorSettings>) {
//       this.$state.editorSettings = { ...this.$state.editorSettings, ...conf };
//     },
//     updateLanguage(lang: string) {
//       this.$state.editorSettings.language = lang || 'zh_CN';
//     },
//     updateProcessSetting(processId: string, processName: string) {
//       this.$state.processSetting.processId = processId;
//       this.$state.processSetting.processName = processName;
//     },
//   },
// });
