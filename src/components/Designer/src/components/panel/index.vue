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

  const lucideChevronsLeft = defineAsyncComponent(() => import('~icons/lucide/chevrons-left'));
  const lucideChevronsRight = defineAsyncComponent(() => import('~icons/lucide/chevrons-right'));
  const BaseInfo = defineAsyncComponent(() => import('./components/BaseInfo.vue'));
  const Documentations = defineAsyncComponent(() => import('./components/Documentations.vue'));
  const Conditional = defineAsyncComponent(() => import('./components/Conditional.vue'));
  const GlobalEvents = defineAsyncComponent(() => import('./components/GlobalEvents.vue'));
  const ExecutionListeners = defineAsyncComponent(
    () => import('./components/ExecutionListeners.vue')
  );
  const TaskListeners = defineAsyncComponent(() => import('./components/TaskListeners.vue'));
  const JobExecution = defineAsyncComponent(() => import('./components/JobExecution.vue'));
  const AsyncContinuations = defineAsyncComponent(
    () => import('./components/AsyncContinuations.vue')
  );
  const ExtensionProperties = defineAsyncComponent(
    () => import('./components/ExtensionProperties.vue')
  );
  const Timer = defineAsyncComponent(() => import('./components/Timer.vue'));
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
    console.log(asyncComponents, 'asyncComponents');
    console.log(renderComponents, 'renderComponents');
  });
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<BpmnElement>>(ACTIVE_ELEMENT);

  const drawerVisible = ref(true);
  const drawerIcon = computed(() =>
    drawerVisible.value ? lucideChevronsRight : lucideChevronsLeft
  );
  const iconName = ref('Process');
  const activeType = ref('');
  const title = ref('');
  const renderComponents = shallowRef<Component[]>([
    BaseInfo,
    Conditional,
    GlobalEvents,
    TaskListeners,
    ExecutionListeners,
    JobExecution,
    Timer,
    ExtensionProperties,
    AsyncContinuations,
    Documentations,
  ]);

  function getcollapseItem(element: BpmnElement) {
    const keys = ['BaseInfo'];


  }
  // renderComponents.value.push(BaseInfo);
  // isCanbeConditional(active?.value) && renderComponents.value.push(Conditional)
  // isTimerSupported(active?.value) && renderComponents.value.push(Timer)
  // isUserAssignmentSupported(active?.value) && renderComponents.value.push(UserAssignment)
  // isMultiInstanceSupported(active?.value) && renderComponents.value.push(MultiInstance)
  // isTaskListener(active?.value) && renderComponents.value.push(TaskListeners)
  // is(active?.value, 'bpmn:Process') && renderComponents.value.push(GlobalEvent);
  // isExecutable(active?.value)&&renderComponents.value.push(ExecutionListeners)
  // is(element, 'bpmn:Process')&& renderComponents.value.push({ name: 'element-event-listeners', component: ElementEventListeners })
  // renderComponents.value.push(ExtensionProperties)
  // isAsynchronous(element)&&renderComponents.value.push({ name: 'element-async-continuations', component: ElementAsyncContinuations })
  // isStartInitializable(element) && renderComponents.value.push({ name: 'element-start-initiator', component: ElementStartInitiator })
  // renderComponents.value.push(Documentation)

  /**
   * 设置panel的展示和隐藏并且更新对应的Icon
   */
  function changeVisible() {
    drawerVisible.value = !drawerVisible.value;
  }

  function reloadData() {
    if (active!.value && active!.value.type.split(':')[1] !== activeType.value) {
      const translate = modelerRef!.value.get<Translate>(MODELER_TRANSLATE);
      activeType.value = translate(active!.value.type.split(':')[1]);
      const iconKey = bpmnIconKey(active!.value);
      title.value = translate(iconKey);
      iconName.value = bpmnIcons[iconKey];
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
  <div class="designer_panel">
    <div class="drawers_btn" @click="changeVisible">
      <component :is="drawerIcon" />
    </div>
    <n-card class="card" v-show="drawerVisible">
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
