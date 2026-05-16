import React, { useEffect, useState } from 'react';
import { Card, Select, Table, Steps, Timeline, Tag, Spin, Collapse } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { getOrderPage, getOrderItems } from '../../api/order';
import { getRecordsByOrder } from '../../api/record';
import { getStageList } from '../../api/stage';
import { getQrCodePage } from '../../api/qrcode';
import type { Order, OrderItem } from '../../types/order';
import type { ProductionStage, ProductionRecord, QrCode } from '../../types/production';
import dayjs from 'dayjs';

const qrStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待生产', color: 'default' },
  1: { label: '生产中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  3: { label: '已报废', color: 'error' },
};

const ProgressPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
    loadStages();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await getOrderPage({ page: 1, pageSize: 100, status: 1 });
      const list = res.data.records;
      setOrders(list);
      // 默认选中第一个订单，让"默认全部"真正生效
      if (list.length > 0) {
        handleOrderChange(list[0].id);
      }
    } catch {
      // handled
    }
  };

  const loadStages = async () => {
    try {
      const res = await getStageList();
      setStages(res.data.sort((a, b) => a.stageSeq - b.stageSeq));
    } catch {
      // handled
    }
  };

  const handleOrderChange = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setLoading(true);
    try {
      const [itemsRes, qrRes, recordsRes] = await Promise.all([
        getOrderItems(orderId),
        getQrCodePage({ page: 1, pageSize: 500, orderId }),
        getRecordsByOrder(orderId),
      ]);
      const items = itemsRes.data;
      const qrCodes = qrRes.data.records;
      const allRecords = recordsRes.data;

      const data = items.map((item) => {
        const itemQrCodes = qrCodes.filter((q) => q.orderItemId === item.id);

        // Per-QR-code breakdown
        const qrWithRecords = itemQrCodes.map((qr) => {
          const qrRecords = allRecords.filter((r) => r.qrCodeId === qr.id);
          const completedStageIds = new Set(qrRecords.map((r) => r.stageId));
          const lastRecord = qrRecords.length > 0
            ? qrRecords.reduce((latest, r) =>
                new Date(r.scanTime).getTime() > new Date(latest.scanTime).getTime() ? r : latest
              )
            : null;
          return { ...qr, records: qrRecords, completedStageIds, lastRecord };
        });

        // Overall item progress (union across all QR codes)
        const allItemRecords = qrWithRecords.flatMap((qr) => qr.records);
        const completedStageIds = new Set(allItemRecords.map((r) => r.stageId));
        const lastRecord = allItemRecords.length > 0
          ? allItemRecords.reduce((latest, r) =>
              new Date(r.scanTime).getTime() > new Date(latest.scanTime).getTime() ? r : latest
            )
          : null;

        return {
          ...item,
          qrCodes: qrWithRecords,
          records: allItemRecords,
          completedStageIds,
          lastRecord,
        };
      });

      setProgressData(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const getStepItems = (completedStageIds: Set<number>, currentStageId?: number) => {
    return stages.map((stage) => {
      let status: 'wait' | 'process' | 'finish' = 'wait';
      if (completedStageIds.has(stage.id)) {
        status = 'finish';
      } else if (currentStageId === stage.id) {
        status = 'process';
      }
      return {
        title: stage.stageName,
        status,
      };
    });
  };

  return (
    <Card title="生产进度追踪">
      <div style={{ marginBottom: 16 }}>
        <Select
          showSearch
          placeholder="选择订单查看生产进度（默认全部）"
          allowClear
          style={{ width: 400 }}
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
          options={orders.map((o) => ({ label: `${o.orderNo} - ${o.customerName}`, value: o.id }))}
          onChange={handleOrderChange}
          value={selectedOrderId}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : progressData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          {selectedOrderId ? '暂无生产进度数据' : '请选择一个订单查看进度'}
        </div>
      ) : (
        <Table
          dataSource={progressData}
          rowKey="id"
          pagination={false}
          columns={[
            { title: '产品编号', dataIndex: 'productCode', key: 'productCode', width: 120 },
            { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 150 },
            {
              title: '总体进度',
              key: 'progress',
              render: (_: any, record: any) => (
                <Steps
                  size="small"
                  items={getStepItems(record.completedStageIds, record.lastRecord?.stageId) as any}
                  style={{ minWidth: 400 }}
                />
              ),
            },
            {
              title: '二维码',
              key: 'qrCount',
              width: 80,
              render: (_: any, record: any) => record.qrCodes.length,
            },
          ]}
          expandable={{
            expandedRowRender: (record: any) => (
              <div style={{ padding: '8px 0' }}>
                {record.qrCodes.length > 0 ? (
                  record.qrCodes.map((qr: any) => {
                    const qrStatus = qrStatusMap[qr.status] || { label: '未知', color: 'default' };
                    return (
                      <div
                        key={qr.id}
                        style={{
                          marginBottom: 16,
                          padding: 16,
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                          backgroundColor: '#fafafa',
                        }}
                      >
                        {/* QR code header */}
                        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color="cyan" style={{ fontSize: 13, padding: '2px 10px' }}>
                            序列号 #{qr.serialNo}
                          </Tag>
                          <Tag color={qrStatus.color}>{qrStatus.label}</Tag>
                          {qr.lastRecord && (
                            <span style={{ fontSize: 12, color: '#999' }}>
                              最近：{dayjs(qr.lastRecord.scanTime).format('MM-DD HH:mm')}
                            </span>
                          )}
                        </div>

                        {/* Steps per QR code */}
                        <Steps
                          size="small"
                          items={getStepItems(qr.completedStageIds, qr.lastRecord?.stageId) as any}
                          style={{ minWidth: 400 }}
                        />

                        {/* Timeline (collapsible) */}
                        {qr.records.length > 0 ? (
                          <Collapse
                            ghost
                            size="small"
                            style={{ marginTop: 12 }}
                            items={[
                              {
                                key: 'timeline',
                                label: `操作记录（${qr.records.length} 条）`,
                                children: (
                                  <Timeline>
                                    {[...qr.records]
                                      .sort(
                                        (a: ProductionRecord, b: ProductionRecord) =>
                                          new Date(a.scanTime).getTime() - new Date(b.scanTime).getTime()
                                      )
                                      .map((rec: ProductionRecord) => (
                                        <Timeline.Item key={rec.id} color="green">
                                          <div>
                                            <strong>{rec.stageName}</strong>
                                            <Tag color="blue" style={{ marginLeft: 8 }}>
                                              {rec.operatorName || '系统'}
                                            </Tag>
                                            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                                              {dayjs(rec.scanTime).format('YYYY-MM-DD HH:mm:ss')}
                                            </div>
                                            <div style={{ marginTop: 4 }}>
                                              质检：
                                              {rec.qcResult === 0 ? (
                                                <Tag color="default">未质检</Tag>
                                              ) : (
                                                <Tag color={rec.qcResult === 1 ? 'green' : 'red'}>
                                                  {rec.qcResult === 1 ? '合格' : '不合格'}
                                                </Tag>
                                              )}
                                            </div>
                                          </div>
                                        </Timeline.Item>
                                      ))}
                                  </Timeline>
                                ),
                              },
                            ]}
                          />
                        ) : (
                          <div style={{ color: '#999', fontSize: 12, marginTop: 12 }}>暂无操作记录</div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span style={{ color: '#999' }}>暂未生成二维码</span>
                )}
              </div>
            ),
          }}
        />
      )}
    </Card>
  );
};

export default ProgressPage;
