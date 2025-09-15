<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import Modeler from 'bpmn-js/lib/Modeler';
  import {
    getAsyncAfter,
    getAsyncBefore,
    getExclusive,
    setAsyncBefore,
    setExclusive,
  } from '@/components/Designer/src/utils/asyncContinuations';

  defineOptions({ name: 'AsyncContinuations' });
  defineProps({
    labelWidth: propTypes.number.def(80),
    labelPlace: propTypes.string.def('left'),
    formSize: propTypes.string.def('small'),
  });

  const modeler = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<BpmnElement>>(ACTIVE_ELEMENT);

  const acBefore = ref(false);
  const acAfter = ref(false);
  const acExclusive = ref(false);

  const showExclusive = computed(() => {
    return acBefore.value || acAfter.value;
  });

  function reloadACStatus() {
    acBefore.value = getAsyncBefore(modeler!.value, active!.value);
    acAfter.value = getAsyncAfter(modeler!.value, active!.value);
    acExclusive.value = getExclusive(modeler!.value, active!.value);
  }
  function updateElementACBefore(value: boolean) {
    setAsyncBefore(modeler!.value, active!.value, value);
    reloadACStatus();
  }
  function updateElementACAfter(value: boolean) {
    setAsyncBefore(modeler!.value, active!.value, value);
    reloadACStatus();
  }
  function updateElementACExclusive(value: boolean) {
    setExclusive(modeler!.value, active!.value, value);
    reloadACStatus();
  }

  watch(
    () => active?.value,
    (value) => {
      if (value) {
        reloadACStatus();
      }
    }
  );
</script>

<template>
  <n-collapse-item name="AsyncContinuations">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-shuffle /> {{ $t('bpmn.panel.asyncContinuations') }}</div
      >
    </template>
    <template #default>
      <div class="async-continuations">
        <n-form :label-placement="labelPlace" :label-width="labelWidth" :size="formSize">
          <n-form-item :label="$t('bpmn.panel.asyncBefore')" :label-width="labelWidth">
            <n-switch v-model:value="acBefore" :on-update:value="updateElementACBefore" />
          </n-form-item>
          <n-form-item :label="$t('bpmn.panel.asyncAfter')" :label-width="labelWidth">
            <n-switch v-model:value="acAfter" :on-update:value="updateElementACAfter" />
          </n-form-item>
          <n-form-item
            v-if="showExclusive"
            :label="$t('bpmn.panel.asyncExclusive')"
            :label-width="labelWidth"
          >
            <n-switch v-model:value="acExclusive" :on-update:value="updateElementACExclusive" />
          </n-form-item>
        </n-form>
      </div>
    </template>
  </n-collapse-item>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
