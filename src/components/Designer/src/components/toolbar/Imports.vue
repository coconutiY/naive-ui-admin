<script setup lang="ts">
  import { inject, Ref, ref } from 'vue';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';

  const modelerRef = inject<Ref<Modeler>>(MODELER);

  const importRef = ref<HTMLInputElement | null>(null);

  function openImportWindow() {
    importRef.value && importRef.value.click();
  }

  function changeImportFile() {
    console.log(importRef.value, 'changeImportFile');
    if (importRef.value && importRef.value.files) {
      const file = importRef.value.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        const xmlStr = this.result;
        modelerRef!.value.importXML(xmlStr as string);
      };
      importRef.value.value = '';
      importRef.value.files = null;
    }
  }
</script>

<template>
  <n-tooltip>
    <template #trigger>
      <n-button @click="openImportWindow">
        <template #icon>
          <NIcon>
            <icon-lucide-folder-open />
          </NIcon>
        </template>
      </n-button>
    </template>
    {{ $t('bpmn.toolbar.openFile') }}
  </n-tooltip>
  <input
    type="file"
    ref="importRef"
    style="display: none"
    accept=".xml,.bpmn"
    @change="changeImportFile"
  />
</template>

<style scoped lang="scss"></style>
