<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { timerOptions } from '@/components/Designer/src/config/selectOptions';

  defineOptions({ name: 'Timer' });
  defineProps({
    labelWidth: propTypes.number.def(80),
  });

  const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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
  const modelTitle = ref(proxy?.$t('bpmn.panel.configTime'));
  const cycleType = ref<string>('cron');
  const modelerStore = useModelerStore();
  const timerOptions = ref<OptionType[]>([
    { value: 'timeDate', label: proxy?.$t('bpmn.panel.timeDate') as string },
    { value: 'timeDuration', label: proxy?.$t('bpmn.panel.timeDuration') as string },
    { value: 'timeCycle', label: proxy?.$t('bpmn.panel.timeCycle') as string },
  ]);

  const cycleFormValue = computed(() => {
    let dateDuration = getDateDuration(durationForm.value);
    return `R${cycleForm.value.cyclesNum}/${cycleForm.value.startTime || '-'}/${
      dateDuration === 'P0D' ? '-' : dateDuration
    }`;
  });

  const timerTypeChange = (value: string) => {
    setTimerType(modelerStore.getActive!, value);
  };

  const timerValueChange = () => {
    if (timerForm.value.type && timerForm.value.type === 'timeDuration') {
      let regExp = new RegExp(
        '^P(?=\\d|T$)(\\d+Y)?(\\d+M)?(\\d+W)?(\\d+D)?(T(\\d+H)?(\\d+M)?(\\d+(\\.\\d{1,})?S)?)?$'
      );
      if (!regExp.exec(timerForm.value.val)) {
        return proxy?.$modal.msgError(proxy?.$t('bpmn.panel.typeError'));
      }
    }
    timerForm.value.type &&
      setTimerValue(modelerStore.getActive!, timerForm.value.type, timerForm.value.val);
  };

  const saveTimerValue = () => {
    if (timerForm.value.type === 'timeCycle' && cycleType.value === 'duration') {
      timerForm.value.val = cycleFormValue.value;
    }
    setTimerValue(modelerStore.getActive!, timerForm.value.type, timerForm.value.val);
    modelVisible.value = false;
  };

  const openDrawer = () => {
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
  };

  const closeDrawer = () => {
    timerForm.value.val = timerForm.value.oldVal;
    cycleForm.value = {
      cyclesNum: 1,
      startTime: '',
      cyclePeriod: '',
    };
    modelVisible.value = false;
  };

  const setFormValue = () => {
    timerForm.value.val = getDateDuration(durationForm.value);
  };

  const reloadData = () => {
    timerForm.value.type = getTimerType(modelerStore.getActive!) as string;
    timerForm.value.val = getTimerValue(modelerStore.getActive!, timerForm.value.type);
  };

  const eventEmitterListener = () => {
    if (isTimerSupported(modelerStore.getActive!)) {
      reloadData();
    }
  };

  onMounted(() => {
    reloadData();
  });
</script>

