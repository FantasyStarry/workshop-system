import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tabs, Table, Tag, message, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getOrderDetail, deleteOrderFile } from '../../api/order';
import { getRecordsByOrder } from '../../api/record';
import FileUploader from '../../components/FileUploader';
import ImagePreview from '../../components/ImagePreview';
import type { Order, OrderItem, OrderFile } from '../../types/order';
import type { ProductionRecord } from '../../types/production';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待确认', color: 'default' },
  1: { label: '生产中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  3: { label: '已取消', color: 'error' },
};

const prodStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未开始', color: 'default' },
  1: { label: '生产中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  3: { label: '已暂停', color: 'warning' },
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [detailRes, recordsRes] = await Promise.all([
        getOrderDetail(Number(id)),
        getRecordsByOrder(Number(id)).catch(() => ({ data: [] })),
      ]);
      const detail = detailRes.data;
      setOrder(detail.order);
      setItems(detail.items || []);
      setFiles(detail.files || []);
      setRecords(recordsRes.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = () => {
    loadData();
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteOrderFile(Number(id), fileId);
      message.success('删除成功');
      loadData();
    } catch {
      // handled
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) return null;

  const s = statusMap[order.status] || { label: '未知', color: 'default' };

  const itemColumns = [
    { title: '产品编号', dataIndex: 'productCode', key: 'productCode' },
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '规格', dataIndex: 'specification', key: 'specification' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '小计', dataIndex: 'subtotal', key: 'subtotal', render: (v: number) => `¥${v.toFixed(2)}` },
    {
      title: '生产状态',
      dataIndex: 'productionStatus',
      key: 'productionStatus',
      render: (v: number) => {
        const ps = prodStatusMap[v] || { label: '未知', color: 'default' };
        return <Tag color={ps.color}>{ps.label}</Tag>;
      },
    },
  ];

  const fileColumns = [
    { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
    { title: '大小', dataIndex: 'fileSize', key: 'fileSize', render: (v: number) => `${(v / 1024).toFixed(1)} KB` },
    { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: OrderFile) => (
        <a
          onClick={() => {
            if (window.confirm('确定删除该文件吗？')) handleDeleteFile(record.id);
          }}
        >
          删除
        </a>
      ),
    },
  ];

  const imageFileUrls = files.filter((f) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.fileName)).map((f) => f.filePath);

  const tabItems = [
    {
      key: 'items',
      label: '产品明细',
      children: <Table dataSource={items} columns={itemColumns} rowKey="id" pagination={false} />,
    },
    {
      key: 'files',
      label: '附件文件',
      children: (
        <div>
          <FileUploader orderId={Number(id)} onUploaded={handleFileUploaded} />
          <div style={{ marginTop: 24 }}>
            <h4>已上传文件：</h4>
            <Table dataSource={files} columns={fileColumns} rowKey="id" pagination={false} style={{ marginTop: 12 }} />
          </div>
          {imageFileUrls.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4>图片预览：</h4>
              <ImagePreview images={imageFileUrls} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'progress',
      label: '生产进度',
      children: (
        <div>
          {records.length > 0 ? (
            <Table
              dataSource={records}
              rowKey="id"
              pagination={false}
              columns={[
                { title: '产品', dataIndex: 'productName', key: 'productName', render: (v: string, record: ProductionRecord) => `${v || '-'} (${record.productCode || '-'})` },
                { title: '环节', dataIndex: 'stageName', key: 'stageName' },
                { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', render: (v: string) => v || '-' },
                { title: '扫码时间', dataIndex: 'scanTime', key: 'scanTime', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-' },
                {
                  title: '质检结果',
                  dataIndex: 'qcResult',
                  key: 'qcResult',
                  render: (v: number | null) => {
                    if (v == null) return <Tag color="default">未质检</Tag>;
                    return <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '合格' : '不合格'}</Tag>;
                  },
                },
              ]}
            />
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: 40 }}>暂无生产记录</div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Descriptions title="订单基本信息" column={2} bordered>
        <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={s.color}>{s.label}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="客户名称">{order.customerName}</Descriptions.Item>
        <Descriptions.Item label="联系人">{order.customerContact || '-'}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{order.customerPhone || '-'}</Descriptions.Item>
        <Descriptions.Item label="客户地址">{order.customerAddress || '-'}</Descriptions.Item>
        <Descriptions.Item label="下单日期">{order.orderDate ? dayjs(order.orderDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
        <Descriptions.Item label="交付日期">{order.deliveryDate ? dayjs(order.deliveryDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
        <Descriptions.Item label="订单金额">¥{order.totalAmount?.toFixed(2) || '0.00'}</Descriptions.Item>
        <Descriptions.Item label="备注">{order.remark || '-'}</Descriptions.Item>
      </Descriptions>
      <Tabs items={tabItems} defaultActiveKey="items" style={{ marginTop: 24 }} />
    </Card>
  );
};

export default OrderDetailPage;
