<script setup name="Aligns" lang="ts">
  import { computed, ComputedRef, getCurrentInstance } from 'vue';
  import Modeler from 'bpmn-js/lib/Modeler';
  import Selection from 'diagram-js/lib/features/selection/Selection';
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js';
  import LucideAlignStartVertical from '~icons/lucide/align-start-vertical';
  import LucideAlignCenterVertical from '~icons/lucide/align-center-vertical';
  import LucideAlignEndVertical from '~icons/lucide/align-end-vertical';
  import LucideAlignStartHorizontal from '~icons/lucide/align-Start-horizontal';
  import LucideAlignCenterHorizontal from '~icons/lucide/align-center-horizontal';
  import LucideAlignEndHorizontal from '~icons/lucide/align-end-horizontal';
  import { ComponentInternalInstance } from 'vue-demi';
  import Emitter from '@/components/Designer/src/utils/event-emitter';
  import { useMessage } from 'naive-ui';
  import { MODELER_INIT } from '@/components/Designer/src/config/bpmnEnums';

  const { proxy } = getCurrentInstance() as ComponentInternalInstance;
  const message = useMessage();
  const buttons: ComputedRef<{ name: string | undefined; key: string; icon: any }[]> = computed(
    () => {
      return [
        { name: proxy?.$t('bpmn.toolbar.alignLeft'), key: 'left', icon: LucideAlignStartVertical },
        {
          name: proxy?.$t('bpmn.toolbar.alignCenter'),
          key: 'center',
          icon: LucideAlignCenterVertical,
        },
        { name: proxy?.$t('bpmn.toolbar.alignRight'), key: 'right', icon: LucideAlignEndVertical },
        { name: proxy?.$t('bpmn.toolbar.alignTop'), key: 'top', icon: LucideAlignStartHorizontal },
        {
          name: proxy?.$t('bpmn.toolbar.alignMiddle'),
          key: 'middle',
          icon: LucideAlignCenterHorizontal,
        },
        {
          name: proxy?.$t('bpmn.toolbar.alignBottom'),
          key: 'bottom',
          icon: LucideAlignEndHorizontal,
        },
      ];
    }
  );

  let modeling: Modeling | null = null;
  let selection: Selection | null = null;
  let align: any = null;

  Emitter.on(MODELER_INIT, (modeler: Modeler) => {
    modeling = modeler.get('modeling');
    selection = modeler.get('selection');
    align = modeler.get('alignElements');
  });

  const alignElements = (tag: string) => {
    if (modeling && selection) {
      const SelectedElements = selection.get();
      if (!SelectedElements || SelectedElements.length <= 1) {
        return message.warning('请按住 Shift 键选择多个元素对齐');
      }
      align.trigger(SelectedElements, tag);
    }
  };
</script>

<template>
  <n-button-group>
    <n-tooltip v-for="item in buttons" :key="item.key">
      <template #trigger>
        <n-button @click="() => alignElements(item.key)">
          <template #icon>
            <n-icon>
              <component :is="item.icon" />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ item.name }}
    </n-tooltip>
  </n-button-group>
</template>

<style scoped lang="scss"></style>
