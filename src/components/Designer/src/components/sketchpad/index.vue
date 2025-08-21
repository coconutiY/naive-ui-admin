<script setup lang="ts">
  import { computed, markRaw, onMounted, provide, ref } from 'vue';
  import initModules from '@/components/Designer/src/components/sketchpad/modulesAndModdle';
  import {
    initModeler,
    createNewDiagram,
  } from '@/components/Designer/src/components/sketchpad/initModeler';
  import Modeler from 'bpmn-js/lib/Modeler';
  import {
    ACTIVE_ELEMENT,
    MODELER,
    MODELER_REGISTRY,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { debounce } from 'min-dash';
  import { Connection, Element, Label, Shape } from 'diagram-js/lib/model/Types';
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
  import { ElementChangeParams, SelectionChangeParams } from '/#/bpmn/designer/settings';

  const emit = defineEmits(['update:xml']);
  const modelerRef = ref<Modeler>();
  provide<Ref<Modeler | undefined>>(MODELER, modelerRef);
  const activeElement = ref<Element>();
  const activeId = computed(() => {
    return activeElement.value?.id;
  });
  provide(ACTIVE_ELEMENT, activeElement);

  const bpmnCanvas = ref<HTMLElement>();

  async function init() {
    try {
      const modelerModules = initModules();
      const modeler = initModeler(bpmnCanvas, modelerModules);
      modelerRef.value = markRaw(modeler);
      initListening(modeler);
      await createNewDiagram(modeler);
      console.log(modeler.getDefinitions(), 'modele.getDefinitions');
    } catch (error) {
      console.error(error);
    }
  }

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
        emit('update:xml', xml);
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
  const setCurrentElement = debounce(
    (element: Shape | Element | Connection | Label | undefined) => {
      let elementRef = element;
      // 如果不传入参数则显示流程配置,否则显示当前节点
      if (!elementRef) {
        const registry = modelerRef.value!.get<ElementRegistry>(MODELER_REGISTRY);
        elementRef =
          registry.find((el: Base) => el.type === 'bpmn:Process') ||
          registry.find((el: Base) => el.type === 'bpmn:Collaboration');
        if (!elementRef) {
          throw new Error('未找到流程标签信息！');
        }
      }
      activeElement.value = markRaw(elementRef as Base);
      console.log('activeElement', activeElement.value);
      console.log(`选择的元素发生改变：
    ID: ${elementRef.id} , type: ${elementRef.type}
  `);
    },
    100
  );

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
        <template #save-btn> <slot name="save-btn"></slot></template>
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
