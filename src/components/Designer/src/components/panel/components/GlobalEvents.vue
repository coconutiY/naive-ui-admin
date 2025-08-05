<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { ThrowEventForm } from '/#/bpmn/bpmn-moddle/bpmn-form';
  import { scopeOptions } from '@/components/Designer/src/config/selectOptions';
  import { inject } from 'vue-demi';
  import { Ref } from 'vue';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { Base } from 'diagram-js/lib/model';
  import { ModdleElement } from 'moddle';
  import { FormInst } from 'naive-ui';
  import { uuid } from '@/components/Designer/src/utils/tools';
  import {
    addGlobalEvent,
    editGlobalEvent,
    getGlobalEvents,
    removeGlobalEvent,
  } from '@/components/Designer/src/utils/listeners';

  defineOptions({ name: 'GlobalEvents' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const { t } = useI18n();
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);
  const modelVisible = ref(false);
  const isUpdate = ref(false);
  const modelTitle = ref('');
  const newEvent = ref<ThrowEventForm>({
    id: '',
    type: 'Message',
    name: '',
    scope: '',
    escalationCode: '',
    errorCode: '',
  });
  const formRef = ref<FormInst | null>(null);
  const formRules = {};
  const activeElement = ref<ModdleElement>();
  const messageList = ref<ModdleElement[]>([]);
  const errorList = ref<ModdleElement[]>([]);
  const signalList = ref<ModdleElement[]>([]);
  const escalationList = ref<ModdleElement[]>([]);

  /**
   * 打开事件新增表单
   * @param title
   */
  function openEventModal(title: 'Signal' | 'Escalation' | 'Error' | 'Message') {
    resetForm();
    newEvent.value.type = title;
    newEvent.value.id = `${title}_${uuid()}`;
    modelTitle.value = t(`bpmn.panel.add${title}`);
    modelVisible.value = true;
  }

  /**
   * 打开事件编辑表单
   * @param event 选中的事件
   */
  async function updateEventModal(event: ModdleElement) {
    resetForm();
    activeElement.value = event;
    Object.assign(newEvent.value, event);
    modelTitle.value = t(`bpmn.panel.update${newEvent.value.type}`);
    isUpdate.value = true;
    modelVisible.value = true;
  }

  function removeEvent(event: ModdleElement) {
    removeGlobalEvent(modelerRef!.value, active!.value, toRaw(event));
    initList();
  }
  function saveEvent() {
    isUpdate.value
      ? editGlobalEvent(modelerRef!.value, activeElement.value, newEvent.value)
      : addGlobalEvent(modelerRef!.value, active!.value, newEvent.value.type, newEvent.value);
    activeElement.value = undefined;
    initList();
    modelVisible.value = false;
  }
  function initList() {
    messageList.value = getGlobalEvents(modelerRef!.value, 'Message');
    errorList.value = getGlobalEvents(modelerRef!.value, 'Error');
    signalList.value = getGlobalEvents(modelerRef!.value, 'Signal');
    escalationList.value = getGlobalEvents(modelerRef!.value, 'Escalation');
  }

  /**
   * 重置表单
   */
  function resetForm() {
    formRef.value?.restoreValidation();
    Object.assign(newEvent.value, {
      id: '',
      type: 'Message',
      name: '',
      scope: '',
      escalationCode: '',
      errorCode: '',
    });
  }

  onMounted(() => {
    initList();
  });
</script>

<template>
  <n-collapse-item name="GlobalEvents">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-calendar-clock /> {{ t('bpmn.panel.globalEvents') }}</div
      >
    </template>
    <template #default>
      <n-collapse>
        <n-collapse-item name="message">
          <template #header>
            <div class="collapse-title">
              <icon-lucide-message-square-text /> {{ t('bpmn.panel.messageList') }}
            </div>
          </template>
          <template #header-extra>
            <n-tag type="primary" round>
              {{ messageList.length }}
            </n-tag>
          </template>
          <n-data-table :data="messageList" :columns="messageColumn" />
          <n-button type="primary" @click="openEventModal('Message')" secondary style="width: 100%">
            <template #icon>
              <n-icon>
                <icon-lucide-plus />
              </n-icon>
            </template>
            {{ t('bpmn.panel.addMessage') }}
          </n-button>
        </n-collapse-item>
        <n-collapse-item name="error">
          <template #header>
            <div class="collapse-title"> <icon-lucide-zap /> {{ t('bpmn.panel.errorList') }} </div>
          </template>
          <template #header-extra>
            <n-tag type="primary" round>
              {{ errorList.length }}
            </n-tag>
          </template>
          <n-data-table :data="errorList" :columns="errorColumn" />
          <n-button type="primary" @click="openEventModal('Error')" secondary style="width: 100%">
            <template #icon>
              <n-icon>
                <icon-lucide-plus />
              </n-icon>
            </template>
            {{ t('bpmn.panel.addError') }}
          </n-button>
        </n-collapse-item>
        <n-collapse-item name="signal">
          <template #header>
            <div class="collapse-title">
              <icon-lucide-signal /> {{ t('bpmn.panel.signalList') }}
            </div>
          </template>
          <template #header-extra>
            <n-tag type="primary" round>
              {{ signalList.length }}
            </n-tag>
          </template>
          <n-data-table :data="signalList" :columns="signalColumn" />
          <n-button type="primary" @click="openEventModal('Signal')" secondary style="width: 100%">
            <template #icon>
              <n-icon>
                <icon-lucide-plus />
              </n-icon>
            </template>
            {{ t('bpmn.panel.addSignal') }}
          </n-button>
        </n-collapse-item>
        <n-collapse-item name="escalation">
          <template #header>
            <div class="collapse-title">
              <icon-lucide-arrow-big-up-dash /> {{ t('bpmn.panel.escalationList') }}
            </div>
          </template>
          <template #header-extra>
            <n-tag type="primary" round>
              {{ escalationList.length }}
            </n-tag>
          </template>
          <n-data-table :data="escalationList" :columns="escalationColumns" />
          <n-button
            type="primary"
            @click="openEventModal('Escalation')"
            secondary
            style="width: 100%"
          >
            <template #icon>
              <n-icon>
                <icon-lucide-plus />
              </n-icon>
            </template>
            <span>{{ $t('bpmn.panel.addEscalation') }}</span>
          </n-button>
        </n-collapse-item>
      </n-collapse>
    </template>
  </n-collapse-item>
  <n-modal v-model:show="modelVisible">
    <n-card :title="modelTitle" :style="{ width: '640px' }">
      <n-form ref="formRef" :model="newEvent" :rules="formRules" :label-width="80">
        <n-form-item path="id" :label="$t('bpmn.panel.id')">
          <n-input v-model:value="newEvent.id" disabled />
        </n-form-item>
        <n-form-item path="name" :label="$t('bpmn.panel.name')">
          <n-input v-model:value="newEvent.name" />
        </n-form-item>
        <n-form-item
          path="errorCode"
          :label="$t('bpmn.panel.errorCode')"
          v-if="newEvent.type === 'Error'"
        >
          <n-input v-model:value="newEvent.errorCode" />
        </n-form-item>
        <n-form-item
          path="scope"
          :label="$t('bpmn.panel.signalScope')"
          v-if="newEvent.type === 'Signal'"
        >
          <n-select v-model:value="newEvent.scope" :options="scopeOptions" />
        </n-form-item>
        <n-form-item
          path="escalationCode"
          :label="$t('bpmn.panel.escalationCode')"
          v-if="newEvent.type === 'Escalation'"
        >
          <n-input v-model:value="newEvent.escalationCode" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button type="primary" @click="saveEvent">{{ $t('bpmn.panel.confirm') }}</n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
