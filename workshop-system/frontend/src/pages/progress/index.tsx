import React, { useEffect, useState } from 'react';
import { Card, Select, Table, Steps, Timeline, Tag, Spin } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { getOrderPage, getOrderItems } from '../../api/order';
import { getRecordsByOrder, getRecordsByQrCode } from '../../api/record';
import { getStageList } from '../../api/stage';
import { getQrCodePage } from '../../api/qrcode';
import type { Order, OrderItem } from '../../types/order';
import type { ProductionStage, ProductionRecord, QrCode } from '../../types/production';
import dayjs from 'dayjs';

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
      setOrders(res.data.records);
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
        const itemQrCodes = qrCodes.filter((q) => q.productId === item.productId);
        const itemRecords = allRecords.filter((r) =>
          itemQrCodes.some((q) => q.id === r.qrCodeId)
        );
        const completedStageIds = new Set(itemRecords.map((r) => r.stageId));
        const lastRecord = itemRecords.length > 0
          ? itemRecords.reduce((latest, r) =>
              new Date(r.scanTime).getTime() > new Date(latest.scanTime).getTime() ? r : latest
            )
          : null;

        return {
          ...item,
          qrCodes: itemQrCodes,
          records: itemRecords,
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
              title: '生产环节进度',
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
              title: '二维码数量',
              key: 'qrCount',
              width: 100,
              render: (_: any, record: any) => record.qrCodes.length,
            },
          ]}
          expandable={{
            expandedRowRender: (record: any) => (
              <div style={{ padding: '8px 0' }}>
                {record.records.length > 0 ? (
                  <Timeline>
                    {record.records
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
                            {rec.qcResult != null && (
                              <div style={{ marginTop: 4 }}>
                                质检：
                                <Tag color={rec.qcResult === 1 ? 'green' : 'red'}>
                                  {rec.qcResult === 1 ? '合格' : '不合格'}
                                </Tag>
                              </div>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                  </Timeline>
                ) : (
                  <span style={{ color: '#999' }}>暂无流转记录</span>
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
