<script setup lang="ts">
  import BpmnModdle from 'bpmn-moddle';
  import 'highlight.js/lib/common';
  import hljsVuePlugin from '@highlightjs/vue-plugin';
  import { getCurrentInstance, inject, Ref, ref, shallowRef } from 'vue';
  import { ComponentInternalInstance } from 'vue-demi';
  import { useMessage } from 'naive-ui';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';

  type PreviewModel = {
    title: string | undefined;
    visible: boolean;
    content: string | undefined;
    language: string;
  };

  const highlightjs = shallowRef(hljsVuePlugin.component);

  const message = useMessage();

  const modelerRef = inject<Ref<Modeler>>(MODELER);

  const { proxy } = getCurrentInstance() as ComponentInternalInstance;

  const previewModel = ref<PreviewModel>({
    title: proxy?.$t('bpmn.toolbar.previewAs'),
    visible: false,
    content: '',
    language: '',
  });

  const bpmnModle = new BpmnModdle();

  const openXMLPreviewModel = async () => {
    try {
      const modeler = modelerRef?.value;
      if (!modeler) {
        return message.warning('模型加载失败，请刷新重试');
      }
      const { xml } = await modeler.saveXML({ format: true, preamble: true });
      previewModel.value.visible = true;
      previewModel.value.content = xml;
      previewModel.value.language = 'xml';
    } catch (e) {
      message.error((e as Error).message || (e as string));
    }
  };

  const openJsonPreviewModel = async () => {
    const modeler = modelerRef?.value;
    if (!modeler) {
      return message.warning('模型加载失败，请刷新重试');
    }
    const { xml } = await modeler.saveXML({ format: true });
    const jsonStr = await bpmnModle.fromXML(xml!);
    previewModel.value.visible = true;
    previewModel.value.content = JSON.stringify(jsonStr, null, 2);
    previewModel.value.language = 'json';
  };
</script>

<template>
  <n-popover>
    <div class="button-list_column">
      <n-button text @click="openXMLPreviewModel">
        {{ $t('bpmn.toolbar.previewAsXML') }}
      </n-button>
      <n-button text @click="openJsonPreviewModel">
        {{ $t('bpmn.toolbar.previewAsJSON') }}
      </n-button>
    </div>
    <template #trigger>
      <n-button>
        <template #icon>
          <n-icon>
            <icon-lucide-eye />
          </n-icon>
        </template>
      </n-button>
    </template>
  </n-popover>
  <n-dialog :title="previewModel.title" v-if="previewModel.visible" width="60%">
    <div class="preview-model">
      <highlightjs :language="previewModel.language" :code="previewModel.content as string" />
    </div>
  </n-dialog>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/toolbar.scss';
</style>
