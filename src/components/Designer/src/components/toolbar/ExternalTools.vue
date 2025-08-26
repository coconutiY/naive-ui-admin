<script setup lang="ts">
  import ToggleMode from 'bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode';
  import Modeler from 'bpmn-js/lib/Modeler';
  import {
    MODELER,
    MODELER_EVENTBUS,
    MODELER_LINTING,
    MODELER_MINIMAP,
    MODELER_TOGGLEMODE,
  } from '@/components/Designer/src/config/bpmnEnums';
  import EventBus from 'diagram-js/lib/core/EventBus';

  const { t } = useI18n();
  const modelerRef = inject<Ref<Modeler>>(MODELER);

  const modal = ref({
    title: t('bpmn.toolbar.bpmnEvents'),
    event: true,
    visible: false,
  });

  let minimap: any | null = null;
  const minimapStatus = ref(true);

  function minimapToggle() {
    !minimap && (minimap = modelerRef!.value.get(MODELER_MINIMAP));
    minimap && minimap.toggle();
  }

  function mockSimulation() {
    modelerRef!.value.get<ToggleMode>(MODELER_TOGGLEMODE).toggleMode();
  }

  let lintModule: any | null = null;
  const lintEnable = ref(true);

  function lintToggle() {
    !lintModule && (lintModule = modelerRef!.value.get(MODELER_LINTING));
    lintModule && lintModule.toggle();
  }

  function openShortcutKeysModel() {
    modal.value.title = t('bpmn.toolbar.bpmnShortcutKeys');
    modal.value.event = false;
    modal.value.visible = true;
  }

  // const shortcutKeysEnable = ref(true);
  // const templateExternal = ref(true);

  const listeners = ref<string[]>([]);
  const listenerFilter = ref();

  function openEventsModel() {
    const eventBus = modelerRef!.value.get<EventBus>(MODELER_EVENTBUS);
    listenerFilter.value = '';
    listeners.value = Object.keys(eventBus['_listeners']).sort();
    modal.value.title = t('bpmn.toolbar.bpmnEvents');
    modal.value.event = true;
    modal.value.visible = true;
  }

  function closeEventsModel() {
    listenerFilter.value = '';
    listeners.value = [];
    modal.value.visible = false;
  }

  function filterListener() {
    if (!listenerFilter.value) {
      const eventBus = modelerRef!.value.get<EventBus>(MODELER_EVENTBUS);
      listeners.value = Object.keys(eventBus['_listeners']).sort();
    } else {
      listeners.value = listeners.value.filter((i) => i.includes(listenerFilter.value));
    }
  }
</script>

<template>
  <n-button-group>
    <n-tooltip>
      <template #trigger>
        <n-button @click="mockSimulation">
          <template #icon>
            <n-icon>
              <icon-lucide-bot />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('bpmn.toolbar.toggleProcessMock') }}
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button @click="openEventsModel">
          <template #icon>
            <n-icon>
              <icon-ant-design-cluster-outlined />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('bpmn.toolbar.bpmnEvents') }}
    </n-tooltip>
    <n-tooltip v-if="minimapStatus">
      <template #trigger>
        <n-button @click="minimapToggle">
          <template #icon>
            <n-icon>
              <icon-lucide-map />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('bpmn.toolbar.toggleMinimap') }}
    </n-tooltip>
    <n-tooltip v-if="lintEnable">
      <template #trigger>
        <n-button @click="lintToggle">
          <template #icon>
            <n-icon>
              <icon-lucide-clipboard-check />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('bpmn.toolbar.toggleProcessLint') }}
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button @click="openShortcutKeysModel">
          <template #icon>
            <n-icon>
              <icon-lucide-info />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ t('bpmn.toolbar.bpmnShortcutKeys') }}
    </n-tooltip>
  </n-button-group>

  <n-modal v-model:show="modal.visible" @close="closeEventsModel">
    <n-card :title="modal.title" :style="{ width: '500px', height: '60vh' }">
      <template v-if="modal.event" #header-extra>
        <n-input
          v-model:value="listenerFilter"
          @update:value="filterListener"
          :clearable="true"
          class="listener-search"
        />
      </template>
      <template #default>
        <n-scrollbar v-if="modal.event" :size="1">
          <div class="listener-list" :style="{ 'max-height': '50vh' }">
            <p class="listener-item" v-for="(name, index) in listeners" :key="name">{{
              `${index + 1}：${name}`
            }}</p>
          </div>
        </n-scrollbar>
        <n-scrollbar v-else :size="1">
          <div class="shortcut-keys-model">
            <p>{{ `${t('bpmn.toolbar.undo')} : Ctrl + Z` }}</p>
            <p>{{ `${t('bpmn.toolbar.redo')} : Ctrl + Shift + Z / ctrl + Y ` }}</p>
            <p>{{ `${t('bpmn.toolbar.selectAll')} : Ctrl + A ` }} </p>
            <p>{{ `${t('bpmn.toolbar.zoom')} : Ctrl + ${t('bpmn.toolbar.mouseWheel')}` }}</p>
            <p>{{ `${t('bpmn.toolbar.scrollingVertical')} : ${t('bpmn.toolbar.mouseWheel')}` }}</p>
            <p>{{
              `${t('bpmn.toolbar.scrollingHorizontal')}: Shift + ${t('bpmn.toolbar.mouseWheel')}`
            }}</p>
            <!--            <p>{{t('bpmn.toolbar.directEditing') }}</p>-->
            <!--          <p>E</p>-->
            <!--          <p>{{t('bpmn.toolbar.handTool') }}</p>-->
            <!--          <p>H</p>-->
            <!--          <p>{{t('bpmn.toolbar.lassoTool') }}</p>-->
            <!--          <p>L</p>-->
            <!--          <p>{{t('bpmn.toolbar.spaceTool') }}</p>-->
            <!--          <p>S</p>-->
          </div>
          <!--        <div v-if="templateExternal" class="shortcut-keys-model">-->
          <!--          <p>{{t('bpmn.toolbar.replaceTool') }}</p>-->
          <!--          <p>R</p>-->
          <!--          <p>{{t('bpmn.toolbar.appendAnything') }}</p>-->
          <!--          <p>A</p>-->
          <!--          <p>{{t('bpmn.toolbar.createAnything') }}</p>-->
          <!--          <p>N</p>-->
          <!--        </div>-->
        </n-scrollbar>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped lang="scss"></style>
