import React, { useEffect, useState, useCallback } from 'react';
import { Card, Form, Select, InputNumber, Button, Table, Tag, Modal, message, Space, Row, Col } from 'antd';
import { QrcodeOutlined, EyeOutlined } from '@ant-design/icons';
import { generateQrCodes, getQrCodeDetailList } from '../../api/qrcode';
import { getOrderPage, getOrderItems } from '../../api/order';
import QrCodeImage from '../../components/QrCodeImage';
import type { QrCode } from '../../types/production';
import type { Order, OrderItem } from '../../types/order';
import dayjs from 'dayjs';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待生产', color: 'default' },
  1: { label: '生产中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  3: { label: '已作废', color: 'error' },
};

interface QrCodeDetail {
  id: number;
  qrContent: string;
  serialNo: string;
  status: number;
  statusText: string;
  productName: string;
  productCode: string;
  currentStageName: string;
  currentStageSeq: number;
  totalStages: number;
  completedStages: number;
  progressPercent: number;
  lastOperator: string;
  lastOperatorName: string;
  lastScanTime: string;
  lastLocation: string;
  generatedAt: string;
  generatedByName: string;
}

const QrCodePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
  const [generating, setGenerating] = useState(false);
  const [qrCodes, setQrCodes] = useState<QrCodeDetail[]>([]);
  const [qrcodeLoading, setQrCodeLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedQrCodeId, setSelectedQrCodeId] = useState<number>(0);
  const [generatedItemIds, setGeneratedItemIds] = useState<Set<number>>(new Set());

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
      await generateQrCodes({ orderId: selectedOrderId, orderItemId: selectedItemId, quantity: 1 });
      message.success('二维码生成成功');
      loadQrCodes();
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  const loadQrCodes = useCallback(async () => {
    setQrCodeLoading(true);
    try {
      const res = await getQrCodeDetailList(selectedOrderId!);
      setQrCodes(res.data);
      const itemIds = new Set(res.data.map((qr) => qr.orderItemId));
      setGeneratedItemIds(itemIds);
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
    { 
      title: '序列号', 
      dataIndex: 'serialNo', 
      key: 'serialNo', 
      width: 80 
    },
    { 
      title: '产品', 
      dataIndex: 'productName', 
      key: 'productName', 
      width: 140,
      render: (v: string, record: QrCodeDetail) => (
        <div>
          <div>{v}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.productCode}</div>
        </div>
      ),
    },
    {
      title: '当前环节',
      dataIndex: 'currentStageName',
      key: 'currentStageName',
      width: 120,
      render: (v: string, record: QrCodeDetail) => (
        <div>
          <div>{v || '-'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.currentStageSeq}/{record.totalStages}
          </div>
        </div>
      ),
    },
    {
      title: '生产进度',
      key: 'progress',
      width: 150,
      render: (_: any, record: QrCodeDetail) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: record.status === 2 ? '#52c41a' : '#1890ff',
                  width: `${record.progressPercent || 0}%`,
                  transition: 'width 0.3s'
                }} 
              />
            </div>
            <span style={{ fontSize: 12, color: '#666' }}>{record.progressPercent || 0}%</span>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'statusText',
      width: 90,
      render: (v: string, record: QrCodeDetail) => {
        const s = statusMap[record.status] || { label: '未知', color: 'default' };
        return <Tag color={s.color}>{v || s.label}</Tag>;
      },
    },
    {
      title: '最后操作',
      key: 'lastOperator',
      width: 150,
      render: (_: any, record: QrCodeDetail) => (
        <div>
          <div>{record.lastOperatorName || record.lastOperator || '-'}</div>
          {record.lastScanTime && (
            <div style={{ fontSize: 12, color: '#999' }}>
              {dayjs(record.lastScanTime).format('MM-DD HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      width: 160,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: QrCodeDetail) => (
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

  const selectedItem = orderItems.find((i) => i.id === selectedItemId);
  const selectedQuantity = selectedItem?.quantity || 0;

  return (
    <div>
      <Card title="生成二维码" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Form.Item label="选择订单" style={{ marginBottom: 0 }}>
              <Select
                showSearch
                placeholder="请选择订单"
                style={{ width: 360 }}
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
                style={{ width: 340 }}
                options={orderItems.map((i) => ({
                  label: `${i.productCode} - ${i.productName} (×${i.quantity})${generatedItemIds.has(i.id) ? ' (已生成)' : ''}`,
                  value: i.id,
                  disabled: generatedItemIds.has(i.id),
                }))}
                onChange={setSelectedItemId}
                value={selectedItemId}
                disabled={!selectedOrderId}
              />
            </Form.Item>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={handleGenerate}
              loading={generating}
              disabled={!selectedOrderId || !selectedItemId || generatedItemIds.has(selectedItemId || 0)}
            >
              {selectedQuantity > 0 ? `生成二维码（×${selectedQuantity}张）` : '生成二维码'}
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
