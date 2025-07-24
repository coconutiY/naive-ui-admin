<script setup name="Commands" lang="ts">
  import type Modeler from 'bpmn-js/lib/Modeler';
  import type CommandStack from 'diagram-js/lib/command/CommandStack';
  import LucideRedo2 from '~icons/lucide/redo-2';
  import LucideUndo2 from '~icons/lucide/undo-2';
  import LucideEraser from '~icons/lucide/eraser';
  import Emitter from '@/components/Designer/src/utils/event-emitter';

  let command: CommandStack | null = null;

  const { canRedo, canUndo } = {} as any;

  Emitter.on('modeler-init', (modeler: Modeler) => {
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
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.undo') }}
      </template>
      <n-button :icon="LucideUndo2" @click="undo" :disabled="!canUndo" />
    </n-tooltip>
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.redo') }}
      </template>
      <n-button :icon="LucideRedo2" @click="redo" :disabled="!canRedo" />
    </n-tooltip>
    <n-tooltip effect="light">
      <template #content>
        {{ $t('bpmn.toolbar.restart') }}
      </template>
      <n-button :icon="LucideEraser" @click="restart" />
    </n-tooltip>
  </n-button-group>
</template>

<style scoped lang="scss"></style>
