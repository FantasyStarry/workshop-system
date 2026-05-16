import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Typography } from 'antd';
import {
  ScanOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { getDashboardOverview } from '../../api/dashboard';
import type { DashboardOverview } from '../../api/dashboard';

const { Title } = Typography;

const statCardStyle = {
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  height: '100%',
};

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDashboardOverview();
        setData(res.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: '今日扫码次数',
      value: data.todayScanCount,
      icon: <ScanOutlined />,
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      title: '在产订单数',
      value: data.activeOrderCount,
      icon: <FileTextOutlined />,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      title: '月完成产品数',
      value: data.monthCompleteCount,
      icon: <CheckCircleOutlined />,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      title: '在制品数',
      value: data.inProductionCount,
      icon: <ToolOutlined />,
      color: '#ef4444',
      bg: '#fef2f2',
    },
  ];

  const stageColumns = [
    { title: '环节名称', dataIndex: 'stageName', key: 'stageName' },
    { title: '在制品数量', dataIndex: 'count', key: 'count' },
  ];

  const trendColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '扫码次数', dataIndex: 'scanCount', key: 'scanCount' },
    { title: '完成数', dataIndex: 'completeCount', key: 'completeCount' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20, fontWeight: 600, color: '#1f2937' }}>
        概览
      </Title>

      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              style={{
                ...statCardStyle,
                borderLeft: `3px solid ${card.color}`,
              }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Statistic
                  title={<span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{card.title}</span>}
                  value={card.value}
                  valueStyle={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}
                />
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card title="各环节分布" bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={data.stageDistribution}
              columns={stageColumns}
              rowKey="stageName"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="近 7 天扫码趋势" bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={data.last7DaysTrend}
              columns={trendColumns}
              rowKey="date"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
