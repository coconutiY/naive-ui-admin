<script setup lang="ts">
  import type CommandStack from 'diagram-js/lib/command/CommandStack';
  import { MODELER, MODELER_COMMAND } from '@/components/Designer/src/config/bpmnEnums';
  import Modeler from 'bpmn-js/lib/Modeler';

  defineOptions({ name: 'Commands' });

  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const command = computed(
    () => modelerRef?.value && modelerRef.value.get<CommandStack>(MODELER_COMMAND)
  );

  const { canRedo, canUndo } = {} as any;

  function undo() {
    command.value && command.value.canUndo() && command.value.undo();
  }

  function redo() {
    command.value && command.value.canRedo() && command.value.redo();
  }

  function restart() {
    canUndo.value = false;
    canRedo.value = false;
    command.value && command.value.clear();
    // createNewDiagram()
  }
</script>

<template>
  <n-button-group>
    <n-tooltip>
      <template #trigger>
        <n-button @click="undo" :disabled="!canUndo">
          <template #icon>
            <n-icon>
              <icon-lucide-undo2 />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.undo') }}
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button @click="redo" :disabled="!canRedo">
          <template #icon>
            <n-icon>
              <icon-lucide-redo2 />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.redo') }}
    </n-tooltip>
    <n-tooltip>
      <template #trigger>
        <n-button @click="restart">
          <template #icon>
            <n-icon>
              <icon-lucide-eraser />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ $t('bpmn.toolbar.restart') }}
    </n-tooltip>
  </n-button-group>
</template>

<style scoped lang="scss"></style>
