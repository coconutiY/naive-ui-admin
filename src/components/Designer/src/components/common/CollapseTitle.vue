<template>
  <div class="collapse-title">
    <slot></slot>
    <span class="title-content">{{ title }}</span>
    <slot class="title-content-end" name="title-content-end"></slot>
    <!--<slot class="title-end" name="title-end"></slot>-->
  </div>
</template>

<script setup name="CollapseTitle" lang="ts">
  import { computed } from 'vue';

  type Props = {
    title: string;
    fontSize: number;
    fontWeight?: 'normal' | 'bold';
  };
  const props = withDefaults(defineProps<Props>(), {
    title: '',
    fontSize: 16,
    fontWeight: 'normal',
  });

  const finalFontSize = computed(() => {
    return `${props.fontSize}px`;
  });
</script>

<style scoped lang="scss">
  .collapse-title {
    display: flex;
    align-items: center;
    font-size: v-bind(finalFontSize);
    color: #303133;
    font-weight: v-bind(fontWeight);
    justify-content: space-between;
    .title-content {
      margin-left: 8px;
      flex: 0 0 auto;
      margin-right: 5px;
    }
    .title-content-end {
      flex: 0 0 auto;
    }
    .title-end {
      flex: 0 0 auto; /* 不让右侧元素伸缩 */
      margin-left: auto; /* 将右侧元素推向右边 */
    }
  }
</style>
