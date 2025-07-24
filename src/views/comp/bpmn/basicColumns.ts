import { BasicColumn } from '@/components/Table';
export interface ListData {
  id: number;
  name: string;
  category: string;
  createDate: string;
}

export const columns: BasicColumn<ListData>[] = [
  {
    title: 'id',
    key: 'id',
  },
  {
    title: '名称',
    key: 'name',
  },
  {
    title: '类型',
    key: 'category',
  },
  {
    title: '创建时间',
    key: 'createDate',
  },
];
