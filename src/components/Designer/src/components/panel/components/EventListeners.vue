<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { ACTIVE_ELEMENT, MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { Base } from 'diagram-js/lib/model';
  import { EventListenerForm } from '/#/bpmn/bpmn-moddle/bpmn-form';
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
        <n-data-table size="small" :data="listeners" :fit="true" :max-height="400" />
        <n-button
          type="primary"
          class="inline-large-button"
          :icon="Plus"
          @click="openListenerModel(-1)"
          plain
          style="width: 100%"
        >
          <span>{{ $t('bpmn.panel.addEventListener') }}</span>
        </n-button>
      </div>
    </template>
  </n-collapse-item>
</template>

<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/panel.scss';
</style>
