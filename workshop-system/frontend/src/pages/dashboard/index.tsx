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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
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
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      title: '在产订单数',
      value: data.activeOrderCount,
      icon: <FileTextOutlined />,
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      title: '月完成产品数',
      value: data.monthCompleteCount,
      icon: <CheckCircleOutlined />,
      color: '#D97706',
      bg: '#FFFBEB',
    },
    {
      title: '在制品数',
      value: data.inProductionCount,
      icon: <ToolOutlined />,
      color: '#DC2626',
      bg: '#FEF2F2',
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
      <Title level={4} style={{ marginBottom: 24, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px' }}>
        概览
      </Title>

      <Row gutter={[20, 20]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              style={styles.statCard}
              styles={{ body: { padding: '22px 24px' } }}
            >
              <div style={styles.statContent}>
                <div>
                  <Statistic
                    title={<span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{card.title}</span>}
                    value={card.value}
                    valueStyle={{ fontSize: 30, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.5px' }}
                  />
                </div>
                <div style={{
                  ...styles.statIcon,
                  backgroundColor: card.bg,
                  color: card.color,
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card title="各环节分布" styles={{ body: { padding: 0 } }}>
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
          <Card title="近 7 天扫码趋势" styles={{ body: { padding: 0 } }}>
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

const styles: Record<string, React.CSSProperties> = {
  statCard: {
    borderRadius: 14,
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 200ms, border-color 200ms',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },
};

export default DashboardPage;
