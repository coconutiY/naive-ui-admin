<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { timerOptions } from '@/components/Designer/src/config/selectOptions';
  import Modeler from 'bpmn-js/lib/Modeler';
  import {
    ACTIVE_ELEMENT,
    ISO_DATE_FORMAT,
    MODELER,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { useMessage } from 'naive-ui';
  import { getDateDuration, getDateDurationByString } from '@/components/Designer/src/utils/tools';
  import {
    getTimerType,
    getTimerValue,
    setTimerType,
    setTimerValue,
  } from '@/components/Designer/src/utils/timer';

  defineOptions({ name: 'Timer' });
  defineProps({
    labelWidth: propTypes.number.def(80),
    labelPlace: propTypes.string.def('left'),
    formSize: propTypes.string.def('small'),
  });
  const message = useMessage();
  const { t } = useI18n();
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<BpmnElement>>(ACTIVE_ELEMENT);

  const timerForm = ref({
    type: '',
    val: '',
    oldVal: '',
  });
  const cycleForm = ref({
    cyclesNum: 1,
    startTime: '',
    cyclePeriod: '',
  });
  const durationForm = ref({
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    weeks: 0,
    months: 0,
    years: 0,
  });
  const modelVisible = ref(false);
  const modelTitle = ref(t('bpmn.panel.configTime'));
  const cycleType = ref('cron');

  const cycleFormValue = computed(() => {
    let dateDuration = getDateDuration(durationForm.value);
    return `R${cycleForm.value.cyclesNum}/${cycleForm.value.startTime || '-'}/${
      dateDuration === 'P0D' ? '-' : dateDuration
    }`;
  });

  function timerTypeChange(value: string) {
    setTimerType(modelerRef!.value, active!.value, value);
  }

  function timerValueChange(value: number | null, formattedValue: string | null) {
    console.log(value, 'value');
    console.log(formattedValue, 'formattedValue');
    if (timerForm.value.type && timerForm.value.type === 'timeDuration') {
      let regExp = new RegExp(
        '^P(?=\\d|T$)(\\d+Y)?(\\d+M)?(\\d+W)?(\\d+D)?(T(\\d+H)?(\\d+M)?(\\d+(\\.\\d{1,})?S)?)?$'
      );
      if (!regExp.exec(timerForm.value.val)) {
        return message.error(t('bpmn.panel.typeError'));
      }
    }
    timerForm.value.type &&
      setTimerValue(modelerRef!.value, active!.value, timerForm.value.type, timerForm.value.val);
  }

  function saveTimerValue() {
    if (timerForm.value.type === 'timeCycle' && cycleType.value === 'duration') {
      timerForm.value.val = cycleFormValue.value;
    }
    setTimerValue(modelerRef!.value, active!.value, timerForm.value.type, timerForm.value.val);
    modelVisible.value = false;
  }

  function openDrawer() {
    let duration = getDateDurationByString(timerForm.value.val);
    if (duration) {
      durationForm.value = {
        seconds: duration.seconds(),
        minutes: duration.minutes(),
        hours: duration.hours(),
        days: duration.days(),
        weeks: duration.weeks(),
        months: duration.months(),
        years: duration.years(),
      };
    }
    timerForm.value.oldVal = timerForm.value.val;
    modelVisible.value = true;
  }

  function closeDrawer() {
    timerForm.value.val = timerForm.value.oldVal;
    cycleForm.value = {
      cyclesNum: 1,
      startTime: '',
      cyclePeriod: '',
    };
    modelVisible.value = false;
  }

  function setFormValue() {
    timerForm.value.val = getDateDuration(durationForm.value);
  }

  function reloadData() {
    timerForm.value.type = getTimerType(active!.value) as string;
    timerForm.value.val = getTimerValue(active!.value, timerForm.value.type);
  }

  onMounted(() => {
    reloadData();
  });
  watch(
    () => active?.value,
    (value) => {
      if (value) {
        reloadData();
      }
    }
  );
</script>

<template>
  <n-collapse-item name="Timer">
    <template #header>
      <div class="collapse-title"> <icon-lucide-timer />{{ t('bpmn.panel.timerEvent') }} </div>
    </template>
    <template #default>
      <n-form
        :label-width="labelWidth"
        :size="formSize"
        :label-placement="labelPlace"
        :model="timerForm"
      >
        <n-form-item :label="t('bpmn.panel.timerType')" path="type" >
          <n-select
            v-model="timerForm.type"
            @update-value="timerTypeChange"
            :options="timerOptions"
          />
        </n-form-item>
        <n-form-item :label="t('bpmn.panel.timerValue')" path="val">
          <n-date-picker
            v-if="timerForm.type === 'timeDate'"
            v-model:value="timerForm.val"
            @update-value="timerValueChange"
            type="datetime"
            :format="ISO_DATE_FORMAT"
            :value-format="ISO_DATE_FORMAT"
            :placeholder="t('bpmn.panel.selectTime')"
          />
          <n-input v-else v-model="timerForm.val" @change="timerValueChange">
            <template #suffix>
              <n-icon @click="openDrawer">
                <icon-lucide-search />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>
      </n-form>
    </template>
  </n-collapse-item>

  <n-drawer v-model:show="modelVisible" :width="600">
    <n-drawer-content :title="modelTitle">
      <n-form
        v-model="durationForm"
        :labn-width="labelWidth"
        label-align="left"
        label-placement="left"
      >
        <template v-if="timerForm.type === 'timeDuration'">
          <n-form-item :label="t('bpmn.panel.nowConfig')" path="val">
            <n-input v-model:value="timerForm.val" clearable disabled />
          </n-form-item>
        </template>
        <template v-if="timerForm.type === 'timeCycle'">
          <n-form-item :label="t('bpmn.panel.cycleType')" labn-width="40" path="cycleType">
            <n-radio-group v-model:value="cycleType" size="medium">
              <n-radio-button label="cron" value="cron" />
              <n-radio-button :label="t('bpmn.panel.standardFormat')" value="duration" />
            </n-radio-group>
          </n-form-item>
          <CronGen v-if="cycleType === 'cron'" v-model="timerForm.val" />
          <template v-if="cycleType === 'duration'">
            <n-form-item :label="t('bpmn.panel.timerValue')" labn-width="40" path="cycleFormValue">
              <n-input v-model:value="cycleFormValue" disabled />
            </n-form-item>
            <n-divider />
            <n-form-item :label="t('bpmn.panel.cyclesNum')" path="cyclesNum">
              <n-input-number
                v-model:value="cycleForm.cyclesNum"
                :min="0"
                @update-value="setFormValue"
              />
            </n-form-item>
            <n-form-item :label="t('bpmn.panel.startTime')" path="startTime">
              <n-date-picker
                v-model:value="cycleForm.startTime"
                type="datetime"
                :placeholder="t('bpmn.panel.selectTime')"
                format="YYYY-MM-DD hh:mm:ss"
                value-format="YYYY-MM-DDThh:mm:ss"
              />
            </n-form-item>
          </template>
        </template>
        <template
          v-if="
            timerForm.type === 'timeDuration' ||
            (timerForm.type === 'timeCycle' && cycleType === 'duration')
          "
        >
          <n-form-item :label="t('bpmn.panel.seconds')" path="seconds">
            <n-input-number
              v-model:value="durationForm.seconds"
              :min="0"
              @update-value="setFormValue"
            />
          </n-form-item>
          <n-form-item :label="t('bpmn.panel.minutes')" path="minutes">
            <n-input-number
              v-model:value="durationForm.minutes"
              :min="0"
              @update-value="setFormValue"
            />
          </n-form-item>
          <n-form-item :label="t('bpmn.panel.hours')" path="hours">
            <n-input-number
              v-model:value="durationForm.hours"
              controls-position="right"
              :min="0"
              @change="setFormValue"
            />
          </n-form-item>
          <n-form-item :label="t('bpmn.panel.days')" path="days">
            <n-input-number
              v-model:value="durationForm.days"
              :min="0"
              @update-value="setFormValue"
            />
          </n-form-item>
          <n-form-item :label="t('bpmn.panel.months')" path="months">
            <n-input-number
              v-model:value="durationForm.months"
              :min="0"
              @update-value="setFormValue"
            />
          </n-form-item>
          <n-form-item :label="t('bpmn.panel.years')" path="years">
            <n-input-number
              v-model:value="durationForm.years"
              :min="0"
              @update-value="setFormValue"
            />
          </n-form-item>
        </template>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeDrawer">{{ t('global.cancel') }}</n-button>
          <n-button type="primary" @click="saveTimerValue">{{ t('bpmn.panel.confirm') }}</n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
