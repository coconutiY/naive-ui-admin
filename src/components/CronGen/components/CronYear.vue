<template>
  <el-form :size="size">
    <el-form-item>
      <el-radio :label="1" v-model="radioValue"> {{$t('cron.none')}}，{{$t('cron.allowedWildcards')}}[, - * /] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="2" v-model="radioValue"> {{ $t('cron.everyYear') }} </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="3" v-model="radioValue">
        {{ $t('cron.cycleFrom') }}
        <el-input-number class="mx-1em my-0" controls-position="right" v-model="cycle01" :min="fullYear" :max="2098" @focus="radioChange(3)" />
        {{ $t('cron.years') }}{{ $t('cron.to') }}
        <el-input-number
          class="mx-1em my-0"
          controls-position="right"
          v-model="cycle02"
          :min="cycle01 ? cycle01 + 1 : fullYear + 1"
          :max="2099"
          @focus="radioChange(3)"
        />
        {{ $t('cron.years') }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="4" v-model="radioValue">
        {{ $t('cron.cycleFrom') }}
        <el-input-number class="mx-1em my-0" controls-position="right" v-model="average01" :min="fullYear" :max="2098" @focus="radioChange(4)" />
        {{ $t('cron.years') }}{{ $t('cron.start') }}，{{ $t('cron.every') }}
        <el-input-number
          class="mx-1em my-0"
          controls-position="right"
          v-model="average02"
          :min="1"
          :max="2099 - average01 || fullYear"
          @focus="radioChange(4)"
        />
        {{ $t('cron.years') }}{{ $t('cron.executeOnce') }}
      </el-radio>
    </el-form-item>

    <el-form-item class="start">
      <el-radio v-model="radioValue" :label="5" style="margin-right: 20px"> {{ $t('cron.designate') }}{{ $t('cron.years') }} </el-radio>
      <div class="flex">
        <el-checkbox-group v-model="checkboxList" @update:value="radioChange(5)" class="grid grid-cols-7 justify-items-stretch">
          <el-checkbox v-for="item in 20" :key="item" :value="item - 1 + fullYear" :label="String(item - 1 + fullYear)" />
        </el-checkbox-group>
      </div>
    </el-form-item>
  </el-form>
</template>
<script setup name="CronYear" lang="ts">
import { checkNumber } from "@/components/CronGen/cronUtil";

const props = defineProps({
  modelValue: {
    required: true,
    type: String,
  },
  size:{
    type: String,
    default: ''
  }
});

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const fullYear = ref<number>(Number(new Date().getFullYear()));
const radioValue = ref<number>(1);
const cycle01 = ref<number>(fullYear.value);
const cycle02 = ref<number>(cycle01.value + 1);
const average01 = ref<number>(fullYear.value);
const average02 = ref<number>(1);
const checkboxList = ref<number[]>([]);

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});


/**
 * 赋值
 */
const assign = () => {
  if (value.value == "") {
    radioValue.value = 1;
  } else if (value.value == "*") {
    radioValue.value = 2;
  } else if (value.value.indexOf("-") > -1) {
    radioValue.value = 3;
  } else if (value.value.indexOf("/") > -1) {
    radioValue.value = 4;
  } else {
    checkboxList.value = value.value.split(",").map((i) => +i);
    radioValue.value = 5;
  }
};

/**
 * 单选按钮值变化时
 * @param v
 */
const radioChange = (v: number) => {
  if (radioValue.value !== v) {
    radioValue.value = v;
  }
};

/**
 * 计算两个周期值
 */
const cycleTotal = computed(() => {
  const cycle1 = checkNumber(cycle01.value, fullYear.value, 2098);
  const cycle2 = checkNumber(
    cycle02.value,
    cycle1 ? cycle1 + 1 : fullYear.value + 1,
    2099
  );
  return cycle1 + "-" + cycle2;
});

/**
 * 计算平均用到的值
 */
const averageTotal = computed(() => {
  const average1 = checkNumber(average01.value, fullYear.value, 2098);
  const average2 = checkNumber(
    average02.value,
    1,
    2099 - average1 || fullYear.value
  );
  return average1 + "/" + average2;
});

/**
 * 计算勾选的checkbox值
 */
const checkboxString = computed(() => {
  const str = checkboxList.value.join();
  return str == "" ? "*" : str;
});

onMounted(() => {
  assign();
});
watch(
  () => value.value,
  () => assign()
);
watch(
  () => radioValue.value,
  (v) => {
    if (v === 1) {
      value.value = "";
    } else if (v === 2) {
      value.value = "*";
    } else if (v === 3) {
      value.value = cycleTotal.value;
    } else if (v === 4) {
      value.value = averageTotal.value;
    } else if (v === 5) {
      value.value = checkboxString.value;
    } else {
      value.value = "";
    }
  }
);
watch(
  () => cycleTotal.value,
  (v) => (value.value = v)
);
watch(
  () => averageTotal.value,
  (v) => (value.value = v)
);
watch(
  () => checkboxString.value,
  (v) => (value.value = v)
);
</script>
<style lang="scss" scoped>
::v-deep(.start) {
  margin-bottom: 0;
  .el-form-item__content {
    align-items: flex-start;
  }
}
/*
 * 将radio选型的标签换行
 */
//::v-deep(.el-radio__label) {
//  width: 100% !important;
//  text-overflow: ellipsis;
//  white-space: normal;
//  line-height: 18px;
//}
</style>
