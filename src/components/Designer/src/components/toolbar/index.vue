<template>
  <div class="toolbar">
    <NButtonGroup>
      <slot name="save-btn"></slot>
      <Imports />
      <Exports />
      <Previews />
    </NButtonGroup>
    <Aligns />
    <Scales />
    <Commands />
    <ExternalTools />
  </div>
</template>

<script setup name="ToolBar" lang="ts">
  const Previews = defineAsyncComponent(async () => await import('./Previews.vue'));
  const Imports = defineAsyncComponent(async () => await import('./Imports.vue'));
  const Exports = defineAsyncComponent(async () => await import('./Exports.vue'));
  const Aligns = defineAsyncComponent(async () => await import('./Aligns.vue'));
  const Scales = defineAsyncComponent(async () => await import('./Scales.vue'));
  const Commands = defineAsyncComponent(async () => await import('./Commands.vue'));
  const ExternalTools = defineAsyncComponent(async () => await import('./ExternalTools.vue'));
</script>
<style scoped lang="scss">
  @use 'src/components/Designer/src/styles/toolbar.scss';
</style>
