<script setup name="Bpmn" lang="ts">
  import { columns } from '@/views/comp/bpmn/basicColumns';
  import { BasicTable, TableAction } from '@/components/Table';
  import { computed, h, reactive, ref } from 'vue';
  import { DeleteOutlined, EditOutlined } from '@vicons/antd';
  import { useMessage } from 'naive-ui';
  import { useRouter } from 'vue-router';
  import { useAsyncRouteStore } from '@/store/modules/asyncRoute';

  const message = useMessage();
  // const dialog = useDialog();
  const router = useRouter();
  const actionRef = ref();
  const data = ref([
    {
      id: `Process_No1753436033030`,
      name: '流程1',
      category: '重构流程1',
      createDate: '2025-07-24 21:43:00',
    },
    {
      id: `Process_No1753436070101`,
      name: '流程2',
      category: '重构流程2',
      createDate: '2025-07-24 22:43:00',
    },
  ]);

  const actionColumn = reactive({
    width: 180,
    title: '操作',
    key: 'action',
    fixed: 'right',
    align: 'center',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: createActions(record),
      });
    },
  });

  function createActions(record) {
    return [
      {
        label: '设计',
        // 配置 color 会覆盖 type
        icon: DeleteOutlined,
        onClick: handleDelete.bind(null, record),
        // 根据权限控制是否显示: 有权限，会显示，支持多个
        auth: ['basic_list'],
      },
      {
        label: '编辑',
        icon: EditOutlined,
        onClick: handleEdit.bind(null, record),
        auth: ['basic_list'],
      },
    ];
  }
  function onCheckedRow(rowKeys) {
    console.log(rowKeys);
  }

  async function handleDelete(record) {
    console.log(record.id);
    await router.push({
      path: `designer/${record.id}`,
      query: { id: record.id, name: record.name },
    });
  }

  function handleEdit() {
    const asyncRouteStore = useAsyncRouteStore();
    // 需要缓存的路由组件
    const keepAliveComponents = computed(() => asyncRouteStore.keepAliveComponents);
    console.log(keepAliveComponents, 'keepAliveComponentsEdit');
    message.success('您点击了编辑按钮');
  }

</script>

<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      title="流程列表"
      titleTooltip="这是一个提示"
      :columns="columns"
      :dataSource="data"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1360"
      @update:checked-row-keys="onCheckedRow"
    />
  </n-card>
</template>

<style scoped lang="less"></style>
