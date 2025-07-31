<script setup lang="ts">
  import { inject } from 'vue-demi';
  import { Ref } from 'vue';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { Base } from 'diagram-js/lib/model';
  import { propTypes } from '@/utils/propTypes';
  import {
    addExtensionProperty,
    editExtensionProperty,
    getExtensionProperties,
    removeExtensionProperty,
  } from '@/components/Designer/src/utils/extensionProperties';
  import { BpmnExtensionProperty } from '/#/bpmn/bpmn-moddle/bpmn-instance';
  import type { DataTableColumns, FormInst } from 'naive-ui';
  import { NButton } from 'naive-ui';
  defineOptions({ name: 'ExtensionProperties' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const lucideSquarePen = defineAsyncComponent(() => import('~icons/lucide/square-pen'));
  const lucideMinus = defineAsyncComponent(() => import('~icons/lucide/minus'));
  const { t } = useI18n();
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);

  const propertyRef = ref<FormInst | null>(null);
  const activerPropertyIndex = ref(-1);
  const activerPropertyTitle = ref(t('bpmn.panel.addExtensionProperties'));
  const extensions = ref<BpmnExtensionProperty[]>([]);
  const propertiesRaw = ref<any[]>([]);
  const newProperty = ref<BpmnExtensionProperty>({ name: '', value: '' });
  const rules = ref({
    name: {
      required: true,
      message: t('bpmn.panel.rules.epNameRule'),
      trigger: ['blur', 'change', 'input'],
    },
    value: {
      required: true,
      message: t('bpmn.panel.rules.epValueRule'),
      trigger: ['blur', 'change', 'input'],
    },
  });
  const columns: DataTableColumns<BpmnExtensionProperty> = [
    {
      title: t('bpmn.panel.propertyName'),
      key: 'name',
      align: 'center',
    },
    {
      title: t('bpmn.panel.propertyName'),
      key: 'value',
      align: 'center',
    },
    {
      title: t('bpmn.panel.operations'),
      key: 'actions',
      align: 'center',
      render(rowData: BpmnExtensionProperty, rowIndex: number) {
        return [
          h(
            NButton,
            {
              type: 'primary',
              circle: true,
              tertiary: true,
              onClick: () => editProperty(rowIndex, rowData),
            },
            {
              icon: () => h(lucideSquarePen),
            }
          ),
          h(
            NButton,
            {
              type: 'error',
              circle: true,
              tertiary: true,
              onClick: () => removeProperty(rowIndex),
            },
            {
              icon: () => h(lucideMinus),
            }
          ),
        ];
      },
    },
  ];
  const modelVisible = ref(false);
  async function reloadExtensionProperties() {
    resetForm();
    propertiesRaw.value = markRaw(getExtensionProperties(modelerRef!.value, active!.value));
    extensions.value = JSON.parse(JSON.stringify(propertiesRaw.value));
    await nextTick();
    modelVisible.value = false;
  }

  async function editProperty(index: number, poperty: BpmnExtensionProperty) {
    activerPropertyIndex.value = index;
    activerPropertyTitle.value = t('bpmn.panel.editExtensionProperties');
    modelVisible.value = true;
    propertyRef.value;
    Object.assign(modelVisible.value, poperty);
  }

  function removeProperty(propIndex: number) {
    removeExtensionProperty(modelerRef!.value, active!.value, propertiesRaw.value[propIndex]);
    reloadExtensionProperties();
  }

  async function saveProperty() {
    propertyRef.value?.validate((errors) => {
      console.log(errors, 'errors');
      if (!errors) {
        if (activerPropertyIndex.value === -1) {
          addExtensionProperty(modelerRef!.value, active!.value, toRaw(newProperty.value));
        } else {
          editExtensionProperty(
            modelerRef!.value,
            active!.value,
            newProperty.value,
            activerPropertyIndex.value
          );
        }
        reloadExtensionProperties();
      }
    });
  }
  async function openPropertyModel() {
    activerPropertyIndex.value = -1;
    activerPropertyTitle.value = t('bpmn.panel.addExtensionProperties');
    resetForm();
    modelVisible.value = true;
  }
  function resetForm() {
    propertyRef.value?.restoreValidation();
    Object.assign(newProperty.value, {
      name: '',
      value: '',
    });
  }

  watch(
    () => active?.value,
    async (value) => {
      if (value) {
        await reloadExtensionProperties();
      }
    }
  );
</script>

<template>
  <n-collapse-item name="ExtensionProperties">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-file-cog /> {{ $t('bpmn.panel.extensionProperties') }}</div
      >
    </template>
    <template #default>
      <div class="element-extension-properties">
        <n-data-table
          size="small"
          :columns="columns"
          :data="extensions"
          :fit="true"
          :max-height="400"
        />
        <n-button type="primary" secondary class="inline-large-button" @click="openPropertyModel">
          <template #icon>
            <n-icon>
              <icon-lucide-plus />
            </n-icon>
          </template>
          {{ $t('bpmn.panel.addExtensionProperties') }}
        </n-button>
      </div>
    </template>
  </n-collapse-item>
  <n-modal v-model:show="modelVisible">
    <n-card
      :bordered="false"
      size="small"
      :title="activerPropertyTitle"
      closable
      @close="() => (modelVisible = false)"
      style="width: 500px"
    >
      <n-form ref="propertyRef" :model="newProperty" :rules="rules" :label-width="labelWidth">
        <n-form-item path="name" :label="$t('bpmn.panel.propertyName')" required>
          <n-input v-model:value="newProperty.name" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="value" :label="$t('bpmn.panel.propertyValue')" required>
          <n-input v-model:value="newProperty.value" @keydown.enter.prevent />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button type="primary" size="medium" @click="saveProperty">{{
          $t('bpmn.panel.confirm')
        }}</n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
