<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import {
    getConditionExpressionValue,
    getConditionScriptBodyValue,
    getConditionScriptLanguageValue,
    getConditionScriptResourceValue,
    getConditionScriptTypeValue,
    getConditionTypeOptions,
    getConditionTypeValue,
    getVariableEventsValue,
    getVariableNameValue,
    setConditionExpressionValue,
    setConditionScriptBodyValue,
    setConditionScriptLanguageValue,
    setConditionScriptResourceValue,
    setConditionScriptTypeValue,
    setConditionTypeValue,
    setVariableEventsValue,
    setVariableNameValue,
  } from '@/components/Designer/src/utils/condition';
  import { ConditionalForm } from '/#/bpmn/bpmn-moddle/bpmn-form';
  import { scriptTypeOptions } from '@/components/Designer/src/config/selectOptions';
  import {
    isConditionEventDefinition,
    isExtendStartEvent,
  } from '@/components/Designer/src/utils/implType';

  defineOptions({ name: 'Conditional' });
  defineProps({
    labelWidth: propTypes.number.def(80),
    labelPlace: propTypes.string.def('left'),
    formSize: propTypes.string.def('small'),
  });
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<BpmnElement>>(ACTIVE_ELEMENT);

  // 变量配置部分
  const varVisible = ref(false);
  const variableName = ref('');
  const varEventVisible = ref(false);
  const variableEvents = ref('');
  // 条件类型配置部分
  const conditionTypeOptions = ref<Record<string, string>[]>([]);
  const conditionData = ref<ConditionalForm>({});
  /**
   * 获取元素变量
   */
  function getElementVariables(element: BpmnElement) {
    varVisible.value = isConditionEventDefinition(element);
    variableName.value = getVariableNameValue(element);
    if (varVisible.value) {
      varEventVisible.value = !isExtendStartEvent(element);
      variableEvents.value = getVariableEventsValue(element);
    }
  }

  /**
   * 获取元素条件类型
   */
  function getElementConditionType(element: BpmnElement) {
    conditionData.value.conditionType = getConditionTypeValue(element);
    conditionData.value.conditionType === 'expression' && getConditionExpression(element);
    conditionData.value.conditionType === 'script' && getConditionScript(element);
  }

  /**
   * 获取元素条件脚本
   */
  function getConditionScript(element: BpmnElement) {
    conditionData.value.language = getConditionScriptLanguageValue(element);
    conditionData.value.scriptType = getConditionScriptTypeValue(modelerRef!.value, element);
    conditionData.value.body = getConditionScriptBodyValue(element);
    conditionData.value.resource = getConditionScriptResourceValue(modelerRef!.value, element);
  }

  /**
   * 获取元素条件表达式
   */
  function getConditionExpression(element: BpmnElement) {
    conditionData.value.expression = getConditionExpressionValue(element);
  }

  /**
   * 获取元素变量名称
   */
  function setElementVariableName(value: string | undefined) {
    setVariableNameValue(modelerRef!.value, active!.value, value);
  }
  /**
   * 设置元素变量事件
   */
  function setElementVariableEvents(value: string | undefined) {
    setVariableEventsValue(modelerRef!.value, active!.value, value);
  }

  /**
   * 获取元素条件脚本类型
   */
  function setElementConditionScriptType(value: string | undefined) {
    setConditionScriptTypeValue(modelerRef!.value, active!.value, value);
  }

  /**
   * 设置元素条件类型
   */
  function setConditionType(value: string) {
    setConditionTypeValue(modelerRef!.value, active!.value, value);
  }

  /**
   * 设置元素条件表达式
   */
  function setConditionExpression(value: string | undefined) {
    setConditionExpressionValue(modelerRef!.value, active!.value, value);
  }

  /**
   * 设置元素条件脚本语言
   */
  function setConditionScriptLanguage(value: string | undefined) {
    setConditionScriptLanguageValue(modelerRef!.value, active!.value, value);
  }

  /**
   * 设置元素条件脚本内容
   */
  function setConditionScriptBody(value: string | undefined) {
    setConditionScriptBodyValue(modelerRef!.value, active!.value, value);
  }
  /**
   * 设置元素条件脚本资源
   */
  function setConditionScriptResource(value: string | undefined) {
    setConditionScriptResourceValue(modelerRef!.value, active!.value, value);
  }

  watch(
    () => active?.value,
    (value) => {
      if (value) {
        getElementVariables(value);
        getElementConditionType(value);
        conditionTypeOptions.value = getConditionTypeOptions(value);
      }
    }
  );
</script>

<template>
  <n-collapse-item name="Conditional">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-arrow-right-left /> {{ $t('bpmn.panel.conditionalSettings') }}</div
      >
    </template>
    <template #default>
      <div class="element-conditional">
        <n-form :size="formSize" :label-placement="labelPlace" :label-width="labelWidth">
          <template v-if="varVisible">
            <n-form-item
              key="variableName"
              :label="$t('bpmn.panel.variableName')"
              :label-width="labelWidth"
            >
              <n-input
                v-model:value="variableName"
                maxlength="32"
                @change="setElementVariableName"
              />
            </n-form-item>
            <n-form-item
              v-if="varEventVisible"
              key="variableEvent"
              :label="$t('bpmn.panel.variableEvents')"
              :label-width="labelWidth"
            >
              <n-input v-model:value="variableEvents" @change="setElementVariableEvents" />
            </n-form-item>
          </template>
          <n-form-item
            key="condition"
            :label="$t('bpmn.panel.conditionType')"
            :label-width="labelWidth"
          >
            <n-select
              v-model:value="conditionData.conditionType"
              :on-update:value="setConditionType"
              :options="conditionTypeOptions"
            />
          </n-form-item>
          <n-form-item
            v-if="conditionData.conditionType && conditionData.conditionType === 'expression'"
            key="expression"
            :label="$t('bpmn.panel.conditionExpression')"
            :label-width="labelWidth"
          >
            <n-input v-model:value="conditionData.expression" @change="setConditionExpression" />
          </n-form-item>
          <template v-if="conditionData.conditionType === 'script'">
            <n-form-item
              key="scriptType"
              :label="$t('bpmn.panel.scriptType')"
              :label-width="labelWidth"
            >
              <n-select
                v-model:value="conditionData.scriptType"
                :options="scriptTypeOptions"
                @change="setElementConditionScriptType"
              />
            </n-form-item>
            <n-form-item
              key="scriptLanguage"
              :label="$t('bpmn.panel.scriptLanguage')"
              :label-width="labelWidth"
            >
              <n-input
                v-model:value="conditionData.language"
                @change="setConditionScriptLanguage"
              />
            </n-form-item>
            <n-form-item
              v-show="conditionData.scriptType === 'inline'"
              key="scriptBody"
              :label="$t('bpmn.panel.scriptBody')"
              :label-width="labelWidth"
            >
              <n-input
                v-model:value="conditionData.body"
                type="textarea"
                @change="setConditionScriptBody"
              />
            </n-form-item>
            <n-form-item
              v-show="conditionData.scriptType === 'external'"
              key="scriptResource"
              :label="$t('bpmn.panel.scriptResource')"
              :label-width="labelWidth"
            >
              <n-input
                v-model:value="conditionData.resource"
                @change="setConditionScriptResource"
              />
            </n-form-item>
          </template>
        </n-form>
      </div>
    </template>
  </n-collapse-item>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
