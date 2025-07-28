<script setup lang="ts">
  import Modeler from 'bpmn-js/lib/Modeler';
  import { Ref, ref, shallowRef, watch, defineAsyncComponent } from 'vue';
  import {
    ACTIVE_ELEMENT,
    bpmnIcons,
    MODELER,
    MODELER_TRANSLATE,
  } from '@/components/Designer/src/config/bpmnEnums';
  import { inject } from 'vue-demi';
  import { Base } from 'diagram-js/lib/model';
  import { Translate } from 'diagram-js/lib/i18n/translate';
  import bpmnIconKey from '@/components/Designer/src/utils/icon';

  const lucideChevronsLeft = defineAsyncComponent(() => import('~icons/lucide/chevrons-left'));
  const lucideChevronsRight = defineAsyncComponent(() => import('~icons/lucide/chevrons-right'));
  const BaseInfo = defineAsyncComponent(() => import('./components/BaseInfo.vue'));
  // 依赖注入
  const modelerRef = inject<Ref<Modeler>>(MODELER);
  const active = inject<Ref<Base>>(ACTIVE_ELEMENT);

  const drawerVisible = ref(true);
  const drawerIcon = shallowRef(lucideChevronsLeft);
  const iconName = ref<string>('Process');
  const activeType = ref<string>('');
  const title = ref<string | undefined>('');
  // const elementName = ref<string>('Process');
  // const collapseKey = ref<any[]>([])
  // const renderComponents = shallowRef<Item[]>([])

  /**
   * 设置panel的展示和隐藏并且更新对应的Icon
   */
  function changeVisible() {
    drawerVisible.value = !drawerVisible.value;
    drawerIcon.value = drawerVisible.value ? lucideChevronsRight : lucideChevronsLeft;
  }

  function reloadData() {
    if (active?.value && active?.value.type.split(':')[1] !== activeType.value) {
      const translate = modelerRef!.value.get<Translate>(MODELER_TRANSLATE);
      activeType.value = translate(active.value.type.split(':')[1]);
      const iconKey = bpmnIconKey(active!.value);
      // 设置panel的标题
      title.value = translate(activeType.value);
      // 设置标题的icon
      iconName.value = bpmnIcons[iconKey];
    }
  }

  watch(
    () => active?.value,
    (value) => {
      if (value) {
        reloadData();
      }
    }
  );
</script>

<template>
  <div class="designer_panel">
    <div class="drawers_btn" @click="changeVisible">
      <component :is="drawerIcon" />
    </div>
    <n-card class="card" v-show="drawerVisible" header-style="background-color: #f5f5f7;">
      <template #header>
        <div class="panel-header">
          <BpmnIcon :name="iconName" />
          <span class="title">{{ title }}</span>
        </div>
      </template>
      <template #default>
        <n-collapse arrow-placement="right">
          <component :is="BaseInfo" />
        </n-collapse>
      </template>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
  @use '/src/components/Designer/src/styles/panel.scss';
</style>
