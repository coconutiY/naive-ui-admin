<script setup lang="ts">
  import { computed, markRaw, onMounted, provide, Ref, ref } from 'vue';
  import initModules from '@/components/Designer/src/components/sketchpad/modulesAndModdle';
  import Modeler from 'bpmn-js/lib/Modeler';
  import {
    ACTIVE_ELEMENT,
    COMMAND_DO,
    MODELER,
    MODELER_COMMAND,
    MODELER_REGISTRY,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { debounce } from 'min-dash';
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
  import { ElementChangeParams, SelectionChangeParams } from '/#/bpmn/designer/settings';
  import EmptyXml from '@/components/Designer/src/utils/emptyXml';
  import type { BaseViewerOptions } from 'bpmn-js/lib/BaseViewer';
  import enhancementContextmenu from '@/components/Designer/src/modules/ContextMenu/EnhancementContextmenu';
  import CommandStack from 'diagram-js/lib/command/CommandStack';

  const emit = defineEmits(['update:xml']);
  const modelerRef = ref<Modeler>();
  provide<Ref<Modeler | undefined>>(MODELER, modelerRef);
  const activeElement = ref<BpmnElement>();
  const activeId = computed(() => {
    return activeElement.value?.id;
  });
  provide(ACTIVE_ELEMENT, activeElement);

  const commandDo = ref({
    canRedo: false,
    canUndo: false,
  });
  provide(COMMAND_DO, commandDo);

  const bpmnCanvas = ref<HTMLElement>();

  /**
   * 初始化流程图
   */
  async function init() {
    try {
      const modelerModules = initModules();
      const options: BaseViewerOptions = {
        container: bpmnCanvas.value as HTMLElement,
        additionalModules: modelerModules[0] || [],
        moddleExtensions: modelerModules[1] || {},
        ...modelerModules[2],
      };
      const modeler: Modeler = new Modeler(options);
      enhancementContextmenu(modeler);
      modelerRef.value = markRaw(modeler);
      initListening(modeler);
      await createNewDiagram(modeler);
    } catch (error) {
      console.error(error);
    }
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
  async function createNewDiagram(
    modeler: Modeler,
    processId?: Ref<string>,
    bpmnXml?: string,
    processName?: string
  ) {
    try {
      const timestamp = Date.now();
      const relaId: string = processId?.value ? processId.value : `Process_${timestamp}`;
      const relaName: string = processName || `流程_${timestamp}`;
      const xmlString = bpmnXml || EmptyXml(relaId, relaName, 'camunda');
      // const xmlString = bpmnXml || EmptyXml(relaId, relaName, 'flowable');
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

  /**
   * 初始化监听事件
   * @param modeler
   */
  function initListening(modeler: Modeler) {
    /**
     * 导入完成后默认选中 process 节点，并设置panel内部表单
     */
    modeler.on('import.done', () => {
      console.log('import.done');
      setCurrentElement(undefined);
    });

    modeler.on('commandStack.changed', async () => {
      try {
        const { xml } = await modeler.saveXML({ format: true });
        commandDo.value.canRedo = modeler.get<CommandStack>(MODELER_COMMAND).canRedo();
        commandDo.value.canUndo = modeler.get<CommandStack>(MODELER_COMMAND).canUndo();
        emit('update:xml', xml);
        console.log('commandStack.changed', commandDo.value);
      } catch (error) {
        throw error;
      }
    });

    /**
     * 监听选择事件，修改当前激活的元素以及表单
     */
    modeler.on('selection.changed', ({ newSelection }: SelectionChangeParams) => {
      setCurrentElement(newSelection[0] || null);
    });

    /**
     * 监听元素发生改变事件，更新panel
     * 保证 修改 "默认流转路径" 等类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
     */
    modeler.on('element.changed', ({ element }: ElementChangeParams) => {
      console.log(element, 'element.changed');
      if (element && element.id === activeId.value) {
        setCurrentElement(element);
      }
    });

    /**
     * 节点删除事件
     */
    modeler.on('shape.removed', () => {
      console.log('Shape.removed');
    });

    /**
     * 流程校验结果
     * TODO 该监听拆分给lint模块
     */
    // modeler.on('linting.completed', ({ issues }: { issues: Issue }) => {
    // lintIssue.value = issues;
    // });
  }

  /**
   * 设置选中元素，更新 store中的数据
   */
  const setCurrentElement = debounce((element: BpmnElement | undefined) => {
    let elementRef = element;
    // 如果不传入参数则显示流程配置,否则显示当前节点
    if (!elementRef) {
      const registry = modelerRef.value!.get<ElementRegistry>(MODELER_REGISTRY);
      console.log(registry);
      // const definitionsElement = modelerRef.value!.getDefinitions();
      elementRef =
        registry.find((el: BpmnElement) => el.type === 'bpmn:Process') ||
        registry.find((el: BpmnElement) => el.type === 'bpmn:Collaboration');
      console.log('elementRef', registry);
      if (!elementRef) {
        throw new Error('未找到流程标签信息！');
      }
    }
    activeElement.value = markRaw(elementRef);
    console.log('activeElement', activeElement.value);
    console.log(`选择的元素发生改变：
    ID: ${elementRef.id} , type: ${elementRef.type}
  `);
  }, 100);

  onMounted(async () => {
    //阻止右键默认事件
    document.body.addEventListener('contextmenu', (ev: MouseEvent) => {
      ev.preventDefault();
    });
    await init();
  });
</script>

<template>
  <div class="designer_container">
    <Palette />
    <div class="designer_main">
      <Toolbar key="toolbar">
        <template #save-btn>
          <slot name="save-btn"></slot>
        </template>
      </Toolbar>
      <div ref="bpmnCanvas" class="designer_canvas"></div>
    </div>
    <Panel />
  </div>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/designer.scss';
</style>

<style lang="scss">
  @use 'src/components/Designer/src/styles/index.scss';
</style>
