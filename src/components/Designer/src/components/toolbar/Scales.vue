<script setup lang="ts">
  import Canvas from 'diagram-js/lib/core/Canvas';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ref } from 'vue';
  import Emitter from '@/components/Designer/src/utils/event-emitter';
  import LucideZoomIn from '~icons/lucide/zoom-in';
  import LucideZoomOut from '~icons/lucide/zoom-out';
  import { MODELER_INIT } from '@/components/Designer/src/config/bpmnEnums';

  const currentScale = ref(1);
  let canvas: Canvas | null = null;

  Emitter.on(MODELER_INIT, (modeler: Modeler) => {
    try {
      canvas = modeler.get<Canvas>('canvas');
      currentScale.value = canvas.zoom();
    } finally {
      modeler.on('canvas.viewbox.changed', ({ viewbox }: any) => {
        currentScale.value = viewbox.scale;
      });
    }
  });

  const zoomReset = (newScale: number | 'fit-viewport') => {
    canvas && canvas.zoom(newScale, newScale === 'fit-viewport' ? undefined : { x: 0, y: 0 });
  };

  const zoomOut = (newScale?: number) => {
    currentScale.value = newScale || Math.floor(currentScale.value * 100 - 0.1 * 100) / 100;
    zoomReset(currentScale.value);
  };

  const zoomIn = (newScale?: number) => {
    currentScale.value = newScale || Math.floor(currentScale.value * 100 + 0.1 * 100) / 100;
    zoomReset(currentScale.value);
  };
</script>

<template>
  <n-button-group>
    <n-tooltip>
      <template #trigger>
        <n-button @click="zoomOut()">
          <template #icon>
            <NIcon>
              <LucideZoomOut />
            </NIcon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.zoomOut') }}
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button @click="zoomReset('fit-viewport')">
          <span style="text-align: center; display: inline-block; width: 40px">
            {{ Math.floor(currentScale * 10) * 10 + '%' }}
          </span>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.zoomReset') }}
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button @click="zoomIn()">
          <template #icon>
            <NIcon>
              <LucideZoomIn />
            </NIcon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.zoomIn') }}
    </n-tooltip>
  </n-button-group>
</template>

<style scoped lang="scss"></style>
