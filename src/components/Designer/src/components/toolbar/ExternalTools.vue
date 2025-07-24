<script setup lang="ts">
  import ToggleMode from 'bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode';
  import LucideBot from '~icons/lucide/bot';
  import AntDesignClusterOutlined from '~icons/ant-design/cluster-outlined';
  import { computed, getCurrentInstance, inject, ref, Ref } from 'vue';
  import Modeler from 'bpmn-js/lib/Modeler';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import { ComponentInternalInstance } from 'vue-demi';

  const { proxy } = getCurrentInstance() as ComponentInternalInstance;
  const modelerRef = inject<Ref<Modeler>>(MODELER);

  const eventsModel = ref({
    title: proxy?.$t('bpmn.toolbar.bpmnShortcutKeys'),
    visible: false,
  });

  const shortcutKeysModel = ref({
    title: proxy?.$t('bpmn.toolbar.bpmnShortcutKeys'),
    visible: false,
  });

  let minimap: any | null = null;
  // const minimapStatus = computed(() => useEditorStore().getEditorConfig.miniMap);
  const minimapStatus = ref(true);
  const minimapToggle = () => {
    !minimap && (minimap = modelerRef!.value.get('minimap'));
    minimap && minimap.toggle();
  };

  const mockSimulation = () => {
    modelerRef!.value.get<ToggleMode>('toggleMode').toggleMode();
  };

  let lintModule: any | null = null;
  // const lintEnable = computed(() => useEditorStore().getEditorConfig.useLint);
  const lintEnable = ref(true);
  const lintToggle = () => {
    !lintModule && (lintModule = modelerRef!.value.get('linting'));
    lintModule && lintModule.toggle();
  };

  const openShortcutKeysModel = () => {
    shortcutKeysModel.value.visible = true;
  };

  // const shortcutKeysEnable = computed(() => useEditorStore().getEditorConfig.otherModule);
  const shortcutKeysEnable = ref(true);
  // const templateExternal = computed(() => useEditorStore().getEditorConfig.templateChooser);
  const templateExternal = ref(true);

  const listeners = ref<string[]>([]);
  const listenerFilter = ref<string>('');
  const visibleListeners = computed(() =>
    listeners.value.filter((i) => i.includes(listenerFilter.value))
  );

  const openEventsModel = () => {
    const eventBus = modelerRef!.value.get<any>('eventBus');
    listenerFilter.value = '';
    listeners.value = Object.keys(eventBus._listeners).sort();
    eventsModel.value.visible = true;
  };
</script>

<template>
  <n-button-group>
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.toggleProcessMock') }}
      </template>
      <n-button :icon="LucideBot" @click="mockSimulation" />
    </n-tooltip>
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.bpmnEvents') }}
      </template>
      <n-button :icon="AntDesignClusterOutlined" @click="openEventsModel" />
    </n-tooltip>
    <n-tooltip effect="light" v-if="minimapStatus">
      <template #content>
        {{ $t('bpmn.toolbar.toggleMinimap') }}
      </template>
      <n-button :icon="MapLocation" @click="minimapToggle" />
    </n-tooltip>
    <n-tooltip effect="light" v-if="lintEnable">
      <template #content>
        {{ $t('bpmn.toolbar.toggleProcessLint') }}
      </template>
      <n-button :icon="DocumentChecked" @click="lintToggle" />
    </n-tooltip>
    <n-tooltip effect="light" v-if="shortcutKeysEnable">
      <template #content>
        {{ $t('bpmn.toolbar.bpmnShortcutKeys') }}
      </template>
      <n-button :icon="WarningFilled" @click="openShortcutKeysModel" />
    </n-tooltip>
  </n-button-group>
  <n-dialog :title="eventsModel.title" v-model="eventsModel.visible" width="500px" append-to-body>
    <div class="event-listeners-box">
      <div class="listener-search">
        <n-input v-model="listenerFilter" :clearable="true" />
      </div>
      <div class="event-listeners-box" v-if="visibleListeners">
        <p class="listener-item" v-for="(name, key) in visibleListeners" :key="key"
          >{{ key + 1 }}：{{ name }}</p
        >
      </div>
    </div>
  </n-dialog>

  <n-dialog
    :title="shortcutKeysModel.title"
    v-model="shortcutKeysModel.visible"
    width="500px"
    append-to-body
  >
    <div class="shortcut-keys-model">
      <p>{{ $t('bpmn.toolbar.undo') }}</p>
      <p>Ctrl + Z</p>
      <p>{{ $t('bpmn.toolbar.redo') }}</p>
      <p>Ctrl + Shift + Z / ctrl + Y</p>
      <p>{{ $t('bpmn.toolbar.selectAll') }}</p>
      <p>Ctrl + A</p>
      <p>{{ $t('bpmn.toolbar.zoom') }}</p>
      <p>Ctrl + {{ $t('bpmn.toolbar.mouseWheel') }}</p>
      <p>{{ $t('bpmn.toolbar.scrollingVertical') }}</p>
      <p>{{ $t('bpmn.toolbar.mouseWheel') }}</p>
      <p>{{ $t('bpmn.toolbar.scrollingHorizontal') }}</p>
      <p>Shift + {{ $t('bpmn.toolbar.mouseWheel') }}</p>
      <p>{{ $t('bpmn.toolbar.directEditing') }}</p>
      <p>E</p>
      <p>{{ $t('bpmn.toolbar.handTool') }}</p>
      <p>H</p>
      <p>{{ $t('bpmn.toolbar.lassoTool') }}</p>
      <p>L</p>
      <p>{{ $t('bpmn.toolbar.spaceTool') }}</p>
      <p>S</p>
    </div>
    <div v-if="templateExternal" class="shortcut-keys-model">
      <p>{{ $t('bpmn.toolbar.replaceTool') }}</p>
      <p>R</p>
      <p>{{ $t('bpmn.toolbar.appendAnything') }}</p>
      <p>A</p>
      <p>{{ $t('bpmn.toolbar.createAnything') }}</p>
      <p>N</p>
    </div>
  </n-dialog>
</template>

<style scoped lang="scss"></style>
