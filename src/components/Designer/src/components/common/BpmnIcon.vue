<template>
  <svg class="bpmn-icon" aria-hidden="true">
    <svg-icon :icon-class="`${iconName}`" :color="color" />
  </svg>
</template>

<script setup name="BpmnIcon" lang="ts">
  import { computed } from 'vue';

  const props = defineProps({
    name: {
      type: String,
      default: 'bpmn-icon-process',
    },
    color: {
      type: String,
      default: '#1d1d1f',
    },
  });
  const iconName = computed(() => {
    if (props.name) {
      return `bpmn-icons-${props.name}`;
    }
    return props.name;
  });
</script>

<style scoped lang="scss"></style>
