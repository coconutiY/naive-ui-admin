<script setup lang="ts">
import { ComponentInternalInstance, inject } from 'vue-demi';
  import { propTypes } from '@/utils/propTypes';
  import { FormRules, useMessage } from 'naive-ui';
  import {
    ACTIVE_ELEMENT,
    MODELER,
    MODELER_BPMN_FACTORY,
    MODELER_CANVAS,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { Base } from 'diagram-js/lib/model';
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
  });
  const { proxy } = getCurrentInstance() as ComponentInternalInstance;
  const message = useMessage();
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);

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
      { required: true, message: proxy?.$t('bpmn.panel.rules.ebiElementIdRule'), trigger: 'blur' },
    ],
    elementName: [
      {
        required: true,
        message: proxy?.$t('bpmn.panel.rules.ebiElementNameRule'),
        trigger: 'blur',
      },
    ],
  };

  function reloadGenerationData(active: Base) {
    console.log(active, 'active');
    baseInfo.value.isProcess = active.type === 'bpmn:Process';
    baseInfo.value.elementId = active.id;
    baseInfo.value.elementName = getName(active) || '';
    if (baseInfo.value.isProcess) {
      baseInfo.value.elementExecutable = getProcessExecutable(active);
      baseInfo.value.elementVersion = getProcessVersionTag(active) || '';
    }
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
      <div class="collapse-title"><icon-lucide-info /> {{ $t('bpmn.panel.general') }}</div>
    </template>
    <template #default>
      <n-form :label-width="labelWidth" :rules="rules" :model="baseInfo">
        <n-form-item :label="$t('bpmn.panel.id')" prop="elementId" required>
          <n-input v-model:value="baseInfo.elementId" maxlength="32" @change="updateElementId" />
        </n-form-item>
        <n-form-item
          :label="baseInfo.isProcess ? $t('bpmn.panel.processName') : $t('bpmn.panel.nodeName')"
          prop="elementName"
          required
        >
          <n-input
            v-model:value="baseInfo.elementName"
            maxlength="20"
            @change="updateElementName"
          />
        </n-form-item>
        <template v-if="baseInfo.isProcess">
          <n-form-item key="version" :label="$t('bpmn.panel.version')" prop="elementVersion">
            <n-input
              v-model:value="baseInfo.elementVersion"
              maxlength="20"
              @change="updateElementVersion"
            />
          </n-form-item>
          <n-form-item
            key="executable"
            :label="$t('bpmn.panel.executable')"
            prop="elementExecutable"
          >
            <n-switch
              v-model:value="baseInfo.elementExecutable"
              @update:value="updateElementExecutable"
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
