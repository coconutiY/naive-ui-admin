<script setup lang="ts">
  import Modeler from 'bpmn-js/lib/Modeler';
  import { Ref, ref, shallowRef, watch, defineAsyncComponent } from 'vue';
  import {
    ACTIVE_ELEMENT,
    bpmnIcons,
    MODELER,
    MODELER_TRANSLATE,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { inject } from 'vue-demi';
  import bpmnIconKey from '@/components/Designer/src/utils/icon';
  import { Translate } from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
  import {
    isAssignable,
    isAsynchronous,
    isConditional,
    isExecutable,
    isProcess,
    isTaskListener,
    isTimer,
  } from '@/components/Designer/src/utils/implType';
  import { propTypes } from '@/utils/propTypes';

  defineOptions({ name: 'Panel' });
  defineProps({
    drawerVisible: {
      type: Boolean,
      default: propTypes.bool.def(true),
    },
  });

  const asyncComponents = shallowRef<Record<string, Component>>({});
  onMounted(async () => {
    const modules = import.meta.glob('./components/*.vue');
    Object.entries(modules).forEach(([filePath]) => {
      const name = filePath
        .split('/')
        .pop()!
        .replace(/\.\w+$/, '');
      asyncComponents.value[`${name}`] = defineAsyncComponent(() => import(filePath));
    });
  });
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<BpmnElement>>(ACTIVE_ELEMENT);

  const iconName = ref('Process');
  const activeType = ref('');
  const title = ref('');
  const renderComponents = shallowRef<Component[]>([]);

  function getCollapseItem(element: BpmnElement) {
    const keys = ['BaseInfo'];
    isConditional(element) && keys.push('Conditional');
    isTimer(element) && keys.push('Timer');
    // isAssignable(modelerRef!.value, element) && keys.push('Timer');
    isTaskListener(element) && keys.push('TaskListeners');
    isExecutable(element) && keys.push('ExecutionListeners');
    isProcess(element) && keys.push('GlobalEvents');
    keys.push('ExtensionProperties');
    isAsynchronous(modelerRef!.value, element) && keys.push('AsyncContinuations');
    keys.push('Documentations');
    renderComponents.value = keys.map((key) => asyncComponents.value[key]);
  }

  function reloadData() {
    if (active!.value && active!.value.type.split(':')[1] !== activeType.value) {
      const translate = modelerRef!.value.get<Translate>(MODELER_TRANSLATE);
      activeType.value = translate(active!.value.type.split(':')[1]);
      const iconKey = bpmnIconKey(active!.value);
      title.value = translate(iconKey);
      iconName.value = bpmnIcons[iconKey];
      getCollapseItem(active!.value);
    }
  }

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
  <div class="designer_panel" v-show="drawerVisible">
    <n-card class="card">
      <template #header>
        <div class="panel-header">
          <BpmnIcon :name="iconName" />
          <span class="bpmn-title">{{ title }}</span>
        </div>
      </template>
      <template #default>
        <n-scrollbar :size="1">
          <n-collapse arrow-placement="right">
            <template v-for="renderComponent in renderComponents" :key="renderComponent">
              <component :is="renderComponent" v-if="active" />
            </template>
          </n-collapse>
        </n-scrollbar>
      </template>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
