<script setup lang="ts">
  import Canvas, { CanvasViewbox } from 'diagram-js/lib/core/Canvas';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ref, watch } from 'vue';
  import { MODELER, MODELER_CANVAS } from '@/components/Designer/src/config/bpmnEnums';

  const currentScale = ref(1);
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const canvasRef = ref<Canvas>();

  /**
   * 重置视图缩放
   * @param newScale 倍率
   */
  function zoomReset(newScale: number | 'fit-viewport') {
    if (canvasRef.value) {
      // 此处必须解除vue代理标记，否则newScale为 fit-viewport会报错
      toRaw(canvasRef.value).zoom(
        newScale,
        newScale === 'fit-viewport' ? undefined : { x: 0, y: 0 }
      );
    }
  }

  /**
   * 缩小
   * @param newScale 倍率
   */
  function zoomOut(newScale?: number) {
    currentScale.value = newScale || Math.floor(currentScale.value * 100 - 0.1 * 100) / 100;
    zoomReset(currentScale.value);
  }

  /**
   * 放大
   * @param newScale 倍率
   */
  function zoomIn(newScale?: number) {
    currentScale.value = newScale || Math.floor(currentScale.value * 100 + 0.1 * 100) / 100;
    zoomReset(currentScale.value);
  }

  watch(
    () => modelerRef?.value,
    () => {
      const canvas = modelerRef?.value.get<Canvas>(MODELER_CANVAS);
      canvasRef.value = canvas;
      currentScale.value = canvas!.zoom();
      modelerRef?.value.on('canvas.viewbox.changed', ({ viewbox }: { viewbox: CanvasViewbox }) => {
        currentScale.value = viewbox.scale;
      });
    }
  );
</script>

<template>
  <n-button-group>
    <n-tooltip>
      <template #trigger>
        <n-button @click="zoomOut()">
          <template #icon>
            <n-icon>
              <icon-lucide-zoom-out />
            </n-icon>
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
            <n-icon>
              <icon-lucide-zoom-in />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.zoomIn') }}
    </n-tooltip>
  </n-button-group>
</template>

<style scoped lang="scss"></style>
