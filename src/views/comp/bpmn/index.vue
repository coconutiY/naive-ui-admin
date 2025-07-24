<script setup name="Bpmn" lang="ts">
  import { columns } from '@/views/comp/bpmn/basicColumns';
  import { BasicTable, TableAction } from '@/components/Table';
  import { h, reactive, ref, unref } from 'vue';
  import { DeleteOutlined, EditOutlined } from '@vicons/antd';
  import { useDialog, useMessage } from 'naive-ui';
  import { useRoute, useRouter } from 'vue-router';

  const message = useMessage();
  // const dialog = useDialog();
  const router = useRouter();
  const route = useRoute();
  const actionRef = ref();
  const data = ref([
    {
      id: `Process_No${new Date().getTime()}`,
      name: '流程1',
      category: '重构流程1',
      createDate: '2025-07-24 21:43:00',
    },
    {
      id: `Process_No${new Date().getTime()}`,
      name: '流程2',
      category: '重构流程2',
      createDate: '2025-07-24 22:43:00',
    },
  ]);

  // const loadDataTable = async () => {
  //   return new Promise(() => {
  //     resultSuccess({
  //         page: Number(1),
  //         pageSize: Number(10),
  //         pageCount: 2,
  //         itemCount: Number(10),
  //         list: data,
  //       })
  //   });
  // };

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

  function handleDelete(record) {
    console.log(record);
    router.push({
      path: `/designer/${record.id}`,
      query: { id: record.id, name: record.name },
    });
  }

  function handleEdit(record) {
    console.log(record);
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
