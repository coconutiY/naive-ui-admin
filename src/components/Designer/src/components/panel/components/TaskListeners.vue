<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { ListenersForm } from '/#/bpmn/declares/bpmn-form';
  import {
    fieldTypeOptions,
    listenerTypeOptions,
    taskListenerEventTypes,
  } from '@/components/Designer/src/config/selectOptions';
  import { ModdleElement } from 'bpmn-js/lib/model/Types';
  import { DataTableColumns, FormInst, FormRules, NButton } from 'naive-ui';
  import { BpmnField } from '/#/bpmn/declares/bpmn-instance';
  import {
    addTaskListener,
    getTaskListenerForms,
    getTaskListeners,
    removeListener,
    updateTaskListener,
  } from '@/components/Designer/src/utils/listeners';

  defineOptions({ name: 'TaskListeners' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const { t } = useI18n();
  const lucideSquarePen = defineAsyncComponent(() => import('~icons/lucide/square-pen'));
  const lucideMinus = defineAsyncComponent(() => import('~icons/lucide/minus'));
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<BpmnElement>>(ACTIVE_ELEMENT);

  // 模态框
  const modelTitle = ref(t('bpmn.panel.addTaskListener'));
  const modelVisible = ref(false);
  const dialogModelTitle = ref(t('bpmn.panel.addField'));
  const dialogModelVisible = ref(false);

  //索引
  const activeIndex = ref(-1);
  const dialogActiveIndex = ref(-1);

  let listenersRaw = markRaw<ModdleElement[]>([]);

  const listeners = ref<ListenersForm[]>([]);
  //监听器列表配置
  const listenerColumns: DataTableColumns<ListenersForm> = [
    {
      title: t('bpmn.panel.executionListenerEventType'),
      key: 'event',
      align: 'center',
      render(rowData: ListenersForm) {
        return t(`bpmn.panel.${rowData.event}`);
      },
    },
    {
      title: t('bpmn.panel.executionListenerType'),
      key: 'type',
      align: 'center',
      render(rowData: ListenersForm) {
        return t(`bpmn.panel.${rowData.type}`);
      },
    },
    {
      title: t('bpmn.panel.value'),
      key: 'value',
      align: 'center',
      render(rowData: ListenersForm) {
        return rowData.value;
      },
    },
    {
      title: t('bpmn.panel.operations'),
      key: 'actions',
      align: 'center',
      render(rowData: ListenersForm, rowIndex: number) {
        return [
          h(
            NButton,
            {
              type: 'primary',
              circle: true,
              tertiary: true,
              onClick: () => openListenerDrawer(rowIndex, rowData),
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
              onClick: () => removeTaskListener(rowIndex),
            },
            {
              icon: () => h(lucideMinus),
            }
          ),
        ];
      },
    },
  ];
  //注入字段列表
  const fieldsColumn: DataTableColumns<BpmnField> = [
    {
      title: t('bpmn.panel.fieldName'),
      key: 'name',
      align: 'center',
    },
    {
      title: t('bpmn.panel.fieldType'),
      key: 'fieldType',
      align: 'center',
      render(rowData: BpmnField) {
        return t(`bpmn.panel.${rowData.fieldType}`);
      },
    },
    {
      title: t('bpmn.panel.fieldValue'),
      key: 'value',
      align: 'center',
      render(rowData: BpmnField) {
        return rowData.string ?? rowData.expression;
      },
    },
    {
      title: t('bpmn.panel.operations'),
      key: 'actions',
      align: 'center',
      render(rowData: BpmnField, rowIndex: number) {
        return [
          h(
            NButton,
            {
              type: 'primary',
              circle: true,
              tertiary: true,
              onClick: () => editFieldRow(rowIndex, rowData),
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
              onClick: () => removeFieldRow(rowIndex),
            },
            {
              icon: () => h(lucideMinus),
            }
          ),
        ];
      },
    },
  ];
  //监听器表单
  const newListener = ref<ListenersForm>({
    event: 'create',
    type: 'class',
    value: '',
    fields: [],
  });
  //字段注入表单
  const newField = ref<BpmnField>({
    name: '',
    fieldType: 'string',
    expression: undefined,
    stringValue: undefined,
    string: undefined,
  });
  //监听器表单实例
  const formRef = ref<FormInst>();
  //注入表单实例
  const fieldFormRef = ref<FormInst>();
  //监听器表单规则
  const listenerRules: FormRules = {
    event: { required: true, trigger: ['blur', 'change'], message: t('bpmn.panel.rules.elEvent') },
    type: { required: true, trigger: ['blur', 'change'], message: t('bpmn.panel.rules.elType') },
  };
  //注入字段表单规则
  const fieldRules = ref({
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

  async function openListenerDrawer(index: number, listenerData?: ListenersForm) {
    activeIndex.value = index;
    modelVisible.value = true;
    resetForm();
    modelTitle.value = listenerData
      ? t('bpmn.panel.editTaskListener')
      : t('bpmn.panel.addTaskListener');
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
   * 重置表单
   */
  function resetForm() {
    formRef.value?.restoreValidation();
    Object.assign(newListener.value, {
      event: 'create',
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

  /**
   * 保存执行监听器并重载数据
   */
  async function saveTaskListener() {
    await formRef.value?.validate((errors) => {
      if (!errors) {
        activeIndex.value === -1
          ? addTaskListener(modelerRef!.value, active!.value, newListener.value)
          : updateTaskListener(
              modelerRef!.value,
              active!.value,
              newListener.value,
              listenersRaw[activeIndex.value]
            );
        reloadTaskListeners();
      }
    });
  }

  /**
   * 删除执行监听器
   * @param index
   */
  function removeTaskListener(index: number) {
    const listener: ModdleElement = listenersRaw[index];
    removeListener(modelerRef!.value, active!.value, listener);
    reloadTaskListeners();
  }

  /**
   * 保存字段数据
   */
  function saveField() {
    fieldFormRef.value?.validate((errors) => {
      if (!errors) {
        if (dialogActiveIndex.value === -1) {
          newListener.value.fields.push(JSON.parse(JSON.stringify(newField.value)));
        } else if (newListener.value.fields) {
          newListener.value.fields[dialogActiveIndex.value] = JSON.parse(
            JSON.stringify(newField.value)
          );
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
  function removeFieldRow(index: number) {
    newListener.value.fields?.splice(index, 1);
  }

  /**
   * 重载执行监听器数据
   */
  function reloadTaskListeners() {
    modelVisible.value = false;
    const taskListeners = getTaskListeners(modelerRef!.value, active!.value);
    listenersRaw = markRaw(taskListeners);
    listeners.value = getTaskListenerForms(modelerRef!.value, taskListeners);
  }

  watch(
    () => active?.value,
    (value) => {
      if (value) {
        reloadTaskListeners();
      }
    }
  );
</script>

<template>
  <n-collapse-item name="TaskListeners">
    <template #header>
      <div class="collapse-title">
        <icon-lucide-clipboard-pen-line />
        {{ t('bpmn.panel.taskListener') }}
      </div>
    </template>
    <template #default>
      <n-data-table
        :data="listeners"
        :columns="listenerColumns"
        :max-height="400"
        :empty-text="t('global.dataEmpty')"
      />
      <n-button type="primary" secondary @click="openListenerDrawer(-1)" style="width: 100%">
        <template #icon>
          <n-icon>
            <icon-lucide-plus />
          </n-icon>
        </template>
        {{ t('bpmn.panel.addTaskListener') }}
      </n-button>
    </template>
  </n-collapse-item>
  <!-- 监听器抽屉 -->
  <n-drawer v-model:show="modelVisible" :width="600">
    <n-drawer-content :title="modelTitle">
      <n-form ref="formRef" :model="newListener" :rules="listenerRules" :label-width="labelWidth">
        <n-form-item path="event" :label="t('bpmn.panel.executionListenerEventType')">
          <n-select v-model:value="newListener.event" :options="taskListenerEventTypes" />
        </n-form-item>
        <n-form-item path="type" :label="t('bpmn.panel.executionListenerType')">
          <n-select v-model:value="newListener.type" :options="listenerTypeOptions" />
        </n-form-item>
        <n-form-item path="value" :label="t('bpmn.panel.value')">
          <n-input v-model:value="newListener.value" />
        </n-form-item>
      </n-form>
      <div class="field-content">
        <n-divider>
          <div class="divider-panel">
            <icon-lucide-folder-input />
            <span>{{ t('bpmn.panel.injectField') }}</span>
          </div>
        </n-divider>
        <n-data-table :data="newListener.fields" :columns="fieldsColumn" />
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
          <n-button type="primary" @click="saveTaskListener"
            >{{ t('bpmn.panel.confirm') }}
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
  <!-- 字段弹窗 -->
  <n-modal v-model:show="dialogModelVisible">
    <n-card :title="dialogModelTitle" :style="{ width: '640px' }">
      <n-form ref="fieldFormRef" :model="newField" :rules="fieldRules" :label-width="labelWidth">
        <n-form-item path="name" :label="t('bpmn.panel.fieldName')">
          <n-input v-model:value="newField.name" clearable />
        </n-form-item>
        <n-form-item path="fieldType" :label="t('bpmn.panel.fieldType')">
          <n-select v-model:value="newField.fieldType" :options="fieldTypeOptions" />
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
          <n-button @click="() => (dialogModelVisible = false)">{{ t('global.cancel') }}</n-button>
          <n-button type="primary" @click="saveField">{{ t('bpmn.panel.confirm') }}</n-button>
        </span>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
