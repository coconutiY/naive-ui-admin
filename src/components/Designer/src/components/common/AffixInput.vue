<script setup lang="ts">
  defineProps({
    modelValue: {
      type: String,
      default: '',
    },
  });
  defineEmits(['update:modelValue']);
</script>

<template>
  <div class="affix-input">
    <div v-if="$slots.prefix" class="prefix"><slot name="prefix"></slot></div>
    <input
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <div v-if="$slots.suffix" class="suffix"><slot name="suffix"></slot></div>
  </div>
</template>

<style scoped lang="less">
  .affix-input {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .prefix,
  .suffix {
    position: absolute;
    color: #666;
    pointer-events: none;
    font-size: 14px;
  }
  .prefix {
    left: 8px;
  }
  .suffix {
    right: 8px;
  }
  input {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    height: 32px;
    line-height: 32px;
    padding: 0 28px 0 28px; /* 左右留出 slot 空间 */
    outline: none;
  }
</style>
