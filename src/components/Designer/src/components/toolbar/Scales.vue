<script setup lang="ts">
  import Canvas from 'diagram-js/lib/core/Canvas';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ref } from 'vue';
  import Emitter from '@/components/Designer/src/utils/event-emitter';
  import LucideZoomIn from '~icons/lucide/zoom-in';
  import LucideZoomOut from '~icons/lucide/zoom-out';

  const currentScale = ref(1);
  let canvas: Canvas | null = null;

  Emitter.on('modeler-init', (modeler: Modeler) => {
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
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.zoomOut') }}
      </template>
      <n-button :icon="LucideZoomOut" @click="zoomOut()" />
    </n-tooltip>
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.zoomReset') }}
      </template>
      <n-button @click="zoomReset('fit-viewport')">
        <span style="text-align: center; display: inline-block; width: 40px">
          {{ Math.floor(currentScale * 10) * 10 + '%' }}
        </span>
      </n-button>
    </n-tooltip>
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.zoomIn') }}
      </template>
      <n-button :icon="LucideZoomIn" @click="zoomIn()" />
    </n-tooltip>
  </n-button-group>
</template>

<style scoped lang="scss"></style>
