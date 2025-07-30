<script setup lang="ts">
  import Selection from 'diagram-js/lib/features/selection/Selection';
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js';
  import { useMessage } from 'naive-ui';
  import {
    MODELER,
    MODELER_ALIGN,
    MODELER_MODELING,
    MODELER_SELECTION,
  } from '@/components/Designer/src/config/bpmnEnums';
  import AlignElements from 'diagram-js/lib/features/align-elements/AlignElements';
  import Modeler from 'bpmn-js/lib/Modeler';

  defineOptions({
    name: 'Aligns',
  });
  const { t } = useI18n();
  const message = useMessage();

  const LucideAlignStartVertical = defineAsyncComponent(
    () => import('~icons/lucide/align-start-vertical')
  );
  const LucideAlignCenterVertical = defineAsyncComponent(
    () => import('~icons/lucide/align-center-vertical')
  );
  const LucideAlignEndVertical = defineAsyncComponent(
    () => import('~icons/lucide/align-end-vertical')
  );
  const LucideAlignStartHorizontal = defineAsyncComponent(
    () => import('~icons/lucide/align-Start-horizontal')
  );
  const LucideAlignCenterHorizontal = defineAsyncComponent(
    () => import('~icons/lucide/align-center-horizontal')
  );
  const LucideAlignEndHorizontal = defineAsyncComponent(
    () => import('~icons/lucide/align-end-horizontal')
  );

  const buttons: ComputedRef<{ name: string | undefined; key: string; icon: any }[]> = computed(
    () => {
      return [
        { name: t('bpmn.toolbar.alignLeft'), key: 'left', icon: LucideAlignStartVertical },
        {
          name: t('bpmn.toolbar.alignCenter'),
          key: 'center',
          icon: LucideAlignCenterVertical,
        },
        { name: t('bpmn.toolbar.alignRight'), key: 'right', icon: LucideAlignEndVertical },
        { name: t('bpmn.toolbar.alignTop'), key: 'top', icon: LucideAlignStartHorizontal },
        {
          name: t('bpmn.toolbar.alignMiddle'),
          key: 'middle',
          icon: LucideAlignCenterHorizontal,
        },
        {
          name: t('bpmn.toolbar.alignBottom'),
          key: 'bottom',
          icon: LucideAlignEndHorizontal,
        },
      ];
    }
  );

  const modeler = inject<Ref<Modeler>>(MODELER);
  const modeling = computed(() => modeler?.value && modeler.value.get<Modeling>(MODELER_MODELING));
  const selection = computed(
    () => modeler?.value && modeler.value.get<Selection>(MODELER_SELECTION)
  );
  const align = computed(() => modeler?.value && modeler.value.get<AlignElements>(MODELER_ALIGN));

  function alignElements(tag: string) {
    if (modeling.value && selection.value && align.value) {
      const SelectedElements = selection.value.get();
      if (!SelectedElements || SelectedElements.length <= 1) {
        return message.warning('请按住 Shift 键选择多个元素对齐');
      }
      align.value.trigger(SelectedElements, tag);
    }
  }
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
