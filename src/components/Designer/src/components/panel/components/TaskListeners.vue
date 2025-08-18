<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { Base } from 'diagram-js/lib/model';

  defineOptions({ name: 'TaskListeners' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const { t } = useI18n();
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);
</script>

<template>
  <n-collapse-item name="TaskListeners">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-clipboard-pen-line /> {{ t('bpmn.panel.taskListener') }}</div
      >
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
  <n-drawer v-model="modelVisible" :title="modelTitle">
    <n-drawer-content>
      <n-form ref="formRef" :model="newListener" :rules="formRules" :label-width="labelWidth">
        <n-form-item path="event" :label="t('bpmn.panel.executionListenerEventType')">
          <n-select v-model="newListener.event" :options="taskListenerEventTypes" />
        </n-form-item>
        <n-form-item path="type" :label="t('bpmn.panel.executionListenerType')">
          <n-select
            v-model="newListener.type"
            @change="updateListenerType"
            :options="listenerTypeOptions"
          />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'class'"
          path="class"
          :label="t('bpmn.panel.javaClass')"
        >
          <n-input v-model="newListener.class" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'expression'"
          path="expression"
          :label="t('bpmn.panel.expression')"
        >
          <n-input v-model="newListener.expression" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'delegateExpression'"
          path="delegateExpression"
          :label="t('bpmn.panel.delegateExpression')"
        >
          <n-input v-model="newListener.delegateExpression" @keydown.enter.prevent />
        </n-form-item>
        <template v-if="formItemVisible.listenerType === 'script' && newListener.script">
          <n-form-item
            key="scriptFormat"
            path="script.scriptFormat"
            :label="t('bpmn.panel.scriptFormat')"
          >
            <n-input v-model="newListener.script.scriptFormat" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item
            key="scriptType"
            path="script.scriptType"
            :label="t('bpmn.panel.scriptType')"
          >
            <n-select
              v-model="newListener.script.scriptType"
              @change="updateScriptType"
              :options="scriptTypeOptions"
            />
          </n-form-item>
          <n-form-item
            v-if="formItemVisible.scriptType === 'inline'"
            key="scriptContent"
            path="script.value"
            :label="t('bpmn.panel.scriptBody')"
          >
            <n-input v-model="newListener.script.value" type="textarea" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item
            v-if="formItemVisible.scriptType === 'external'"
            key="scriptResource"
            path="script.resource"
            :label="t('bpmn.panel.scriptResource')"
          >
            <n-input v-model="newListener.script.resource" @keydown.enter.prevent />
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
        <n-button type="primary" plain @click="openFieldModel">
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
          <n-button type="primary" @click="saveTaskListener">{{
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
          <n-input v-model="newField.name" clearable />
        </n-form-item>
        <n-form-item path="fieldType" :label="t('bpmn.panel.fieldType')">
          <n-select v-model="newField.fieldType" :options="fieldTypeList" />
        </n-form-item>
        <n-form-item
          path="string"
          v-if="newField.fieldType === 'string'"
          :label="t('bpmn.panel.fieldValue')"
        >
          <n-input type="textarea" v-model="newField.string" clearable />
        </n-form-item>
        <n-form-item
          path="expression"
          v-if="newField.fieldType === 'expression'"
          :label="t('bpmn.panel.expression')"
        >
          <n-input type="textarea" v-model="newField.expression" clearable />
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
