<script setup lang="ts">
  import Modeler from 'bpmn-js/lib/Modeler';
  import { Connection, Label, Shape } from 'diagram-js/lib/model/Types';
  import {
    computed,
    markRaw,
    provide,
    Ref,
    ref,
    shallowRef,
    watch,
    defineAsyncComponent,
  } from 'vue';
  import {
    ACTIVE_ELEMENT,
    ACTIVE_ID,
    bpmnIcons,
    MODELER,
    MODELER_REGISTRY,
    MODELER_TRANSLATE,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { Issue } from 'bpmn-js-bpmnlint';
  import { inject } from 'vue-demi';
  import { debounce } from 'min-dash';
  import { Base } from 'diagram-js/lib/model';
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
  import { Translate } from 'diagram-js/lib/i18n/translate';
  import bpmnIconKey from '@/components/Designer/src/utils/element-icon';
  type ElementChangeParams = {
    element: Shape | Element | Connection | Label | any;
    gfx: HTMLElement | object;
    type: string | undefined;
  };

  type SelectionChangeParams = {
    /**
     * 新选中的所有元素
     */
    newSelection: any[];
    /**
     * 之前选中的所有元素
     */
    oldSelection: any[];
    /**
     * 事件类型
     */
    type: string;
  };
  const lucideChevronsLeft = defineAsyncComponent(() => import('~icons/lucide/chevrons-left'));
  const lucideChevronsRight = defineAsyncComponent(() => import('~icons/lucide/chevrons-right'));
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const activeElement = ref();
  const activeId = computed(() => {
    return activeElement.value?.id;
  });
  provide(ACTIVE_ID, activeId);
  provide(ACTIVE_ELEMENT, activeElement);

  const lintIssue = ref<Issue | null>(null);
  const drawerVisible = ref(false);
  const drawerIcon = shallowRef(lucideChevronsLeft);

  const iconName = ref<string>('Process');
  const activeType = ref<string>('');
  const title = ref<string | undefined>('');
  // const elementName = ref<string>('Process');
  // const collapseKey = ref<any[]>([])
  // const renderComponents = shallowRef<Item[]>([])

  /**
   * 设置选中元素，更新 store中的数据
   */
  const setCurrentElement = debounce((element?: Shape | Base | Connection | Label) => {
    // 如果不传入参数则显示流程配置
    if (!element && modelerRef) {
      const registry = modelerRef.value.get<ElementRegistry>(MODELER_REGISTRY);
      activeElement.value = markRaw(
        registry.find((el: Base) => el.type === 'bpmn:Process') ||
          registry.find((el: Base) => el.type === 'bpmn:Collaboration')
      );
      if (!activeElement.value) {
        throw new Error('未找到流程标签信息！');
      }
    } else if (
      modelerRef &&
      element &&
      // 元素id或者类型发生改变（选中的元素或者元素的类型）
      (element.id !== activeId.value || element.type.split(':')[1] !== activeType.value)
    ) {
      const translate = modelerRef.value.get<Translate>(MODELER_TRANSLATE);
      activeType.value = translate(element.type.split(':')[1]) as string;
      const iconKey = bpmnIconKey(element as Base);
      title.value = translate(activeType.value);
      iconName.value = bpmnIcons[iconKey];
      // TODO 设置需要填写的表单
      console.log(`选择的元素发生改变：
    ID: ${element.id} , type: ${element.type}
  `);
    }
  }, 100);

  /**
   * 设置panel的展示和隐藏并且更新对应的Icon
   */
  function changeVisible() {
    drawerVisible.value = !drawerVisible.value;
    drawerIcon.value = drawerVisible.value ? lucideChevronsRight : lucideChevronsLeft;
  }

  function initListening(modeler: Modeler) {
    /**
     * 导入完成后默认选中 process 节点，并设置panel内部表单
     */
    modeler.on('import.done', () => {
      console.log('import.done');
      setCurrentElement();
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
    modeler.on('linting.completed', ({ issues }: { issues: Issue }) => {
      lintIssue.value = issues;
    });
  }

  watch(
    () => modelerRef?.value,
    (value) => {
      if (value) {
        initListening(value);
      }
    }
  );
</script>

<template>
  <div class="designer_panel">
    <div class="handoff_btn" @click="changeVisible">
      <component :is="drawerIcon" />
    </div>
    <n-card class="card" v-show="drawerVisible">
      <template #header>
        <div class="panel-header">
          <BpmnIcon :name="iconName" />
          <span class="element-title">{{ title }}</span>
        </div>
      </template>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
