import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin } from 'antd';
import {
  ScanOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { getDashboardOverview } from '../../api/dashboard';
import type { DashboardOverview } from '../../api/dashboard';

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
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  const stageColumns = [
    { title: '环节名称', dataIndex: 'stageName', key: 'stageName' },
    { title: '在制品数量', dataIndex: 'count', key: 'count' },
  ];

  const trendColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '扫码次数', dataIndex: 'count', key: 'count' },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日扫码次数"
              value={data.todayScanCount}
              prefix={<ScanOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在产订单数"
              value={data.activeOrderCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="月完成产品数"
              value={data.monthCompleteCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在制品数"
              value={data.inProductionCount}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="各环节分布">
            <Table
              dataSource={data.stageDistribution}
              columns={stageColumns}
              rowKey="stageName"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="近7天扫码趋势">
            <Table
              dataSource={data.last7DaysTrend}
              columns={trendColumns}
              rowKey="date"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
