<script setup name="Designer" lang="ts">
  import { markRaw, onMounted, provide, ref } from 'vue';
  import initModules from '@/components/Designer/src/components/sketchpad/modulesAndModdle';
  import initModeler, {
    createNewDiagram,
  } from '@/components/Designer/src/components/sketchpad/initModeler';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { InternalEvent } from 'diagram-js/lib/core/EventBus';
  import Toolbar from '@/components/Designer/src/components/toolbar/index.vue';
  import Palette from '@/components/Designer/src/components/palette/index.vue';
  import Panel from '@/components/Designer/src/components/Panel/index.vue';
  import type CommandStack from 'diagram-js/lib/command/CommandStack';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';

  const emit = defineEmits(['update:xml']);
  const modelerRef = ref<Modeler>();
  provide(MODELER, modelerRef);
  // store.getModeler && store.getModeler.destroy();
  // store.setModeler(null);
  // store.setModeler(markRaw(modeler));
  // store.setModules('moddle', markRaw(modeler.get<Moddle>('moddle')));
  // store.setModules('modeling', markRaw(modeler.get<Modeling>('modeling')));
  // store.setModules('canvas', markRaw(modeler.get<Canvas>('canvas')));
  // store.setModules('elementRegistry', markRaw(modeler.get<ElementRegistry>('elementRegistry')));
  const bpmnCanvas = ref<HTMLElement>();

  async function init() {
    try {
      const modelerModules = initModules();
      const modeler = initModeler(bpmnCanvas, modelerModules);
      modeler.on('commandStack.changed', async (event: InternalEvent) => {
        try {
          const { xml } = await modeler.saveXML({ format: true });
          emit('update:xml', xml);
          // emit('command-stack-changed', event);
          event;
        } catch (error) {
          console.error(error);
        }
      });
      modelerRef.value = markRaw(modeler);
      await createNewDiagram(modeler);
    } catch (e) {
      console.log(e);
    }
  }

  onMounted(() => {
    //阻止右键默认事件
    document.body.addEventListener('contextmenu', (ev: MouseEvent) => {
      ev.preventDefault();
    });
  });
</script>

<template>
  <div class="designer_container" id="designer_container">
    <Palette v-if="palette" />
    <div class="designer_main">
      <Toolbar key="toolbar">
        <template #save-btn> <slot name="save-btn"></slot></template>
      </Toolbar>
      <div ref="bpmnCanvas" id="bpmnCanvas" class="designer_canvas"></div>
    </div>
    <Panel key="panel" />
  </div>
</template>

<style scoped lang="less"></style>
