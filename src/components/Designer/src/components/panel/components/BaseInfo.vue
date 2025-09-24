<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { FormRules, useMessage } from 'naive-ui';
  import {
    ACTIVE_ELEMENT,
    MODELER,
    MODELER_BPMN_FACTORY,
    MODELER_CANVAS,
  } from '@/components/Designer/src/config/bpmnEnums';
  import {
    getName,
    getProcessExecutable,
    getProcessVersionTag,
    setId,
    setName,
    setProcessExecutable,
    setProcessVersionTag,
  } from '@/components/Designer/src/utils/baseInfo';
  import Modeler from 'bpmn-js/lib/Modeler';
  import Canvas from 'diagram-js/lib/core/Canvas';
  import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';

  defineOptions({ name: 'BaseInfo' });
  defineProps({
    labelWidth: propTypes.number.def(80),
    labelPlace: propTypes.string.def('left'),
    formSize: propTypes.string.def('small'),
  });
  const { t } = useI18n();
  const message = useMessage();
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<BpmnElement>>(ACTIVE_ELEMENT);

  const canvas = computed(() => modelerRef!.value.get<Canvas>(MODELER_CANVAS));
  const bpmnFactory = computed(() => modelerRef!.value.get<BpmnFactory>(MODELER_BPMN_FACTORY));

  const baseInfo = ref({
    elementId: '',
    elementName: '',
    elementVersion: '',
    elementExecutable: true,
    isProcess: false,
  });

  const rules: FormRules = {
    elementId: [
      { required: true, message: t('bpmn.panel.rules.ebiElementIdRule'), trigger: 'blur' },
    ],
    elementName: [
      {
        required: true,
        message: t('bpmn.panel.rules.ebiElementNameRule'),
        trigger: 'blur',
      },
    ],
  };

  function reloadGenerationData(active: BpmnElement) {
    baseInfo.value.elementId = active.id;
    baseInfo.value.elementName = getName(active) || '';
    if (active.type === 'bpmn:Process') {
      baseInfo.value.elementExecutable = getProcessExecutable(active);
      baseInfo.value.elementVersion = getProcessVersionTag(active) || '';
    }
    if (active.type === 'bpmn:Participant') {
    }
    baseInfo.value.isProcess = active.type === 'bpmn:Process';
  }
  function updateElementName(value: string) {
    setName(modelerRef!.value, canvas.value, bpmnFactory.value, active!.value, value);
  }
  function updateElementId(value: string) {
    setId(modelerRef!.value, active!.value, value);
  }
  function updateElementVersion(value: string) {
    const reg = /((\d|([1-9](\d*))).){2}(\d|([1-9](\d*)))/;
    if (reg.test(value)) {
      setProcessVersionTag(modelerRef!.value, active!.value, value);
    } else {
      message.error('版本号必须符合语义化版本2.0.0 要点');
    }
  }
  function updateElementExecutable(value: boolean) {
    setProcessExecutable(modelerRef!.value, active!.value, value);
  }
  watch(
    () => active?.value,
    (value) => {
      if (value) {
        reloadGenerationData(value);
      }
    }
  );
</script>

<template>
  <n-collapse-item name="base-info">
    <template #header>
      <div class="collapse-title"><icon-lucide-info /> {{ t('bpmn.panel.general') }}</div>
    </template>
    <template #default>
      <n-form
        :label-width="labelWidth"
        :label-placement="labelPlace"
        :size="formSize"
        :rules="rules"
        :model="baseInfo"
      >
        <n-form-item :label="t('bpmn.panel.id')" path="elementId" required>
          <n-input
            v-model:value="baseInfo.elementId"
            maxlength="32"
            @update-value="updateElementId"
          />
        </n-form-item>
        <n-form-item
          :label="baseInfo.isProcess ? t('bpmn.panel.processName') : t('bpmn.panel.nodeName')"
          path="elementName"
          required
        >
          <n-input
            v-model:value="baseInfo.elementName"
            maxlength="20"
            @update-value="updateElementName"
          />
        </n-form-item>
        <template v-if="baseInfo.isProcess">
          <n-form-item key="version" :label="t('bpmn.panel.version')" path="elementVersion">
            <n-input
              v-model:value="baseInfo.elementVersion"
              maxlength="20"
              @update-value="updateElementVersion"
            />
          </n-form-item>
          <n-form-item
            key="executable"
            :label="t('bpmn.panel.executable')"
            path="elementExecutable"
          >
            <n-switch
              v-model:value="baseInfo.elementExecutable"
              @update-value="updateElementExecutable"
            />
          </n-form-item>
        </template>
      </n-form>
    </template>
  </n-collapse-item>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
