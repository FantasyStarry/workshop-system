import React from 'react';
import { Tag, Button, Popconfirm, message, Space } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProTable from '../../components/ProTable';
import type { SearchColumn } from '../../components/ProTable';
import { getProductPage, deleteProduct, updateProductStatus } from '../../api/product';
import type { Product } from '../../types/product';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '禁用', color: 'default' },
  1: { label: '启用', color: '#059669' },
};

const searchColumns: SearchColumn[] = [
  { name: 'productName', label: '产品名称', type: 'input' },
  { name: 'productCode', label: '产品编号', type: 'input' },
  {
    name: 'productType',
    label: '产品类型',
    type: 'select',
    options: [
      { label: '预制梁', value: '预制梁' },
      { label: '预制柱', value: '预制柱' },
      { label: '预制板', value: '预制板' },
      { label: '其他', value: '其他' },
    ],
  },
];

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    { title: '产品编号', dataIndex: 'productCode', key: 'productCode', width: 140 },
    { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 150 },
    { title: '规格', dataIndex: 'specification', key: 'specification', width: 120 },
    { title: '类型', dataIndex: 'productType', key: 'productType', width: 100 },
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
      width: 250,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            style={{ color: '#4F46E5' }}
            onClick={() => navigate(`/products/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            style={{ color: '#4F46E5' }}
            onClick={() => navigate(`/products/${record.id}/edit`)}
          >
            编辑
          </Button>
          {record.status === 1 ? (
            <Popconfirm
              title="确定停用该产品吗？"
              onConfirm={async () => {
                await updateProductStatus(record.id, 0);
                message.success('已停用');
                window.location.reload();
              }}
            >
              <Button type="link" size="small" icon={<StopOutlined />} style={{ color: '#94A3B8' }}>
                停用
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确定启用该产品吗？"
              onConfirm={async () => {
                await updateProductStatus(record.id, 1);
                message.success('已启用');
                window.location.reload();
              }}
            >
              <Button type="link" size="small" icon={<CheckCircleOutlined />} style={{ color: '#059669' }}>
                启用
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定删除该产品吗？"
            onConfirm={async () => {
              await deleteProduct(record.id);
              message.success('删除成功');
              window.location.reload();
            }}
          >
            <Button type="link" size="small" danger style={{ color: '#DC2626' }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProTable<Product>
      columns={columns}
      fetchData={(page, pageSize, params) => getProductPage({ page, pageSize, ...params }).then((r) => r.data)}
      searchColumns={searchColumns}
      rowKey="id"
      extraButtons={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/new')}>
          新增产品
        </Button>
      }
    />
  );
};

export default ProductListPage;
