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
  import type { DataTableColumns } from 'naive-ui';
  import { NButton } from 'naive-ui';
  defineOptions({ name: 'ExtensionProperties' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const { t } = useI18n();
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);

  const propertyRef = ref();
  const activerPropertyIndex = ref(-1);
  const activerPropertyTitle = ref(t('bpmn.panel.addExtensionProperties'));
  const extensions = ref<BpmnExtensionProperty[]>([]);
  const propertiesRaw = ref<any[]>([]);
  const newProperty = ref<BpmnExtensionProperty>({ name: '', value: '' });
  const rules = ref({
    name: {
      required: true,
      message: t('bpmn.panel.rules.epNameRule'),
      trigger: ['blur', 'change'],
    },
    value: {
      required: true,
      message: t('bpmn.panel.rules.epValueRule'),
      trigger: ['blur', 'change'],
    },
  });

  const columns: DataTableColumns<BpmnExtensionProperty> = [
    {
      title: t('bpmn.panel.index'),
      key: 'index',
      titleAlign: 'center',
    },
    {
      title: t('bpmn.panel.propertyName'),
      key: 'name',
      titleAlign: 'center',
    },
    {
      title: t('bpmn.panel.propertyName'),
      key: 'value',
      titleAlign: 'center',
    },
    {
      title: t('bpmn.panel.operations'),
      key: 'actions',
      titleAlign: 'center',
      render(rowData: BpmnExtensionProperty, rowIndex: number) {
        return [
          h(NButton, {
            type: 'primary',
            onClick: () => editProperty(rowIndex, rowData),
          }),
          h(NButton, {
            type: 'error',
            onClick: () => removeProperty(rowIndex),
          }),
        ];
      },
    },
  ];
  const modelVisible = ref(false);

  async function reloadExtensionProperties() {
    newProperty.value = { name: '', value: '' };
    propertiesRaw.value = markRaw(getExtensionProperties(modelerRef!.value, active!.value));
    extensions.value = JSON.parse(JSON.stringify(propertiesRaw.value));
    await nextTick();
    modelVisible.value = false;
  }

  async function editProperty(index: number, poperty: BpmnExtensionProperty) {
    activerPropertyIndex.value = index;
    activerPropertyTitle.value = t('bpmn.panel.editExtensionProperties');
    modelVisible.value = true;
    await nextTick();
    propertyRef.value;
    newProperty.value = { name: poperty.name, value: poperty.value };
  }

  function removeProperty(propIndex: number) {
    removeExtensionProperty(modelerRef!.value, active!.value, propertiesRaw.value[propIndex]);
    reloadExtensionProperties();
  }

  async function saveProperty() {
    propertyRef.value?.validate(async (valid: boolean) => {
      if (valid) {
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
        await reloadExtensionProperties();
      }
    });
  }
  async function openPropertyModel() {
    activerPropertyIndex.value = -1;
    activerPropertyTitle.value = t('bpmn.panel.addExtensionProperties');
    modelVisible.value = true;
    await nextTick();
  }
  onMounted(async () => {
    await reloadExtensionProperties();
  });
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
  <n-modal v-model:show="modelVisible" :title="activerPropertyTitle" width="500">
    <n-form ref="propertyRef" :model="newProperty" :rules="rules" :label-width="labelWidth">
      <n-form-item prop="name" :label="$t('bpmn.panel.propertyName')">
        <n-input v-model:value="newProperty.name" @keydown.enter.prevent />
      </n-form-item>
      <n-form-item prop="value" :label="$t('bpmn.panel.propertyValue')">
        <n-input v-model:value="newProperty.value" @keydown.enter.prevent />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-button type="primary" @click="saveProperty">{{ $t('bpmn.panel.confirm') }}</n-button>
    </template>
  </n-modal>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
