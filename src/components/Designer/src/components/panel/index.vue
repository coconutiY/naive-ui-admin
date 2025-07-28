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
  import bpmnIconKey from '@/components/Designer/src/utils/icon';
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
  const BaseInfo = defineAsyncComponent(() => import('./components/BaseInfo.vue'));
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const activeElement = ref<Base>();
  const activeId = computed(() => {
    return activeElement.value?.id;
  });
  provide(ACTIVE_ID, activeId);
  provide(ACTIVE_ELEMENT, activeElement);

  const lintIssue = ref<Issue | null>(null);
  const drawerVisible = ref(true);
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
  const setCurrentElement = debounce((element: Shape | Base | Connection | Label | undefined) => {
    let elementRef = element;
    // 如果不传入参数则显示流程配置,否则显示当前节点
    if (!elementRef) {
      const registry = modelerRef!.value.get<ElementRegistry>(MODELER_REGISTRY);
      elementRef =
        registry.find((el: Base) => el.type === 'bpmn:Process') ||
        registry.find((el: Base) => el.type === 'bpmn:Collaboration');
      console.log('activeElement', activeElement.value);
      if (!elementRef) {
        throw new Error('未找到流程标签信息！');
      }
    }
    activeElement.value = markRaw(elementRef as Base);
    // 设置panel信息, 元素id或者类型发生改变（选中的元素或者元素的类型）
    if (elementRef.id !== activeId.value || elementRef.type.split(':')[1] !== activeType.value) {
      const translate = modelerRef!.value.get<Translate>(MODELER_TRANSLATE);
      activeType.value = translate(elementRef.type.split(':')[1]) as string;
      const iconKey = bpmnIconKey(elementRef as Base);
      // 设置panel的标题
      title.value = translate(activeType.value);
      // 设置标题的icon
      iconName.value = bpmnIcons[iconKey];
      // TODO 设置需要填写的表单
      console.log(`选择的元素发生改变：
    ID: ${elementRef.id} , type: ${elementRef.type}
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
      setCurrentElement(undefined);
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
    <div class="drawers_btn" @click="changeVisible">
      <component :is="drawerIcon" />
    </div>
    <n-card class="card" v-show="drawerVisible" header-style="background-color: #f5f5f7;">
      <template #header>
        <div class="panel-header">
          <BpmnIcon :name="iconName" />
          <span class="title">{{ title }}</span>
        </div>
      </template>
      <template #default>
        <n-collapse arrow-placement="right">
          <component :is="BaseInfo" />
        </n-collapse>
      </template>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
