import { ref } from 'vue';

import { MultiType } from '/#/bpmn/bpmn-moddle/bpmn-instance';
import i18n from '@/lang';

const { t } = i18n.global;


export const defaultConditionTypeOptions: Record<string, string>[] = [
  { label: '无条件( None )', value: 'none' },
  { label: '默认路径( Default )', value: 'default' },
  { label: '条件表达式( Expression )', value: 'expression' },
  // { label: '条件脚本( Script )', value: 'script' },
];

export const scriptTypeOptions = ref<Record<string, string>[]>([
  { label: t('bpmn.panel.externalResource'), value: 'external' },
  { label: t('bpmn.panel.inlineScript'), value: 'inline' },
  { label: t('bpmn.panel.none'), value: 'none' },
]);

export const taskListenerEventTypes = ref<Record<string, string>[]>([
  { label: t('bpmn.panel.create'), value: 'create' },
  { label: t('bpmn.panel.assignment'), value: 'assignment' },
  { label: t('bpmn.panel.complete'), value: 'complete' },
  { label: t('bpmn.panel.update'), value: 'update' },
  { label: t('bpmn.panel.delete'), value: 'delete' },
  { label: t('bpmn.panel.timeout'), value: 'timeout' },
]);

// -------------------- 循环特征相关选项 ---------------//
//循环特征
export const MULTI_NONE = 'None';
export const MULTI_PARALLEL = 'Parallel';
export const MULTI_SERIAL = 'Serial';
export const MULTI_CYCLE = 'Cycle';
export const multiTypeOptions = ref<{ label: string; value: MultiType }[]>([
  { label: t('bpmn.panel.none'), value: MULTI_NONE },
  { label: t('bpmn.panel.parallelMulti'), value: MULTI_PARALLEL },
  { label: t('bpmn.panel.serialMulti'), value: MULTI_SERIAL },
  { label: t('bpmn.panel.cycleMulti'), value: MULTI_CYCLE },
]);
//多实例完成条件快速配置选项
export const COMPLETE_ALL = 'allComplete';
export const COMPLETE_PERCENT = 'completePercent';
export const COMPLETE_NUM = 'completePercent';
export const COMPLETE_EXPRESSION = 'completePercent';

export const completeOptions = ref([
  { label: t('bpmn.panel.allComplete'), value: COMPLETE_ALL },
  { label: t('bpmn.panel.completePercent'), value: COMPLETE_PERCENT },
  { label: t('bpmn.panel.completeNum'), value: COMPLETE_NUM },
  { label: t('bpmn.panel.expression'), value: COMPLETE_EXPRESSION },
]);
//标准循环测试位置
export const loopTestOptions = ref([
  { label: t('bpmn.panel.loopBefore'), value: true },
  { label: t('bpmn.panel.loopAfter'), value: false },
]);
//多实例完成条件符号
export const loopCardinalityOptions = ref([
  { label: t('bpmn.panel.lessThan'), value: '<' },
  { label: t('bpmn.panel.lessThanOrEqual'), value: '<=' },
  { label: t('bpmn.panel.equal'), value: '==' },
  { label: t('bpmn.panel.notEqual'), value: '!=' },
  { label: t('bpmn.panel.greaterThanOrEqual'), value: '>=' },
  { label: t('bpmn.panel.greaterThan'), value: '>' },
]);

//全局事件范围选项
export const scopeOptions = [
  { label: t('bpmn.panel.processInstance'), value: 'processInstance' },
  { label: t('bpmn.panel.global'), value: 'global' },
];

// 执行监听器
export const listenerEventTypeOptions = ref<Record<string, string>[]>([
  { label: t('bpmn.panel.start'), value: 'start' },
  { label: t('bpmn.panel.take'), value: 'take' },
  { label: t('bpmn.panel.end'), value: 'end' },
]);
export const listenerTypeOptions = ref<Record<string, string>[]>([
  { label: t('bpmn.panel.javaClass'), value: 'class' },
  { label: t('bpmn.panel.expression'), value: 'expression' },
  { label: t('bpmn.panel.delegateExpression'), value: 'delegateExpression' },
  // { label: t('bpmn.panel.script'), value: 'script' },
]);

export const fieldTypeList = ref<Record<string, string>[]>([
  { label: t('bpmn.panel.string'), value: 'string' },
  { label: t('bpmn.panel.expression'), value: 'expression' },
]);
