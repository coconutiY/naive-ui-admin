<script setup lang="ts">
  import type CommandStack from 'diagram-js/lib/command/CommandStack';
  import { COMMAND_DO, MODELER, MODELER_COMMAND } from '@/components/Designer/src/config/bpmnEnums';
  import Modeler from 'bpmn-js/lib/Modeler';

  defineOptions({ name: 'Commands' });

  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const commandDo = inject<Ref<{ canUndo: boolean; canRedo: boolean }>>(COMMAND_DO);
  const command = computed(
    () => modelerRef?.value && modelerRef.value.get<CommandStack>(MODELER_COMMAND)
  );

  function undo() {
    command.value && command.value.canUndo() && command.value.undo();
  }

  function redo() {
    command.value && command.value.canRedo() && command.value.redo();
  }

  function restart() {
    command.value && command.value.clear();
  }
</script>

<template>
  <n-button-group>
    <n-tooltip>
      <template #trigger>
        <n-button @click="undo" :disabled="!commandDo.canUndo">
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
        <n-button @click="redo" :disabled="!commandDo.canRedo">
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
