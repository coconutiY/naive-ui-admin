<script setup lang="ts">
  import { propTypes } from '@/utils/propTypes';
  import { computed } from 'vue';

  const props = defineProps({
    iconClass: propTypes.string.isRequired,
    className: propTypes.string.def(''),
    color: propTypes.string.def(''),
  });
  const iconName = computed(() => `#icon-${props.iconClass}`);
  const svgClass = computed(() => {
    if (props.className) {
      return `svg-icon ${props.className}`;
    }
    return 'svg-icon';
  });
</script>

<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :href="iconName" :fill="color" />
  </svg>
</template>

<style scoped lang="less">
  .sub-el-icon,
  .nav-icon {
    display: inline-block;
    font-size: 15px;
    margin-right: 12px;
    position: relative;
  }

  .svg-icon {
    width: 1em;
    height: 1em;
    position: relative;
    fill: currentColor;
    vertical-align: -2px;
  }
</style>
