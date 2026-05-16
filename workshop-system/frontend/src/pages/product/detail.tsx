import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Spin, Tag } from 'antd';
import { useParams } from 'react-router-dom';
import { getProductDetail } from '../../api/product';
import { getOrderPage } from '../../api/order';
import type { Product } from '../../types/product';
import type { Order } from '../../types/order';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        getProductDetail(Number(id)),
        getOrderPage({ page: 1, pageSize: 50 }).catch(() => ({ data: { records: [], total: 0, page: 1, pageSize: 10 } })),
      ]);
      setProduct(prodRes.data);
      setOrders(orderRes.data.records);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <Card style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <Descriptions title={<span style={{ color: '#0F172A', fontSize: 18, fontWeight: 600 }}>产品详细信息</span>} column={2} bordered labelStyle={{ color: '#475569', background: '#F8FAFC' }} contentStyle={{ color: '#0F172A' }}>
        <Descriptions.Item label="产品编号">{product.productCode}</Descriptions.Item>
        <Descriptions.Item label="产品名称">{product.productName}</Descriptions.Item>
        <Descriptions.Item label="产品类型">{product.productType}</Descriptions.Item>
        <Descriptions.Item label="规格">{product.specification || '-'}</Descriptions.Item>
        <Descriptions.Item label="梁体长(m)">{product.beamLength || '-'}</Descriptions.Item>
        <Descriptions.Item label="梁体宽(m)">{product.beamWidth || '-'}</Descriptions.Item>
        <Descriptions.Item label="梁体高(m)">{product.beamHeight || '-'}</Descriptions.Item>
        <Descriptions.Item label="混凝土等级">{product.concreteGrade || '-'}</Descriptions.Item>
        <Descriptions.Item label="钢筋规格">{product.steelSpec || '-'}</Descriptions.Item>
        <Descriptions.Item label="预应力规格">{product.prestressSpec || '-'}</Descriptions.Item>
        <Descriptions.Item label="单位重量(kg)">{product.unitWeight || '-'}</Descriptions.Item>
        <Descriptions.Item label="批次号">{product.batchNo || '-'}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={product.status === 1 ? '#059669' : 'default'}>{product.status === 1 ? '启用' : '禁用'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="技术参数" span={2}>
          {product.technicalParams || '-'}
        </Descriptions.Item>
      </Descriptions>
      {orders.length > 0 && (
        <Card title={<span style={{ color: '#0F172A', fontWeight: 600 }}>关联订单</span>} style={{ marginTop: 24, background: '#ffffff', borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <Table
            dataSource={orders}
            rowKey="id"
            columns={[
              { title: '订单号', dataIndex: 'orderNo' },
              { title: '客户', dataIndex: 'customerName' },
              { title: '状态', dataIndex: 'status', render: (v: number) => <Tag color={v === 1 ? '#4F46E5' : v === 2 ? '#059669' : '#D97706'}>{v === 1 ? '生产中' : v === 2 ? '已完成' : '其他'}</Tag> },
            ]}
            pagination={false}
          />
        </Card>
      )}
    </Card>
  );
};

export default ProductDetailPage;
