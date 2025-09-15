<script setup lang="ts">
  import { checkNumber } from '@/components/CronGen/cronUtil';

  defineOptions({ name: 'CronWeek' });
  const props = defineProps({
    modelValue: {
      required: true,
      type: String,
    },
    size: {
      type: String,
      default: '',
    },
  });
  const { t } = useI18n();
  const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void;
  }>();

  const radioValue = ref<number>(2);
  const weekday = ref<number>(2);
  const cycle01 = ref<number>(2);
  const cycle02 = ref<number>(3);
  const average01 = ref<number>(1);
  const average02 = ref<number>(2);
  const checkboxList = ref<number[]>([]);
  const weekList = [
    { value: 2, label: t('cron.monday') },
    { value: 3, label: t('cron.tuesday') },
    { value: 4, label: t('cron.wednesday') },
    { value: 5, label: t('cron.thursday') },
    { value: 6, label: t('cron.friday') },
    { value: 7, label: t('cron.saturday') },
    { value: 1, label: t('cron.sunday') },
  ];

  const value = computed({
    get: () => props.modelValue as string,
    set: (v: string) => emit('update:modelValue', v),
  });

  /**
   * 赋值
   */
  const assign = () => {
    if (value.value === '*') {
      radioValue.value = 1;
    } else if (value.value === '?') {
      radioValue.value = 2;
    } else if (value.value.indexOf('-') > -1) {
      let indexArr = value.value.split('-');
      cycle01.value = isNaN(+indexArr[0]) ? 0 : +indexArr[0];
      cycle02.value = +indexArr[1];
      radioValue.value = 3;
    } else if (value.value.indexOf('#') > -1) {
      let indexArr = value.value.split('#');
      average01.value = isNaN(+indexArr[1]) ? 1 : +indexArr[1];
      average02.value = +indexArr[0];
      radioValue.value = 4;
    } else if (value.value.indexOf('L') > -1) {
      let indexArr = value.value.split('L');
      weekday.value = isNaN(+indexArr[0]) ? 1 : +indexArr[0];
      radioValue.value = 5;
    } else {
      checkboxList.value = value.value.split(',').map((i) => +i);
      radioValue.value = 6;
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
    return checkNumber(cycle01.value, 1, 7) + '-' + checkNumber(cycle02.value, 1, 7);
  });

  /**
   * 计算平均用到的值
   */
  const averageTotal = computed(() => {
    return checkNumber(average02.value, 1, 7) + '#' + checkNumber(average01.value, 1, 4);
  });

  /**
   * 最近的工作日（格式）
   */
  const weekdayCheck = computed(() => {
    return checkNumber(weekday.value, 1, 7) + 'L';
  });

  /**
   * 计算勾选的checkbox值
   */
  const checkboxString = computed(() => {
    const str = checkboxList.value.join();
    return str == '' ? '*' : str;
  });
  onMounted(() => assign());
  watch(
    () => value.value,
    () => assign()
  );

  watch(
    () => radioValue.value,
    (v) => {
      if (v === 1) {
        value.value = '*';
      } else if (v === 2) {
        value.value = '?';
      } else if (v === 3) {
        value.value = cycleTotal.value;
      } else if (v === 4) {
        value.value = averageTotal.value;
      } else if (v === 5) {
        value.value = weekdayCheck.value;
      } else if (v === 6) {
        value.value = checkboxString.value;
      } else {
        value.value = '*';
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
    () => weekdayCheck.value,
    (v) => (value.value = v)
  );
  watch(
    () => checkboxString.value,
    (v) => (value.value = v)
  );
</script>

<template>
  <n-form :size="size">
    <n-form-item>
      <n-radio v-model="radioValue" :label="1">
        {{ t('cron.everyWeek') }}，{{ t('cron.allowedWildcards') }}[, - * ? / L #]
      </n-radio>
    </n-form-item>

    <n-form-item>
      <n-radio v-model="radioValue" :label="2"> {{ t('cron.notSpecified') }}</n-radio>
    </n-form-item>

    <n-form-item>
      <n-radio v-model="radioValue" :label="3">
        {{ t('cron.cycleFrom') }}
        <n-select v-model="cycle01" class="mx-1em my-0" :options="weekList" />
        {{ t('cron.to') }}
        <n-select v-model="cycle02" class="mx-1em my-0" :options="weekList" />
      </n-radio>
    </n-form-item>

    <n-form-item>
      <n-radio v-model="radioValue" :label="4">
        {{ t('cron.cycleFrom') }}{{ t('cron.no') }}
        <n-input-number
          class="mx-1em my-0"
          v-model="average01"
          :min="1"
          :max="4"
          controls-position="right"
          @focus="radioChange(4)"
        />
        {{ t('cron.weeks') }}{{ t('cron.of') }}
        <n-select v-model="average02" class="mx-1em my-0" :options="weekList" />
      </n-radio>
    </n-form-item>

    <n-form-item>
      <n-radio v-model="radioValue" :label="5">
        {{ t('cron.thisMonth') }}{{ t('cron.lastOne') }}
        <n-select v-model="weekday" class="mx-1em my-0" :options="weekList" />
      </n-radio>
    </n-form-item>
    <n-form-item class="start">
      <n-radio v-model="radioValue" :label="6">
        {{ t('cron.designate') }}{{ t('cron.weeks') }}
      </n-radio>
      <div class="flex">
        <n-checkbox-group
          v-model="checkboxList"
          @update:value="radioChange(6)"
          class="grid grid-cols-7 justify-items-stretch"
        >
          <n-checkbox
            v-for="item in weekList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </n-checkbox-group>
      </div>
    </n-form-item>
  </n-form>
</template>

<style lang="scss" scoped>
  .n-select {
    width: 150px;
  }
</style>
