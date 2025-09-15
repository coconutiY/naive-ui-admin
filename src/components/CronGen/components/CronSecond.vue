<script setup lang="ts">
  import { checkNumber, zeroFill } from '@/components/CronGen/cronUtil';

  defineOptions({ name: 'CronSecond' });
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
  const cycle01 = ref<number>(1);
  const cycle02 = ref<number>(2);
  const average01 = ref<number>(0);
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
    } else if (value.value.indexOf('-') > -1) {
      const indexArr = value.value.split('-');
      cycle01.value = isNaN(+indexArr[0]) ? 0 : +indexArr[0];
      cycle02.value = +indexArr[1];
      radioValue.value = 2;
    } else if (value.value.indexOf('/') > -1) {
      const indexArr = value.value.split('/');
      average01.value = isNaN(+indexArr[0]) ? 0 : +indexArr[0];
      average02.value = +indexArr[1];
      radioValue.value = 3;
    } else {
      radioValue.value = 4;
      checkboxList.value = value.value.split(',').map((i) => +i);
    }
  }

  /**
   * 单选按钮值变化时
   * @param v
   */
  function radioChange(v: number) {
    if (radioValue.value !== v) {
      radioValue.value = v;
    }
  }

  /**
   * 计算两个周期值
   */
  const cycleTotal = computed(() => {
    const cycle1 = checkNumber(cycle01.value, 0, 58);
    const cycle2 = checkNumber(cycle02.value, cycle1 ? cycle1 + 1 : 1, 59);
    return cycle1 + '-' + cycle2;
  });

  /**
   * 计算平均用到的值
   */
  const averageTotal = computed(() => {
    const average1 = checkNumber(average01.value, 0, 58);
    const average2 = checkNumber(average02.value, 1, 59 - average1 || 0);
    return average1 + '/' + average2;
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
        value.value = cycleTotal.value;
      } else if (v === 3) {
        value.value = averageTotal.value;
      } else if (v === 4) {
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
    () => checkboxString.value,
    (v) => (value.value = v)
  );
</script>

<template>
  <n-form :size="size">
    <n-form-item>
      <n-radio v-model="radioValue" :label="1">
        {{ t('cron.everySecond') }}，{{ t('cron.allowedWildcards') }} [, - * /]
      </n-radio>
    </n-form-item>

    <n-form-item>
      <n-radio v-model="radioValue" :label="2">
        {{ t('cron.cycleFrom') }}
        <n-input-number
          class="mx-1em my-0"
          v-model="cycle01"
          :min="0"
          :max="58"
          controls-position="right"
          @focus="radioChange(2)"
        />
        {{ t('cron.to') }}
        <n-input-number
          class="mx-1em my-0"
          v-model="cycle02"
          :min="cycle01 ? cycle01 + 1 : 1"
          :max="59"
          controls-position="right"
          @focus="radioChange(2)"
        />
        {{ t('cron.seconds') }}
      </n-radio>
    </n-form-item>

    <n-form-item>
      <n-radio v-model="radioValue" :label="3">
        {{ t('cron.cycleFrom') }}
        <n-input-number
          class="mx-1em my-0"
          v-model="average01"
          :min="0"
          :max="58"
          controls-position="right"
          @focus="radioChange(3)"
        />
        {{ t('cron.seconds') }}{{ t('cron.start') }}，{{ t('cron.every') }}
        <n-input-number
          class="mx-1em my-0"
          v-model="average02"
          :min="1"
          :max="59 - average01 || 0"
          controls-position="right"
          @focus="radioChange(3)"
        />
        {{ t('cron.seconds') }}{{ t('cron.executeOnce') }}
      </n-radio>
    </n-form-item>

    <n-form-item class="start">
      <n-radio v-model="radioValue" :label="4" style="margin-right: 20px"
        >{{ t('cron.designate') }}{{ t('cron.seconds') }}
      </n-radio>
      <div class="flex">
        <n-checkbox-group v-model="checkboxList" class="grid grid-cols-10 justify-items-stretch">
          <n-checkbox
            v-for="item in 60"
            :key="item"
            :value="item - 1"
            :label="zeroFill(item - 1)"
          />
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
