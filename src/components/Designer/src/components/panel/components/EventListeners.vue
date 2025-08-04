<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { Base } from 'diagram-js/lib/model';
  import { EventListenerForm } from '/#/bpmn/bpmn-moddle/bpmn-form';
  import type { DataTableColumns } from 'naive-ui';
  import {
    addEventListener,
    getExecutionListeners,
    getGlobalEvents,
  } from '@/components/Designer/src/utils/listeners';

  defineOptions({ name: 'EventListeners' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });
  const { t } = useI18n();
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);
  const modelVisible = ref(false);
  const formRef = ref();
  const listeners = ref<EventListenerForm[]>([]);
  const throwEventList = ref<any[]>([]);
  const newListener = ref<EventListenerForm>({
    event: '',
    type: '',
    class: '',
    delegateExpression: '',
    entityType: '',
    throwEvent: '',
    eventName: '',
    errorCode: '',
    signalName: '',
    messageName: '',
  });
  const columns: DataTableColumns<EventListenerForm> = [
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
      render(rowData: EventListenerForm, rowIndex: number) {
        return [
          h(
            NButton,
            {
              type: 'primary',
              circle: true,
              tertiary: true,
              onClick: () =>{},
            },
            {
              icon: () =>{},
            }
          ),
          h(
            NButton,
            {
              type: 'error',
              circle: true,
              tertiary: true,
              onClick: () =>{},
            },
            {
              icon: () =>{},
            }
          ),
        ];
      },
    },
  ];
  /**
   * 监听事件类型
   */
  const listenerEventTypeOptions = ref<Record<string, string>[]>([
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Take', value: 'take' },
  ]);
  /**
   * 监听器类型
   */
  const listenerTypeOptions = [
    { label: t('bpmn.panel.javaClass'), value: 'class' },
    { label: t('bpmn.panel.delegateExpression'), value: 'delegateExpression' },
    { label: t('bpmn.panel.throwEvent'), value: 'throwEvent' },
  ];
  /**
   * 抛出事件类型
   */
  const throwEventTypeOptions = [
    { label: t('bpmn.panel.message'), value: 'message' },
    { label: t('bpmn.panel.signal'), value: 'signal' },
    { label: t('bpmn.panel.error'), value: 'error' },
    { label: t('bpmn.panel.globalSignal'), value: 'globalSignal' },
  ];
  const formRules = {};

  function initData() {
    listeners.value = getExecutionListeners(modelerRef!.value, active!.value);
  }

  async function openListenerModel(index: number, listenerData?: EventListenerForm) {
    formRef.value?.resetFields();
    modelVisible.value = true;
  }

  function saveListenerModel(listenerData: EventListenerForm) {
    addEventListener(modelerRef!.value, active!.value, listenerData);
    modelVisible.value = false;
  }

  watch(
    () => newListener.value.throwEvent,
    (newValue) => {
      switch (newValue) {
        case 'globalSignal':
          throwEventList.value = getGlobalEvents(active!.value, 'Signal')
            .filter((s: any) => s.get(`scope`) === 'global')
            ?.map((item: any) => {
              return {
                value: item.get('id'),
                label: item.get('name'),
              };
            });
          break;
        case 'signal':
          throwEventList.value = getGlobalEvents(active!.value, 'Signal')
            .filter((s: any) => s.get(`scope`) === 'processInstance')
            ?.map((item: any) => {
              return {
                value: item.get('id'),
                label: item.get('name'),
              };
            });
          break;
        case 'error':
          throwEventList.value = getGlobalEvents(active!.value, 'Error').map((item: any) => {
            return {
              value: item.get('id'),
              label: item.get('name'),
            };
          });
          break;
        default:
          throwEventList.value = getGlobalEvents(active!.value, 'Message').map((item: any) => {
            return {
              value: item.get('id'),
              label: item.get('name'),
            };
          });
          break;
      }
    }
  );

  watch(
    () => active!.value,
    (newValue) => {
      if (newValue) {
        initData();
      }
    }
  );
</script>

<template>
  <n-collapse-item name="EventListeners">
    <template #header>
      <div class="collapse-title"
        ><icon-lucide-bell-Dot /> {{ $t('bpmn.panel.eventListeners') }}</div
      >
    </template>
    <template #default>
      <div class="element-event-listeners">
        <n-data-table size="small" :data="listeners" :columns="columns" :max-height="400" />
        <n-button
          type="primary"
          class="inline-large-button"
          @click="openListenerModel(-1)"
          secondary
          style="width: 100%"
        >
          <template #icon>
            <n-icon>
              <icon-lucide-plus />
            </n-icon>
          </template>
          {{ $t('bpmn.panel.addEventListener') }}
        </n-button>
      </div>
    </template>
  </n-collapse-item>
  <n-modal v-model:show="modelVisible">
    <n-card :title="$t('bpmn.panel.addEventListener')" :style="{ width: '640px' }">
      <n-form ref="formRef" :model="newListener" :rules="formRules" :labn-width="labelWidth">
        <n-form-item path="event" :label="$t('bpmn.panel.eventListenerEventType')">
          <n-select v-model:value="newListener.event" :options="listenerEventTypeOptions" />
        </n-form-item>
        <n-form-item path="type" :label="$t('bpmn.panel.eventListenerType')">
          <n-select v-model="newListener.type" :options="listenerTypeOptions" />
        </n-form-item>
        <template v-if="newListener.type === 'class'">
          <n-form-item path="class" :label="$t('bpmn.panel.eventListener')">
            <n-input v-model:value="newListener.class" />
          </n-form-item>
          <n-form-item path="entityType" :label="$t('bpmn.panel.entityType')">
            <n-input v-model:value="newListener.entityType" />
          </n-form-item>
        </template>
        <template v-if="newListener.type === 'delegateExpression'">
          <n-form-item path="delegateExpression" :label="$t('bpmn.panel.eventListener')">
            <n-input v-model:value="newListener.delegateExpression" />
          </n-form-item>
          <n-form-item path="entityType" :label="$t('bpmn.panel.entityType')">
            <n-input v-model:value="newListener.entityType" />
          </n-form-item>
        </template>
        <template v-if="newListener.type === 'throwEvent'">
          <n-form-item path="throwEvent" :label="$t('bpmn.panel.throwEventType')">
            <n-select
              v-model:value="newListener.throwEvent"
              @change="newListener.eventName = ''"
              :options="throwEventTypeOptions"
            />
          </n-form-item>
          <n-form-item path="eventName" :label="$t('bpmn.panel.throwEvent')">
            <n-select v-model:value="newListener.eventName" :options="throwEventList" />
          </n-form-item>
        </template>
      </n-form>
      <template #footer>
        <n-button type="primary" @click="saveListenerModel">{{
          $t('bpmn.panel.confirm')
        }}</n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
