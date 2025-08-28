<template>
  <div class="flex justify-center flex-col gap-12px">
    <el-form-item :label="$t('bpmn.panel.timerValue')" label-width="40" v-if="valueShow">
      <el-input v-model="crontabValueString" disabled />
    </el-form-item>
    <el-tabs type="border-card" v-model="activeName" stretch>
      <el-tab-pane :label="$t('bpmn.panel.seconds')" name="second">
        <cron-second v-model="crontabValue.second" :size="size" />
      </el-tab-pane>
      <el-tab-pane :label="$t('bpmn.panel.minutes')" name="min">
        <cron-min v-model="crontabValue.min" :size="size" />
      </el-tab-pane>
      <el-tab-pane :label="$t('bpmn.panel.hours')" name="hour">
        <cron-hour v-model="crontabValue.hour" :size="size" />
      </el-tab-pane>
      <el-tab-pane :label="$t('bpmn.panel.days')" name="day">
        <cron-day v-model="crontabValue.day" :size="size" />
      </el-tab-pane>
      <el-tab-pane :label="$t('bpmn.panel.weeks')" name="week">
        <cron-week v-model="crontabValue.week" :size="size" />
      </el-tab-pane>
      <el-tab-pane :label="$t('bpmn.panel.months')" name="month">
        <cron-month v-model="crontabValue.month" :size="size" />
      </el-tab-pane>
      <el-tab-pane :label="$t('bpmn.panel.years')" name="year">
        <cron-year v-model="crontabValue.year" :size="size" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="CronGen" lang="ts">
interface CrontabValue {
  second: string;
  min: string;
  hour: string;
  day: string;
  month: string;
  week: string;
  year: string;
}

const props = defineProps({
  modelValue: {
    type: String,
  },
  valueShow:{
    type: Boolean,
    default: true
  },
  size:{
    type: String,
    default: 'small',
    validator: (value: string): boolean => {
      return ['', 'small' , 'default' , 'large'].includes(value);
    }
  }
});

defineExpose({
  open: () => {
    visible.value = true;
    crontabValue.value = getValue(); // 初始化值
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", v?: string): void;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// 默认选中秒
const activeName = ref<keyof CrontabValue>("second");

// 初始值
const defaultValue: CrontabValue = {
  second: "*",
  min: "*",
  hour: "*",
  day: "*",
  month: "*",
  week: "?",
  year: "",
};

// 反解析 表达式
const getValue = () => {
  if (value.value) {
    const arr = value.value.split(" ");
    if (arr.length >= 6) {
      //6 位以上是合法表达式
      const obj: CrontabValue = {
        second: arr[0],
        min: arr[1],
        hour: arr[2],
        day: arr[3],
        month: arr[4],
        week: arr[5],
        year: arr[6] ? arr[6] : "",
      };
      return { ...obj };
    } else {
      return { ...defaultValue };
    }
  } else {
    return { ...defaultValue };
  }
};

const crontabValue = ref<CrontabValue>(getValue());

watch(
  () => crontabValue.value.day,
  (v) => {
    if (v !== "?") {
      crontabValue.value.week = "?";
    }
  }
);
watch(
  () => crontabValue.value.week,
  (v) => {
    if (v !== "?") {
      crontabValue.value.day = "?";
    }
  }
);

const crontabValueString = computed(() => {
  const { second, min, hour, day, month, week, year } = crontabValue.value;
  return `${second} ${min} ${hour} ${day} ${month} ${week}${
    year ? " " + year : ""
  }`;
});
watch(
  ()=> crontabValueString.value,
  (v)=>{
    value.value = v;
  },
  {immediate: true}
)

const visible = ref<boolean>(false);
</script>
<style lang="scss" scoped></style>
