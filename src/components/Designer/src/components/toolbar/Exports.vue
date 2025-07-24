<script setup name="Exports" lang="ts">
  import RiSaveLine from '~icons/ri/save-line';
  import { downloadFile, setEncoded } from '@/components/Designer/src/utils/files';
  import { ComponentInternalInstance } from 'vue-demi';
  import { getCurrentInstance, inject, Ref } from 'vue';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { useMessage } from 'naive-ui';

  const { proxy } = getCurrentInstance() as ComponentInternalInstance;
  const message = useMessage();
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  /**
   * 下载流程图到本地
   * @param type 文件类型
   * @param  name 文件名称
   */
  async function downloadProcess(type: string, name = 'diagram') {
    const modelerInstance = modelerRef?.value;
    if (!modelerInstance) {
      return message.warning(proxy?.$t('No modeler instance found') as string);
    }
    try {
      // 按需要类型创建文件并下载
      if (type === 'xml' || type === 'bpmn') {
        const { error, xml } = await modelerInstance.saveXML({});
        // 读取异常时抛出异常
        if (error) {
          console.error(`[Process Designer Warn ]: ${error.message || error}`);
        }
        const { href, filename } = setEncoded(type.toUpperCase(), name, xml!);
        downloadFile(href, filename);
      } else {
        const { svg } = await modelerInstance.saveSVG();
        // 读取异常时抛出异常
        const { href, filename } = setEncoded('SVG', name, svg!);
        downloadFile(href, filename);
      }
    } catch (e: any) {
      console.error(`[Process Designer Warn ]: ${e.message || e}`);
    }
  }

  function downloadProcessAsXml() {
    downloadProcess('xml');
  }

  function downloadProcessAsBpmn() {
    downloadProcess('bpmn');
  }

  function downloadProcessAsSvg() {
    downloadProcess('svg');
  }
</script>

<template>
  <n-popover>
    <template #default>
      <div class="button-list_column">
        <n-button text @click="downloadProcessAsBpmn">
          {{ $t('bpmn.toolbar.exportAsBPMN') }}
        </n-button>
        <n-button text @click="downloadProcessAsXml">
          {{ $t('bpmn.toolbar.exportAsXML') }}
        </n-button>
        <n-button text @click="downloadProcessAsSvg">
          {{ $t('bpmn.toolbar.exportAsSVG') }}
        </n-button>
      </div>
    </template>
    <template #reference>
      <n-button :icon="RiSaveLine" />
    </template>
  </n-popover>
</template>

<style scoped lang="scss"></style>
