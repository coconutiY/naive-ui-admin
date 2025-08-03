<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import {
    getExternalTaskValue,
    getRetryTimeCycleValue,
    retryTimeCycleVisible,
    setExternalTaskValue,
    setRetryTimeCycleValue,
    taskPriorityVisible,
  } from '@/components/Designer/src/utils/jobExcursion';
  import { Base } from 'diagram-js/lib/model';

  defineOptions({ name: 'JobExecution' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);

  const retryTimeCycle = ref<string | undefined>(undefined);
  const rtVisible = ref<boolean>(false);
  const getRetryTimeCycle = () => {
    rtVisible.value = retryTimeCycleVisible(modelerRef!.value, active!.value);
    retryTimeCycle.value = getRetryTimeCycleValue(modelerRef!.value, active!.value) || '';
  };
  const setRetryTimeCycle = (value: string | undefined) => {
    setRetryTimeCycleValue(modelerRef!.value, active!.value, value);
  };

  const taskPriority = ref<string | undefined>(undefined);
  const tpVisible = ref<boolean>(false);
  const getExternalTaskPriority = () => {
    tpVisible.value = taskPriorityVisible(modelerRef!.value, active!.value);
    taskPriority.value = getExternalTaskValue(modelerRef!.value, active!.value) || '';
  };
  const setExternalTaskPriority = (value: string | undefined) => {
    setExternalTaskValue(modelerRef!.value, active!.value, value);
  };

  watch(
    () => active?.value,
    () => {
      getRetryTimeCycle();
      getExternalTaskPriority();
    }
  );
</script>

<template>
  <n-collapse-item name="JobExecution">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-calendar-clock /> {{ $t('bpmn.panel.executionJob') }}</div
      >
    </template>
    <template #default>
      <div>
        <n-form-item
          v-if="tpVisible"
          :label="$t('bpmn.panel.taskPriority')"
          :labn-width="labelWidth"
        >
          <n-input v-model="taskPriority" maxlength="32" @change="setExternalTaskPriority" />
        </n-form-item>
        <n-form-item
          v-if="rtVisible"
          :label="$t('bpmn.panel.retryTimeCycle')"
          :labn-width="labelWidth"
        >
          <n-input v-model="retryTimeCycle" maxlength="32" @change="setRetryTimeCycle" />
        </n-form-item>
      </div>
    </template>
  </n-collapse-item>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
