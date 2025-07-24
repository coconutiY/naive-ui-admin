import { ref } from 'vue';
import i18n from '@/lang';
import { MultiType } from '/#/bpmn/bpmn-moddle/bpmn-instance';

const proxy = i18n.global;

export const scriptTypeOptions = ref<Record<string, string>[]>([
  { label: proxy?.t('bpmn.panel.externalResource') as string, value: 'external' },
  { label: proxy?.t('bpmn.panel.inlineScript') as string, value: 'inline' },
  { label: proxy?.t('bpmn.panel.none') as string, value: 'none' },
]);

export const taskListenerEventTypes = ref<Record<string, string>[]>([
  { label: proxy?.t('bpmn.panel.create') as string, value: 'create' },
  { label: proxy?.t('bpmn.panel.assignment') as string, value: 'assignment' },
  { label: proxy?.t('bpmn.panel.complete') as string, value: 'complete' },
  { label: proxy?.t('bpmn.panel.update') as string, value: 'update' },
  { label: proxy?.t('bpmn.panel.delete') as string, value: 'delete' },
  { label: proxy?.t('bpmn.panel.timeout') as string, value: 'timeout' },
]);
export const listenerTypeOptions = ref<Record<string, string>[]>([
  { label: proxy?.t('bpmn.panel.javaClass') as string, value: 'class' },
  { label: proxy?.t('bpmn.panel.expression') as string, value: 'expression' },
  { label: proxy?.t('bpmn.panel.delegateExpression') as string, value: 'delegateExpression' },
  { label: proxy?.t('bpmn.panel.script') as string, value: 'script' },
]);

export const fieldTypeList = ref([
  { label: proxy?.t('bpmn.panel.string') as string, value: 'string' },
  { label: proxy?.t('bpmn.panel.expression') as string, value: 'expression' },
]);

// -------------------- 循环特征相关选项 ---------------//
//循环特征
export const MULTI_NONE = 'None';
export const MULTI_PARALLEL = 'Parallel';
export const MULTI_SERIAL = 'Serial';
export const MULTI_CYCLE = 'Cycle';
export const multiTypeOptions = ref<{ label: string; value: MultiType }[]>([
  { label: proxy?.t('bpmn.panel.none') as string, value: MULTI_NONE },
  { label: proxy?.t('bpmn.panel.parallelMulti') as string, value: MULTI_PARALLEL },
  { label: proxy?.t('bpmn.panel.serialMulti') as string, value: MULTI_SERIAL },
  { label: proxy?.t('bpmn.panel.cycleMulti') as string, value: MULTI_CYCLE },
]);
//多实例完成条件快速配置选项
export const COMPLETE_ALL = 'allComplete';
export const COMPLETE_PERCENT = 'completePercent';
export const COMPLETE_NUM = 'completePercent';
export const COMPLETE_EXPRESSION = 'completePercent';

export const completeOptions = ref([
  { label: proxy?.t('bpmn.panel.allComplete'), value: COMPLETE_ALL },
  { label: proxy?.t('bpmn.panel.completePercent'), value: COMPLETE_PERCENT },
  { label: proxy?.t('bpmn.panel.completeNum'), value: COMPLETE_NUM },
  { label: proxy?.t('bpmn.panel.expression'), value: COMPLETE_EXPRESSION },
]);
//标准循环测试位置
export const loopTestOptions = ref([
  { label: proxy?.t('bpmn.panel.loopBefore'), value: true },
  { label: proxy?.t('bpmn.panel.loopAfter'), value: false },
]);
//多实例完成条件符号
export const loopCardinalityOptions = ref([
  { label: proxy?.t('bpmn.panel.lessThan'), value: '<' },
  { label: proxy?.t('bpmn.panel.lessThanOrEqual'), value: '<=' },
  { label: proxy?.t('bpmn.panel.equal'), value: '==' },
  { label: proxy?.t('bpmn.panel.notEqual'), value: '!=' },
  { label: proxy?.t('bpmn.panel.greaterThanOrEqual'), value: '>=' },
  { label: proxy?.t('bpmn.panel.greaterThan'), value: '>' },
]);
