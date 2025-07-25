<script setup lang="ts">
  import ToggleMode from 'bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode';
  import LucideBot from '~icons/lucide/bot';
  import LucideMap from '~icons/lucide/map';
  import LucideInfo from '~icons/lucide/info';
  import LucideClipboardCheck from '~icons/lucide/clipboard-check';
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
    <n-tooltip>
      <template #trigger>
        <n-button @click="mockSimulation">
          <template #icon>
            <NIcon>
              <LucideBot />
            </NIcon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.toggleProcessMock') }}
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button @click="openEventsModel">
          <template #icon>
            <NIcon>
              <AntDesignClusterOutlined />
            </NIcon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.bpmnEvents') }}
    </n-tooltip>
    <n-tooltip v-if="minimapStatus">
      <template #trigger>
        <n-button @click="minimapToggle">
          <template #icon>
            <NIcon>
              <LucideMap />
            </NIcon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.toggleMinimap') }}
    </n-tooltip>
    <n-tooltip v-if="lintEnable">
      <template #trigger>
        <n-button @click="lintToggle">
          <template #icon>
            <NIcon>
              <LucideClipboardCheck />
            </NIcon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.toggleProcessLint') }}
    </n-tooltip>
    <n-tooltip v-if="shortcutKeysEnable">
      <template #trigger>
        <n-button @click="openShortcutKeysModel">
          <template #icon>
            <NIcon>
              <LucideInfo />
            </NIcon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.bpmnShortcutKeys') }}
    </n-tooltip>
  </n-button-group>
  <n-modal :title="eventsModel.title" v-model:show="eventsModel.visible" width="500px">
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
  </n-modal>

  <n-modal :title="shortcutKeysModel.title" v-model:show="shortcutKeysModel.visible" width="500px">
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
  </n-modal>
</template>

<style scoped lang="scss"></style>
