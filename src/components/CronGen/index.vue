<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';

  interface CrontabValue {
    second: string;
    min: string;
    hour: string;
    day: string;
    month: string;
    week: string;
    year: string;
  }
  defineOptions({ name: 'CronGen' });
  const props = defineProps({
    modelValue: {
      type: String,
    },
    valueShow: {
      type: Boolean,
      default: propTypes.bool.def(true),
    },
    labelWidth: {
      type: String,
      default: propTypes.number.def(80),
    },
    size: {
      type: String,
      default: propTypes.string.def('small'),
      validator: (value: string) => {
        return ['', 'small', 'default', 'large'].includes(value);
      },
    },
  });
  defineExpose({
    open: () => {
      visible.value = true;
      crontabValue.value = getValue();
    },
  });
  const { t } = useI18n();
  const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void;
  }>();

  const value = computed({
    get: () => props.modelValue as string,
    set: (v: string) => emit('update:modelValue', v),
  });

  // 默认选中秒
  const activeName = ref<keyof CrontabValue>('second');

  // 初始值
  const defaultValue: CrontabValue = {
    second: '*',
    min: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: '',
  };

  const crontabValue = ref<CrontabValue>(getValue());
  const visible = ref(false);

  // 反解析 表达式
  function getValue() {
    if (value.value) {
      const arr = value.value.split(' ');
      if (arr.length >= 6) {
        //6 位以上是合法表达式
        const obj: CrontabValue = {
          second: arr[0],
          min: arr[1],
          hour: arr[2],
          day: arr[3],
          month: arr[4],
          week: arr[5],
          year: arr[6] ? arr[6] : '',
        };
        return { ...obj };
      } else {
        return { ...defaultValue };
      }
    } else {
      return { ...defaultValue };
    }
  }

  watch(
    () => crontabValue.value.day,
    (v) => {
      if (v !== '?') {
        crontabValue.value.week = '?';
      }
    }
  );

  watch(
    () => crontabValue.value.week,
    (v) => {
      if (v !== '?') {
        crontabValue.value.day = '?';
      }
    }
  );

  const crontabValueString = computed(() => {
    const { second, min, hour, day, month, week, year } = crontabValue.value;
    return `${second} ${min} ${hour} ${day} ${month} ${week}${year ? ' ' + year : ''}`;
  });

  watch(
    () => crontabValueString.value,
    (v) => {
      value.value = v;
    },
    { immediate: true }
  );
</script>

<template>
  <div class="corn-main">
    <n-form-item
      v-if="valueShow"
      :label="t('bpmn.panel.timerValue')"
      :label-width="labelWidth"
      label-placement="left"
      label-align="left"
    >
      <n-input v-model="crontabValueString" disabled />
    </n-form-item>
    <n-tabs type="card" v-model="activeName" stretch>
      <n-tab-pane :label="t('bpmn.panel.seconds')" name="second">
        <cron-second v-model="crontabValue.second" :size="size" />
      </n-tab-pane>
      <n-tab-pane :label="t('bpmn.panel.minutes')" name="min">
        <cron-min v-model="crontabValue.min" :size="size" />
      </n-tab-pane>
      <n-tab-pane :label="t('bpmn.panel.hours')" name="hour">
        <cron-hour v-model="crontabValue.hour" :size="size" />
      </n-tab-pane>
      <n-tab-pane :label="t('bpmn.panel.days')" name="day">
        <cron-day v-model="crontabValue.day" :size="size" />
      </n-tab-pane>
      <n-tab-pane :label="t('bpmn.panel.weeks')" name="week">
        <cron-week v-model="crontabValue.week" :size="size" />
      </n-tab-pane>
      <n-tab-pane :label="t('bpmn.panel.months')" name="month">
        <cron-month v-model="crontabValue.month" :size="size" />
      </n-tab-pane>
      <n-tab-pane :label="t('bpmn.panel.years')" name="year">
        <cron-year v-model="crontabValue.year" :size="size" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style lang="scss" scoped>
  .corn-main {
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
</style>
