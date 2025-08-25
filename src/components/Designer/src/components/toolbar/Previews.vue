<script setup lang="ts">
  import BpmnModdle from 'bpmn-moddle';
  import { useMessage } from 'naive-ui';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import 'highlight.js/styles/github.css';
  import 'highlight.js/lib/common';
  import hljs from 'highlight.js/lib/core';
  import xml from 'highlight.js/lib/languages/xml';
  import json from 'highlight.js/lib/languages/json';
  import vkbeautify from 'vkbeautify';
  import { DEFAULT_LABEL_SIZE } from 'bpmn-js/lib/util/LabelUtil';
  import height = DEFAULT_LABEL_SIZE.height;

  type PreviewModel = {
    title: string | undefined;
    visible: boolean;
    content: string | undefined;
    language: string;
  };

  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('json', json);
  const message = useMessage();
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const { t } = useI18n();

  const previewModel = ref<PreviewModel>({
    title: t('bpmn.toolbar.previewAs'),
    visible: false,
    content: '',
    language: '',
  });

  const bpmnModdle = new BpmnModdle();

  const openXMLPreviewModel = async () => {
    try {
      const modeler = modelerRef?.value;
      if (!modeler) {
        return message.warning('模型加载失败，请刷新重试');
      }
      const { xml } = await modeler.saveXML({ format: true, preamble: true });
      const formatted = vkbeautify.xml(xml as string);
      previewModel.value.content = hljs.highlight(formatted, { language: 'xml' }).value;
      previewModel.value.visible = true;
      previewModel.value.language = 'language-xml';
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
    const jsonStr = await bpmnModdle.fromXML(xml as string);
    const formatted = vkbeautify.xml(JSON.stringify(jsonStr, null, 2));
    previewModel.value.content = hljs.highlight(formatted, { language: 'json' }).value;
    previewModel.value.visible = true;
    previewModel.value.language = 'language-json';
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
  <n-modal v-model:show="previewModel.visible">
    <n-card :title="previewModel.title" :style="{ width: '64vw', 'max-height': '80vh' }">
      <n-scrollbar :size="1">
      <div class="preview-model">
        <pre><code :class="previewModel.language" v-html="previewModel.content"></code></pre>
      </div>
      </n-scrollbar>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/toolbar.scss';
</style>
