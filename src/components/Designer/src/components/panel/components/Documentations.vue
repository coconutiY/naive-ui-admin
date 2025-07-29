<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { Base } from 'diagram-js/lib/model';
  import { getDocumentValue, setDocumentValue } from '@/components/Designer/src/utils/baseInfo';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import Modeler from 'bpmn-js/lib/Modeler';

  defineOptions({ name: 'Documentations' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const docValue = ref('');
  const modeler = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);

  function updateElementDoc(value: string) {
    setDocumentValue(modeler!.value, active!.value, value);
  }

  watch(
    () => active?.value,
    (newVal) => {
      if (newVal) {
        docValue.value = getDocumentValue(newVal);
      }
    }
  );
</script>

<template>
  <n-collapse-item name="document">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-file-text /> {{ $t('bpmn.panel.documentationSettings') }}</div
      >
    </template>
    <template #default>
      <n-form-item :label="$t('bpmn.panel.documentationBody')" :label-width="labelWidth">
        <n-input v-model:value="docValue" type="textarea" @change="updateElementDoc" />
      </n-form-item>
    </template>
  </n-collapse-item>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
