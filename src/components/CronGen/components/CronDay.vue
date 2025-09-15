<script setup lang="ts">
  import { checkNumber, zeroFill } from '@/components/CronGen/cronUtil';

  defineOptions({ name: 'CronDay' });
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

  const radioValue = ref<number>(1);
  const workday = ref<number>(1);
  const cycle01 = ref<number>(1);
  const cycle02 = ref<number>(2);
  const average01 = ref<number>(1);
  const average02 = ref<number>(1);
  const checkboxList = ref<number[]>([]);

  const value = computed({
    get: () => props.modelValue as string,
    set: (v: string) => emit('update:modelValue', v),
  });

  /**
   * 赋值
   */
  function assign() {
    if (value.value === '*') {
      radioValue.value = 1;
    } else if (value.value == '?') {
      radioValue.value = 2;
    } else if (value.value.indexOf('-') > -1) {
      let indexArr = value.value.split('-');
      cycle01.value = isNaN(+indexArr[0]) ? 0 : +indexArr[0];
      cycle02.value = +indexArr[1];
      radioValue.value = 3;
    } else if (value.value.indexOf('/') > -1) {
      let indexArr = value.value.split('/');
      average01.value = isNaN(+indexArr[0]) ? 0 : +indexArr[0];
      average02.value = +indexArr[1];
      radioValue.value = 4;
    } else if (value.value.indexOf('W') > -1) {
      let indexArr = value.value.split('W');
      workday.value = isNaN(+indexArr[0]) ? 0 : +indexArr[0];
      radioValue.value = 5;
    } else if (value.value === 'L') {
      radioValue.value = 6;
    } else {
      checkboxList.value = value.value.split(',').map((i) => +i);
      radioValue.value = 7;
    }
  }

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
    const cycle1 = checkNumber(cycle01.value, 1, 30);
    const cycle2 = checkNumber(cycle02.value, cycle1 ? cycle1 + 1 : 2, 31);
    return cycle1 + '-' + cycle2;
  });

  /**
   * 计算平均用到的值
   */
  const averageTotal = computed(() => {
    const average1 = checkNumber(average01.value, 1, 30);
    const average2 = checkNumber(average02.value, 1, 31 - average1 || 0);
    return average1 + '/' + average2;
  });
  /**
   * 计算工作日格式
   */
  const workdayCheck = computed(() => {
    return checkNumber(workday.value, 1, 31) + 'W';
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
        value.value = workdayCheck.value;
      } else if (v === 6) {
        value.value = 'L';
      } else if (v === 7) {
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
    () => workdayCheck.value,
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
<template>
  <n-form :size="size">
    <n-form-item>
      <n-radio v-model="radioValue" :label="1">
        {{ t('cron.everyDay') }}，{{ t('cron.allowedWildcards') }} [, - * ? / L W]
      </n-radio>
    </n-form-item>
    <n-form-item>
      <n-radio v-model="radioValue" :label="2"> {{ t('cron.notSpecified') }}</n-radio>
    </n-form-item>
    <n-form-item>
      <n-radio v-model="radioValue" :label="3">
        {{ t('cron.cycleFrom') }}
        <n-input-number
          class="mx-1em my-0"
          controls-position="right"
          v-model="cycle01"
          :min="1"
          :max="30"
          @focus="radioChange(3)"
        />
        {{ t('cron.to') }}
        <n-input-number
          class="mx-1em my-0"
          controls-position="right"
          v-model="cycle02"
          :min="cycle01 ? cycle01 + 1 : 2"
          :max="31"
          @focus="radioChange(3)"
        />
        {{ t('cron.days') }}
      </n-radio>
    </n-form-item>
    <n-form-item>
      <n-radio v-model="radioValue" :label="4">
        {{ t('cron.cycleFrom') }}
        <n-input-number
          class="mx-1em my-0"
          controls-position="right"
          v-model="average01"
          :min="1"
          :max="30"
          @focus="radioChange(4)"
        />
        {{ t('cron.days') }}{{ t('cron.start') }}，{{ t('cron.every') }}
        <n-input-number
          class="mx-1em my-0"
          controls-position="right"
          v-model="average02"
          :min="1"
          :max="31 - average01 || 1"
          @focus="radioChange(4)"
        />
        {{ t('cron.days') }}{{ t('cron.executeOnce') }}
      </n-radio>
    </n-form-item>
    <n-form-item>
      <n-radio v-model="radioValue" :label="5">
        {{ t('cron.everyMonth') }}
        <n-input-number
          class="mx-1em my-0"
          controls-position="right"
          v-model="workday"
          :min="1"
          :max="31"
          @focus="radioChange(5)"
        />
        {{ t('cron.days') }}{{ t('cron.workingDay') }}
      </n-radio>
    </n-form-item>

    <n-form-item>
      <n-radio v-model="radioValue" :label="6">
        {{ t('cron.thisMonth') }}{{ t('cron.lastDay') }}
      </n-radio>
    </n-form-item>

    <n-form-item class="start">
      <n-radio v-model="radioValue" :label="7" style="margin-right: 20px">
        {{ t('cron.designate') }} {{ t('cron.days') }}
      </n-radio>
      <div class="flex">
        <n-checkbox-group v-model="checkboxList" class="grid grid-cols-12 justify-items-stretch">
          <n-checkbox v-for="item in 31" :key="item" :value="item" :label="zeroFill(item)" />
        </n-checkbox-group>
      </div>
    </n-form-item>
  </n-form>
</template>
<style lang="scss" scoped>
  ::v-deep(.start) {
    margin-bottom: 0;

    .n-form-item__content {
      align-items: flex-start;
    }
  }
</style>
