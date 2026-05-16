import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Tabs, Table, Tag, Spin, Steps, Timeline, message } from 'antd';
import dayjs from 'dayjs';
import { getOrderDetail, deleteOrderFile } from '../../api/order';
import { getRecordsByOrder } from '../../api/record';
import { getStageList } from '../../api/stage';
import FileUploader from '../../components/FileUploader';
import type { Order, OrderItem, OrderFile } from '../../types/order';
import type { ProductionRecord, ProductionStage } from '../../types/production';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待确认', color: 'default' },
  1: { label: '生产中', color: '#4F46E5' },
  2: { label: '已完成', color: '#059669' },
  3: { label: '已取消', color: '#DC2626' },
};

const prodStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未开始', color: 'default' },
  1: { label: '生产中', color: '#4F46E5' },
  2: { label: '已完成', color: '#059669' },
  3: { label: '已暂停', color: '#D97706' },
};

interface OrderDetailModalProps {
  open: boolean;
  orderId: number;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ open, orderId, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) loadData();
  }, [open, orderId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [detailRes, recordsRes, stagesRes] = await Promise.all([
        getOrderDetail(orderId),
        getRecordsByOrder(orderId).catch(() => ({ data: [] })),
        getStageList().catch(() => ({ data: [] })),
      ]);
      const detail = detailRes.data;
      setOrder(detail.order);
      setItems(detail.items || []);
      setFiles(detail.files || []);
      setRecords(recordsRes.data);
      setStages((stagesRes.data || []).sort((a, b) => a.stageSeq - b.stageSeq));
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteOrderFile(orderId, fileId);
      message.success('删除成功');
      loadData();
    } catch {
      // handled
    }
  };

  const getStepItems = (recordStageIds: Set<number>, currentStageId?: number) => {
    return stages.map((stage) => {
      let status: 'wait' | 'process' | 'finish' = 'wait';
      if (recordStageIds.has(stage.id)) status = 'finish';
      else if (currentStageId === stage.id) status = 'process';
      return { title: stage.stageName, status };
    });
  };

  const groupedProgress = React.useMemo(() => {
    const groups: Record<number, { item: OrderItem; records: ProductionRecord[] }> = {};
    const unmatched: ProductionRecord[] = [];
    for (const rec of records) {
      const item = items.find((i) => i.id === rec.orderItemId);
      if (item) {
        if (!groups[item.id]) groups[item.id] = { item, records: [] };
        groups[item.id].records.push(rec);
      } else {
        unmatched.push(rec);
      }
    }
    return { groups, unmatchedRecords: unmatched };
  }, [records, items]);

  const renderProgress = (item: OrderItem, itemRecords: ProductionRecord[]) => {
    const completedStageIds = new Set(itemRecords.map((r) => r.stageId));
    const lastRecord = itemRecords.length > 0
      ? itemRecords.reduce((latest, r) =>
          new Date(r.scanTime).getTime() > new Date(latest.scanTime).getTime() ? r : latest
        , itemRecords[0])
      : null;
    const sorted = [...itemRecords].sort(
      (a, b) => new Date(a.scanTime).getTime() - new Date(b.scanTime).getTime()
    );

    return (
      <div key={item.id} style={{ marginBottom: 24, padding: 20, border: '1px solid #E2E8F0', borderRadius: 8, background: '#FAFBFC' }}>
        <h4 style={{ marginBottom: 12, color: '#0F172A', fontSize: 15 }}>
          {item.productName}（{item.productCode}）
          <Tag style={{ marginLeft: 8 }}
            color={item.productionStatus === 2 ? '#059669' : item.productionStatus === 1 ? '#4F46E5' : 'default'}>
            {prodStatusMap[item.productionStatus]?.label || '未知'}
          </Tag>
        </h4>
        <Steps size="small" items={getStepItems(completedStageIds, lastRecord?.stageId) as any} />
        <Timeline style={{ marginTop: 16 }}>
          {sorted.map((rec) => (
            <Timeline.Item key={rec.id} color="#059669">
              <strong style={{ color: '#0F172A' }}>{rec.stageName}</strong>
              <Tag color="#4F46E5" style={{ marginLeft: 8 }}>{rec.operatorName || '系统'}</Tag>
              <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
                {dayjs(rec.scanTime).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };

  if (!open) return null;

  return (
    <Modal
      title={order ? `订单详情 - ${order.orderNo}` : '订单详情'}
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      destroyOnClose
      styles={{ header: { borderBottom: '1px solid #F1F5F9', paddingBottom: 16 } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : !order ? null : (
        <>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}
            labelStyle={{ backgroundColor: '#F8FAFC', color: '#475569', borderColor: '#F1F5F9' }}
            contentStyle={{ color: '#0F172A', borderColor: '#F1F5F9' }}
          >
            <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[order.status]?.color}>{statusMap[order.status]?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="客户名称">{order.customerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系人">{order.customerContact || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{order.customerPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="客户地址">{order.customerAddress || '-'}</Descriptions.Item>
            <Descriptions.Item label="下单时间">
              {order.orderDate ? dayjs(order.orderDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="交货日期">
              {order.deliveryDate ? dayjs(order.deliveryDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="总金额" span={2}>
              <span style={{ color: '#4F46E5', fontWeight: 600 }}>¥{(order.totalAmount || 0).toFixed(2)}</span>
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {order.remark || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Tabs items={[
            {
              key: 'items',
              label: '产品明细',
              children: (
                <Table dataSource={items} columns={[
                  { title: '产品编号', dataIndex: 'productCode' },
                  { title: '产品名称', dataIndex: 'productName' },
                  { title: '规格', dataIndex: 'specification' },
                  { title: '数量', dataIndex: 'quantity' },
                  { title: '单价', render: (_: any, r: OrderItem) => `¥${r.unitPrice.toFixed(2)}` },
                  { title: '小计', render: (_: any, r: OrderItem) => `¥${r.subtotal.toFixed(2)}` },
                  { title: '生产状态', render: (_: any, r: OrderItem) =>
                    <Tag color={prodStatusMap[r.productionStatus]?.color}>{prodStatusMap[r.productionStatus]?.label}</Tag> },
                ]} rowKey="id" pagination={false} />
              ),
            },
            {
              key: 'files',
              label: '附件文件',
              children: (
                <>
                  <FileUploader orderId={orderId} onUploaded={loadData} />
                  <Table dataSource={files} columns={[
                    { title: '文件名', dataIndex: 'fileName' },
                    { title: '大小', render: (_: any, r: OrderFile) => `${(r.fileSize / 1024).toFixed(1)} KB` },
                    { title: '上传时间', render: (_: any, r: OrderFile) =>
                      r.createdAt ? dayjs(r.createdAt).format('YYYY-MM-DD HH:mm') : '-' },
                    { title: '操作', render: (_: any, r: OrderFile) =>
                      <a style={{ color: '#DC2626' }} onClick={() => {
                        Modal.confirm({
                          title: '确认删除',
                          content: '确定删除该文件吗？',
                          okText: '确定',
                          cancelText: '取消',
                          okButtonProps: { danger: true },
                          onOk: () => handleDeleteFile(r.id),
                        });
                      }}>删除</a> },
                  ]} rowKey="id" pagination={false} style={{ marginTop: 16 }} />
                </>
              ),
            },
            {
              key: 'progress',
              label: '生产进度',
              children: (
                <div style={{ padding: '8px 0' }}>
                  {Object.values(groupedProgress.groups).length > 0
                    ? Object.values(groupedProgress.groups).map((g) => renderProgress(g.item, g.records))
                    : <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>暂无生产记录</div>
                  }
                </div>
              ),
            },
          ]} />
        </>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
