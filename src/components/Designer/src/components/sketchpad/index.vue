<script setup lang="ts">
  import { markRaw, onMounted, provide, ref } from 'vue';
  import initModules from '@/components/Designer/src/components/sketchpad/modulesAndModdle';
  import initModeler, {
    createNewDiagram,
  } from '@/components/Designer/src/components/sketchpad/initModeler';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { InternalEvent } from 'diagram-js/lib/core/EventBus';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';

  const emit = defineEmits(['update:xml']);
  const modelerRef = ref<Modeler>();
  provide(MODELER, modelerRef);
  const bpmnCanvas = ref<HTMLElement>();

  async function init() {
    try {
      const modelerModules = initModules();
      const modeler = initModeler(bpmnCanvas, modelerModules);
      modeler.on('commandStack.changed', async (event: InternalEvent) => {
        try {
          const { xml } = await modeler.saveXML({ format: true });
          emit('update:xml', xml);
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
