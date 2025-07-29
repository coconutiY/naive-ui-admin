<script setup lang="ts">
  defineOptions({ name: 'Child' });
  const props = defineProps({
    data: {
      type: Object,
    },
  });
  onBeforeMount(() => {
    console.log('子组件挂载前', JSON.parse(JSON.stringify(props.data)));
  });
  onMounted(() => {
    console.log('子组件挂载后', JSON.parse(JSON.stringify(props.data)));
  });

  watch(
    () => props.data,
    (newValue, oldValue) => {
      console.log('子组件数据变化', newValue, oldValue);
    },
    {
      immediate: true,
    }
  );
</script>

<template>
  <div></div>
</template>

<style scoped lang="less"></style>
