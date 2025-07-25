<script setup lang="ts">
  import Emitter from '@/components/Designer/src/utils/event-emitter';
  import Modeler from 'bpmn-js/lib/Modeler';
  // import { ElementEvent } from 'diagram-js/lib/core/EventBus';
  import { Connection, Label, Shape } from 'diagram-js/lib/model/Types';
  import { markRaw, provide } from 'vue';
  import {
    ACTIVE_ELEMENT,
    ACTIVE_ID,
    MODELER_INIT,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { Issue } from 'bpmn-js-bpmnlint';

  type ElementChangeParams = {
    element: Shape | Element | Connection | Label | any;
    gfx: HTMLElement | object;
    type: string | undefined;
  };

  const penalOpen = ref(true);

  const acitveId = ref();
  const acitveElement = ref();
  provide(ACTIVE_ID, acitveId);
  provide(ACTIVE_ELEMENT, acitveElement);

  /**
   * 设置panel的展示和隐藏并且更新对应的Icon
   */
  const penalHandoff = () => {
    penalOpen.value = !penalOpen.value;
  };

  /**
   * modeler初始化完成后开始监听各类事件，可按需扩展
   */
  // TODO 抛弃Emitter
  Emitter.on(MODELER_INIT, (modeler: Modeler) => {
    /**
     * 导入完成后默认选中 process 节点，并设置panel内部表单
     */
    modeler.on('import.done', () => {
      console.log('import.done');
    });

    /**
     * 监听元素发生改变事件，更新panel
     * 保证 修改 "默认流转路径" 等类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
     */
    modeler.on('element.changed', ({ element }: ElementChangeParams) => {
      if (element && element.id === acitveId.value) {
        console.log(element, 'element.changed');
        acitveId.value = element.id;
        acitveElement.value = markRaw(element);
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
     */
    modeler.on('linting.completed', ({ issue }: { issue: Issue }) => {
      console.log('linting.completed', issue);
    });
  });
</script>

<template>
  <div class="designer_panel">
    <div class="handoff_btn" @click="penalHandoff">
      <!--      <component :is="handoffIcon" />-->
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
