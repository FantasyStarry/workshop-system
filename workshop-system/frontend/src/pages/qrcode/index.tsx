import React, { useEffect, useState, useCallback } from 'react';
import { Card, Form, Select, InputNumber, Button, Table, Tag, Modal, message, Space, Row, Col } from 'antd';
import { QrcodeOutlined, EyeOutlined } from '@ant-design/icons';
import { generateQrCodes, getQrCodePage } from '../../api/qrcode';
import { getOrderPage, getOrderItems } from '../../api/order';
import QrCodeImage from '../../components/QrCodeImage';
import type { QrCode } from '../../types/production';
import type { Order, OrderItem } from '../../types/order';
import dayjs from 'dayjs';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未开始', color: 'default' },
  1: { label: '生产中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  3: { label: '已作废', color: 'error' },
};

const QrCodePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [qrcodeLoading, setQrCodeLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedQrCodeId, setSelectedQrCodeId] = useState<number>(0);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await getOrderPage({ page: 1, pageSize: 100, status: 1 });
      setOrders(res.data.records);
    } catch {
      // handled
    }
  };

  const handleOrderChange = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setSelectedItemId(undefined);
    try {
      const res = await getOrderItems(orderId);
      setOrderItems(res.data);
    } catch {
      setOrderItems([]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedOrderId || !selectedItemId) {
      message.warning('请选择订单和产品');
      return;
    }
    setGenerating(true);
    try {
      await generateQrCodes({ orderId: selectedOrderId, orderItemId: selectedItemId, quantity });
      message.success('二维码生成成功');
      loadQrCodes();
    } catch {
      // handled
    } finally {
      setGenerating(false);
    }
  };

  const loadQrCodes = useCallback(async () => {
    setQrCodeLoading(true);
    try {
      const res = await getQrCodePage({ page: 1, pageSize: 100, orderId: selectedOrderId });
      setQrCodes(res.data.records);
    } catch {
      // handled
    } finally {
      setQrCodeLoading(false);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    if (selectedOrderId) {
      loadQrCodes();
    }
  }, [selectedOrderId, loadQrCodes]);

  const columns = [
    { title: '编码内容', dataIndex: 'qrContent', key: 'qrContent', width: 200, ellipsis: true },
    { title: '关联产品', dataIndex: 'productName', key: 'productName', width: 140 },
    {
      title: '当前环节',
      dataIndex: 'currentStageName',
      key: 'currentStageName',
      width: 120,
      render: (v: string) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: number) => {
        const s = statusMap[v] || { label: '未知', color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '生成时间',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      width: 180,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: QrCode) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedQrCodeId(record.id);
            setImageModalOpen(true);
          }}
        >
          查看图片
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="生成二维码" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Form.Item label="选择订单" style={{ marginBottom: 0 }}>
              <Select
                showSearch
                placeholder="请选择订单"
                style={{ width: 240 }}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={orders.map((o) => ({ label: `${o.orderNo} - ${o.customerName}`, value: o.id }))}
                onChange={handleOrderChange}
                value={selectedOrderId}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="选择产品" style={{ marginBottom: 0 }}>
              <Select
                placeholder="请选择产品"
                style={{ width: 240 }}
                options={orderItems.map((i) => ({
                  label: `${i.productCode} - ${i.productName}`,
                  value: i.id,
                }))}
                onChange={setSelectedItemId}
                value={selectedItemId}
                disabled={!selectedOrderId}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="生成数量" style={{ marginBottom: 0 }}>
              <InputNumber
                min={1}
                max={1000}
                value={quantity}
                onChange={(v) => setQuantity(v || 1)}
                style={{ width: 120 }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={handleGenerate}
              loading={generating}
              disabled={!selectedOrderId || !selectedItemId}
            >
              生成二维码
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="二维码列表">
        <Table
          dataSource={qrCodes}
          columns={columns}
          rowKey="id"
          loading={qrcodeLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Modal
        title="二维码图片"
        open={imageModalOpen}
        onCancel={() => setImageModalOpen(false)}
        footer={null}
        width={400}
      >
        <div style={{ textAlign: 'center' }}>
          {selectedQrCodeId > 0 && <QrCodeImage qrCodeId={selectedQrCodeId} size={300} />}
        </div>
      </Modal>
    </div>
  );
};

export default QrCodePage;
