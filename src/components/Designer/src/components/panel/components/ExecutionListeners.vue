<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { Base } from 'diagram-js/lib/model';
  import { type DataTableColumns, FormInst, FormRules, NButton } from 'naive-ui';
  import {
    addExecutionListener,
    getDefaultEvent,
    getExecutionListeners,
    getExecutionListenerType,
    removeExecutionListener,
    updateExecutionListener,
  } from '@/components/Designer/src/utils/listeners';
  import { ModdleElement } from 'bpmn-js/lib/model/Types';
  import { BpmnExecutionListener, BpmnField, BpmnScript } from '/#/bpmn/bpmn-moddle/bpmn-instance';
  import { ExecutionListenerForm } from '/#/bpmn/bpmn-moddle/bpmn-form';
  import { getScriptType } from '@/components/Designer/src/utils/tools';
  import {
    fieldTypeList,
    listenerEventTypeOptions,
    listenerTypeOptions,
  } from '@/components/Designer/src/config/selectOptions';

  defineOptions({ name: 'ExecutionListeners' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const { t } = useI18n();
  const lucideSquarePen = defineAsyncComponent(() => import('~icons/lucide/square-pen'));
  const lucideMinus = defineAsyncComponent(() => import('~icons/lucide/minus'));
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);
  let listenersRaw = markRaw<ModdleElement[]>([]);
  let activeIndex = -1;
  const modelVisible = ref(false);
  const dialogModelVisible = ref(false);
  const dialogActiveIndex = ref(-1);
  const dialogModelTitle = ref(t('bpmn.panel.addField'));
  const modelTitle = ref(t('bpmn.panel.addExecutionListener'));
  const listeners = ref<ExecutionListenerForm[]>([]);
  const listenerColumns: DataTableColumns<ExecutionListenerForm> = [
    {
      title: t('bpmn.panel.index'),
      key: 'index',
      align: 'center',
    },
    {
      title: t('bpmn.panel.executionListenerEventType'),
      key: 'event',
      align: 'center',
      render(rowData: ExecutionListenerForm) {
        return t(`bpmn.panel.${rowData.event}`);
      },
    },
    {
      title: t('bpmn.panel.executionListenerType'),
      key: 'type',
      align: 'center',
      render(rowData: ExecutionListenerForm) {
        return t(`bpmn.panel.${rowData.type}`);
      },
    },
    {
      title: t('bpmn.panel.operations'),
      key: 'actions',
      align: 'center',
      render(rowData: ExecutionListenerForm, rowIndex: number) {
        return [
          h(
            NButton,
            {
              type: 'primary',
              circle: true,
              tertiary: true,
              onClick: () => openListenerModel(rowIndex, rowData),
            },
            {
              icon: () => lucideSquarePen,
            }
          ),
          h(
            NButton,
            {
              type: 'error',
              circle: true,
              tertiary: true,
              onClick: () => removeListener(rowIndex),
            },
            {
              icon: () => lucideMinus,
            }
          ),
        ];
      },
    },
  ];
  const newListener = ref<ExecutionListenerForm>({
    event: getDefaultEvent(active!.value),
    type: 'class',
    fields: [],
  });
  const newField = ref<BpmnField>({
    name: '',
    fieldType: 'string',
    expression: undefined,
    stringValue: undefined,
    string: undefined,
  });
  const formRef = ref<FormInst>();
  const fieldFormRef = ref<FormInst>();
  const formItemVisible = ref({
    listenerType: 'class',
    scriptType: 'none',
  });
  const formRules: FormRules = {
    event: { required: true, trigger: ['blur', 'change'], message: t('bpmn.panel.rules.elEvent') },
    type: { required: true, trigger: ['blur', 'change'], message: t('bpmn.panel.rules.elType') },
  };
  const dialogRules = ref({
    name: { required: true, message: t('bpmn.panel.rules.fieldName'), trigger: ['blur', 'change'] },
    fieldType: {
      required: true,
      message: t('bpmn.panel.rules.fieldType'),
      trigger: ['blur', 'change'],
    },
    string: {
      required: true,
      message: t('bpmn.panel.rules.fieldString'),
      trigger: ['blur', 'change'],
    },
    expression: {
      required: true,
      message: t('bpmn.panel.rules.fieldExpression'),
      trigger: ['blur', 'change'],
    },
  });

  /**
   * 修改监听器类型
   * @param value
   */
  function updateListenerType(value: string) {
    formItemVisible.value.listenerType = value;
  }

  /**
   * 修改脚本类型
   * @param value
   */
  function updateScriptType(value: string) {
    formItemVisible.value.scriptType = value;
    newListener.value.script = {
      scriptFormat: newListener.value.script?.scriptFormat,
      scriptType: value,
    };
  }

  /**
   * 获取注入字段的类型
   */
  function getBpmnFields(fields: BpmnField[] | undefined) {
    return fields
      ? fields.map(
          (field: BpmnField): BpmnField => ({
            ...field,
            fieldType: field.string ? 'string' : 'expression',
          })
        )
      : [];
  }

  /**
   * 重载执行监听器数据
   */
  function reloadExtensionListeners() {
    modelVisible.value = false;
    listenersRaw = markRaw(getExecutionListeners(modelerRef!.value, active!.value));
    const list = listenersRaw.map(
      (item: ModdleElement & BpmnExecutionListener): ExecutionListenerForm => ({
        ...item,
        fields: getBpmnFields(item.fields),
        ...(item.script
          ? {
              script: {
                ...item.script,
                scriptType: getScriptType(item.script as ModdleElement & BpmnScript),
              },
            }
          : {}),
        type: getExecutionListenerType(modelerRef!.value, item),
      })
    );
    listeners.value = JSON.parse(JSON.stringify(list));
  }

  /**
   * 删除执行监听器
   * @param index
   */
  function removeListener(index: number) {
    const listener: ModdleElement = listenersRaw[index];
    removeExecutionListener(modelerRef!.value, active!.value, listener);
    reloadExtensionListeners();
  }

  /**
   * 保存执行监听器并重载数据
   */
  async function saveExecutionListener() {
    await formRef.value?.validate();
    activeIndex === -1
      ? addExecutionListener(modelerRef!.value, active!.value, newListener.value)
      : updateExecutionListener(
          modelerRef!.value,
          active!.value,
          newListener.value,
          listenersRaw[activeIndex]
        );
    reloadExtensionListeners();
  }

  /**
   * 打开执行监听器表单 <BR/>
   * 若 <BR/>
   * @param index 索引
   * @param listenerData 监听器数据
   */
  async function openListenerModel(index: number, listenerData?: ExecutionListenerForm) {
    activeIndex = index;
    modelVisible.value = true;
    resetForm();
    modelTitle.value = listenerData
      ? t('bpmn.panel.editExecutionListener')
      : t('bpmn.panel.addExecutionListener');
    listenerData && (newListener.value = JSON.parse(JSON.stringify(listenerData)));
  }

  /**
   * 打开字段注入表单
   */
  async function openFieldModel() {
    dialogModelTitle.value = t('bpmn.panel.addField');
    dialogActiveIndex.value = -1;
    dialogModelVisible.value = true;
    resetFieldForm();
  }

  /**
   * 关闭字段注入表单
   */
  function closeFieldModel() {
    dialogModelVisible.value = false;
  }

  /**
   * 保存字段数据
   */
  function saveField() {
    fieldFormRef.value?.validate((valid) => {
      if (valid) {
        if (dialogActiveIndex.value === -1) {
          newListener.value.fields?.push(JSON.parse(JSON.stringify(newField.value)));
        } else {
          newListener.value.fields &&
            (newListener.value.fields[dialogActiveIndex.value] = JSON.parse(
              JSON.stringify(newField.value)
            ));
        }
        dialogModelVisible.value = false;
      }
    });
  }

  /**
   * 删除注入字段
   */
  function editFieldRow(index: number, rowData: BpmnField) {
    dialogActiveIndex.value = index;
    dialogModelTitle.value = t('bpmn.panel.editField');
    dialogModelVisible.value = true;
    resetFieldForm();
    newField.value = { ...rowData };
  }

  /**
   * 删除注入字段
   */
  function deleteFieldRow(index: number) {
    newListener.value.fields?.splice(index, 1);
  }

  /**
   * 重置表单
   */
  function resetForm() {
    formRef.value?.restoreValidation();
    Object.assign(newListener.value, {
      event: getDefaultEvent(active!.value),
      type: 'class',
      fields: [],
    });
  }

  function resetFieldForm() {
    fieldFormRef.value?.restoreValidation();
    Object.assign(newField.value, {
      name: '',
      fieldType: 'string',
      expression: undefined,
      stringValue: undefined,
      string: undefined,
    });
  }

  watch(
    () => active?.value,
    (value) => {
      if (value) {
        reloadExtensionListeners();
      }
    }
  );
</script>

<template>
  <n-collapse-item name="ExecutionListeners">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-bell-ring /> {{ t('bpmn.panel.executionListeners') }}</div
      >
    </template>
    <template #default>
      <n-data-table
        :data="listeners"
        :columns="listenerColumns"
        :max-height="400"
        :empty-text="t('global.dataEmpty')"
      />
      <n-button type="primary" secondary @click="openListenerModel(-1)" style="width: 100%">
        <template #icon>
          <n-icon>
            <icon-lucide-plus />
          </n-icon>
        </template>
        {{ t('bpmn.panel.addExecutionListener') }}
      </n-button>
    </template>
  </n-collapse-item>
  <!-- 监听器抽屉 -->
  <n-drawer v-model:show="modelVisible" :title="modelTitle" :width="500">
    <n-drawer-content>
      <n-form ref="formRef" :model="newListener" :rules="formRules" :label-width="labelWidth">
        <n-form-item path="event" :label="t('bpmn.panel.executionListenerEventType')">
          <n-select v-model:value="newListener.event" :options="listenerEventTypeOptions" />
        </n-form-item>
        <n-form-item path="type" :label="t('bpmn.panel.executionListenerType')">
          <n-select
            v-model:value="newListener.type"
            :on-update:value="updateListenerType"
            :options="listenerTypeOptions"
          />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'class'"
          path="class"
          :label="t('bpmn.panel.javaClass')"
        >
          <n-input v-model:value="newListener.class" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'expression'"
          path="expression"
          :label="t('bpmn.panel.expression')"
        >
          <n-input v-model:value="newListener.expression" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'delegateExpression'"
          path="delegateExpression"
          :label="t('bpmn.panel.delegateExpression')"
        >
          <n-input v-model:value="newListener.delegateExpression" @keydown.enter.prevent />
        </n-form-item>
        <template v-if="formItemVisible.listenerType === 'script' && newListener.script">
          <n-form-item
            key="scriptFormat"
            path="script.scriptFormat"
            :label="t('bpmn.panel.scriptFormat')"
          >
            <n-input v-model:value="newListener.script.scriptFormat" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item
            key="scriptType"
            path="script.scriptType"
            :label="t('bpmn.panel.scriptType')"
          >
            <n-select
              v-model:value="newListener.script.scriptType"
              :on-update:value="updateScriptType"
              :options="scriptTypeOptions"
            />
          </n-form-item>
          <n-form-item
            v-if="formItemVisible.scriptType === 'inline'"
            key="scriptContent"
            path="script.value"
            :label="t('bpmn.panel.scriptBody')"
          >
            <n-input
              v-model:value="newListener.script.value"
              type="textarea"
              @keydown.enter.prevent
            />
          </n-form-item>
          <n-form-item
            v-if="formItemVisible.scriptType === 'external'"
            key="scriptResource"
            path="script.resource"
            :label="t('bpmn.panel.scriptResource')"
          >
            <n-input v-model:value="newListener.script.resource" @keydown.enter.prevent />
          </n-form-item>
        </template>
      </n-form>
      <div class="field-content">
        <n-divider>
          <div class="divider-panel">
            <icon-lucide-folder-input />
            <span>{{ t('bpmn.panel.injectField') }}</span>
          </div>
        </n-divider>
        <n-data-table :data="newListener['fields']" />
        <n-button type="primary" secondary @click="openFieldModel" style="width: 100%">
          <template #icon>
            <n-icon>
              <icon-lucide-plus />
            </n-icon>
          </template>
          {{ t('bpmn.panel.addField') }}
        </n-button>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <n-button @click="modelVisible = false">{{ t('global.cancel') }}</n-button>
          <n-button type="primary" @click="saveExecutionListener">{{
            t('bpmn.panel.confirm')
          }}</n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
  <!-- 字段弹窗 -->
  <n-modal v-model:show="dialogModelVisible">
    <n-card :title="dialogModelTitle" :style="{ width: '640px' }">
      <n-form ref="fieldFormRef" :model="newField" :rules="dialogRules" :label-width="labelWidth">
        <n-form-item path="name" :label="t('bpmn.panel.fieldName')">
          <n-input v-model:value="newField.name" clearable />
        </n-form-item>
        <n-form-item path="fieldType" :label="t('bpmn.panel.fieldType')">
          <n-select v-model:value="newField.fieldType" :options="fieldTypeList" />
        </n-form-item>
        <n-form-item
          path="string"
          v-if="newField.fieldType === 'string'"
          :label="t('bpmn.panel.fieldValue')"
        >
          <n-input type="textarea" v-model:value="newField.string" clearable />
        </n-form-item>
        <n-form-item
          path="expression"
          v-if="newField.fieldType === 'expression'"
          :label="t('bpmn.panel.expression')"
        >
          <n-input type="textarea" v-model:value="newField.expression" clearable />
        </n-form-item>
      </n-form>
      <template #footer>
        <span class="modal-footer">
          <n-button @click="closeFieldModel">{{ t('global.cancel') }}</n-button>
          <n-button type="primary" @click="saveField">{{ t('bpmn.panel.confirm') }}</n-button>
        </span>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
