<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { Base } from 'diagram-js/lib/model';
  import { getDocument, setDocument } from '@/components/Designer/src/utils/baseInfo';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import Modeler from 'bpmn-js/lib/Modeler';

  defineOptions({ name: 'Documentations' });
  defineProps({
    labelWidth: propTypes.number.def(80),
    labelPlace: propTypes.string.def('left'),
    formSize: propTypes.string.def('small'),
  });
  const docValue = ref('');
  const modeler = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);

  function updateElementDoc(value: string) {
    setDocument(modeler!.value, active!.value, value);
  }

  watch(
    () => active?.value,
    (newVal) => {
      if (newVal) {
        docValue.value = getDocument(newVal);
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
      <n-form :label-width="labelWidth" :label-placement="labelPlace" :size="formSize">
        <n-form-item :label="$t('bpmn.panel.documentationBody')" :label-width="labelWidth">
          <n-input v-model:value="docValue" type="textarea" @update-value="updateElementDoc" />
        </n-form-item>
      </n-form>
    </template>
  </n-collapse-item>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
