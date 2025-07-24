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
  import Previews from './Previews.vue';
  import Imports from './Imports.vue';
  import Exports from './Exports.vue';
  import Aligns from './Aligns.vue';
  import Scales from './Scales.vue';
  import Commands from './Commands.vue';
  import ExternalTools from './ExternalTools.vue';
</script>
<style scoped lang="scss"></style>
