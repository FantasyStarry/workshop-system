import React from 'react';
import { Tag, Button, Popconfirm, message, Space } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProTable from '../../components/ProTable';
import type { SearchColumn } from '../../components/ProTable';
import { getOrderPage, deleteOrder, updateOrderStatus } from '../../api/order';
import type { Order } from '../../types/order';
import dayjs from 'dayjs';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待确认', color: 'default' },
  1: { label: '生产中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  3: { label: '已取消', color: 'error' },
};

const nextStatusMap: Record<number, { label: string; value: number } | null> = {
  0: { label: '确认开始生产', value: 1 },
  1: null,
  2: null,
  3: null,
};

const searchColumns: SearchColumn[] = [
  { name: 'orderNo', label: '订单号', type: 'input' },
  { name: 'customerName', label: '客户名称', type: 'input' },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '待确认', value: 0 },
      { label: '生产中', value: 1 },
      { label: '已完成', value: 2 },
      { label: '已取消', value: 3 },
    ],
  },
  { name: 'dateRange', label: '日期范围', type: 'dateRange' },
];

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 160 },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 150 },
    {
      title: '下单时间',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (val: number) => (val != null ? `¥${val.toFixed(2)}` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: number) => {
        const s = statusMap[val] || { label: '未知', color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: Order) => {
        const nextStatus = nextStatusMap[record.status];
        return (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/orders/${record.id}`)}
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/orders/${record.id}/edit`)}
            >
              编辑
            </Button>
            {nextStatus && (
              <Popconfirm
                title={`确定${nextStatus.label}吗？`}
                onConfirm={async () => {
                  await updateOrderStatus(record.id, nextStatus.value);
                  message.success('状态已更新');
                  window.location.reload();
                }}
              >
                <Button type="link" size="small" style={{ color: '#52c41a' }}>
                  {nextStatus.label}
                </Button>
              </Popconfirm>
            )}
            <Popconfirm
              title="确定删除该订单吗？"
              onConfirm={async () => {
                await deleteOrder(record.id);
                message.success('删除成功');
                window.location.reload();
              }}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <ProTable<Order>
      columns={columns}
      fetchData={(page, pageSize, params) => getOrderPage({ page, pageSize, ...params }).then((r) => r.data)}
      searchColumns={searchColumns}
      rowKey="id"
      extraButtons={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/new')}>
          新增订单
        </Button>
      }
    />
  );
};

export default OrderListPage;
