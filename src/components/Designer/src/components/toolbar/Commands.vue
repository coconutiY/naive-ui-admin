<script setup name="Commands" lang="ts">
  import type Modeler from 'bpmn-js/lib/Modeler';
  import type CommandStack from 'diagram-js/lib/command/CommandStack';
  import Emitter from '@/components/Designer/src/utils/event-emitter';
  import { MODELER_INIT } from '@/components/Designer/src/config/bpmnEnums';

  let command: CommandStack | null = null;

  const { canRedo, canUndo } = {} as any;

  Emitter.on(MODELER_INIT, (modeler: Modeler) => {
    command = modeler.get<CommandStack>('commandStack');
  });

  const undo = () => {
    command && command.canUndo() && command.undo();
  };

  const redo = () => {
    command && command.canRedo() && command.redo();
  };

  const restart = () => {
    canUndo.value = false;
    canRedo.value = false;
    command && command.clear();
    // createNewDiagram()
  };
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