<template>
  <n-collapse-item name="Timer">
    <template #header>
      <div class="collapse-title">
        <icon-lucide-timer />
        {{ t('bpmn.panel.timerEvent') }}
      </div>
    </template>
    <template #default>
      <n-form :labn-width="labelWidth" :model="timerForm">
        <n-form-item :label="$t('bpmn.panel.timerType')" path="type">
          <n-select
            v-model="timerForm.type"
            clearable
            @change="timerTypeChange"
            :options="timerOptions"
          />
        </n-form-item>
        <n-form-item v-if="timerForm.type" :label="$t('bpmn.panel.timerValue')" path="val">
          <n-date-picker
            v-if="timerForm.type === 'timeDate'"
            v-model="timerForm.val"
            @change="timerValueChange"
            type="datetime"
            :placeholder="$t('bpmn.panel.selectTime')"
            format="YYYY-MM-DDThh:mm:ss"
            value-format="YYYY-MM-DDThh:mm:ss"
          />
          <n-input v-else v-model="timerForm.val" clearable @change="timerValueChange">
            <template #append>
              <n-button type="primary" @click="openDrawer">
                <template #icon>
                  <n-icon>
                    <icon-lucide-search />
                  </n-icon>
                </template>
              </n-button>
            </template>
          </n-input>
        </n-form-item>
      </n-form>
    </template>
  </n-collapse-item>
  <n-drawer v-model:show="modelVisible" :title="modelTitle" destroy-on-close>
    <n-form v-model="durationForm" :labn-width="labelWidth">
      <template v-if="timerForm.type === 'timeDuration'">
        <n-form-item :label="$t('bpmn.panel.nowConfig')" path="val">
          <n-input v-model:value="timerForm.val" clearable disabled />
        </n-form-item>
      </template>
      <template v-if="timerForm.type === 'timeCycle'">
        <n-form-item :label="$t('bpmn.panel.cycleType')" labn-width="40" path="cycleType">
          <n-radio-group v-model:value="cycleType" size="medium">
            <n-radio-button label="cron" value="cron" />
            <n-radio-button :label="$t('bpmn.panel.standardFormat')" value="duration" />
          </n-radio-group>
        </n-form-item>
        <cron-gen v-if="cycleType === 'cron'" v-model="timerForm.val" />
        <template v-if="cycleType === 'duration'">
          <n-form-item :label="$t('bpmn.panel.timerValue')" labn-width="40" path="cycleFormValue">
            <n-input v-model:value="cycleFormValue" disabled />
          </n-form-item>
          <n-divider />
          <n-form-item :label="$t('bpmn.panel.cyclesNum')" path="cyclesNum">
            <n-space>
              <n-input-number
                v-model="cycleForm.cyclesNum"
                controls-position="right"
                :min="0"
                @change="setFormValue"
              >
                <template #decrease-icon>
                  <n-icon>
                    <Minus />
                  </n-icon>
                </template>
                <template #increase-icon>
                  <n-icon>
                    <Plus />
                  </n-icon>
                </template>
              </n-input-number>
            </n-space>
          </n-form-item>
          <n-form-item :label="$t('bpmn.panel.startTime')" path="startTime">
            <n-date-picker
              v-model="cycleForm.startTime"
              type="datetime"
              :placeholder="$t('bpmn.panel.selectTime')"
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
        <n-form-item :label="$t('bpmn.panel.seconds')" path="seconds">
          <n-space>
            <n-input-number
              v-model="durationForm.seconds"
              controls-position="right"
              :min="0"
              @change="setFormValue"
            >
              <template #decrease-icon>
                <n-icon>
                  <icon-lucide-minus />
                </n-icon>
              </template>
              <template #increase-icon>
                <n-icon>
                  <icon-lucide-plus />
                </n-icon>
              </template>
            </n-input-number>
          </n-space>
        </n-form-item>
        <n-form-item :label="$t('bpmn.panel.minutes')" path="minutes">
          <n-space>
            <n-input-number
              v-model="durationForm.minutes"
              controls-position="right"
              :min="0"
              @change="setFormValue"
            >
              <template #decrease-icon>
                <n-icon>
                  <icon-lucide-minus />
                </n-icon>
              </template>
              <template #increase-icon>
                <n-icon>
                  <icon-lucide-plus />
                </n-icon>
              </template>
            </n-input-number>
          </n-space>
        </n-form-item>
        <n-form-item :label="$t('bpmn.panel.hours')" path="hours">
          <n-space>
            <n-input-number
              v-model="durationForm.hours"
              controls-position="right"
              :min="0"
              @change="setFormValue"
            >
              <template #decrease-icon>
                <n-icon>
                  <icon-lucide-minus />
                </n-icon>
              </template>
              <template #increase-icon>
                <n-icon>
                  <icon-lucide-plus />
                </n-icon>
              </template>
            </n-input-number>
          </n-space>
        </n-form-item>
        <n-form-item :label="$t('bpmn.panel.days')" path="days">
          <n-space>
            <n-input-number
              v-model="durationForm.days"
              controls-position="right"
              :min="0"
              @change="setFormValue"
            >
              <template #decrease-icon>
                <n-icon>
                  <icon-lucide-minus />
                </n-icon>
              </template>
              <template #increase-icon>
                <n-icon>
                  <icon-lucide-plus />
                </n-icon>
              </template>
            </n-input-number>
          </n-space>
        </n-form-item>
        <n-form-item :label="$t('bpmn.panel.months')" path="months">
          <n-space>
            <n-input-number
              v-model="durationForm.months"
              controls-position="right"
              :min="0"
              @change="setFormValue"
            >
              <template #decrease-icon>
                <n-icon>
                  <icon-lucide-minus />
                </n-icon>
              </template>
              <template #increase-icon>
                <n-icon>
                  <icon-lucide-plus />
                </n-icon>
              </template>
            </n-input-number>
          </n-space>
        </n-form-item>
        <n-form-item :label="$t('bpmn.panel.years')" path="years">
          <n-space>
            <n-input-number
              v-model="durationForm.years"
              controls-position="right"
              :min="0"
              @change="setFormValue"
            >
              <template #decrease-icon>
                <n-icon>
                  <icon-lucide-minus />
                </n-icon>
              </template>
              <template #increase-icon>
                <n-icon>
                  <icon-lucide-plus />
                </n-icon>
              </template>
            </n-input-number>
          </n-space>
        </n-form-item>
      </template>
    </n-form>

    <template #footer>
      <div class="drawer-footer">
        <n-button @click="closeDrawer">{{ $t('global.cancel') }}</n-button>
        <n-button type="primary" @click="saveTimerValue">{{ $t('bpmn.panel.confirm') }}</n-button>
      </div>
    </template>
  </n-drawer>
</template>

<style scoped lang="less"></style>
