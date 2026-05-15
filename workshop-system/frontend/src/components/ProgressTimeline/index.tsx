import React from 'react';
import { Timeline, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { ProductionRecord } from '../../types/production';
import dayjs from 'dayjs';

interface ProgressTimelineProps {
  records: ProductionRecord[];
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ records }) => {
  if (!records || records.length === 0) {
    return <div style={{ color: '#999' }}>暂无流转记录</div>;
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.scanTime).getTime() - new Date(b.scanTime).getTime()
  );

  return (
    <Timeline>
      {sorted.map((record) => (
        <Timeline.Item key={record.id} color="green">
          <div>
            <strong>{record.stageName}</strong>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {record.operatorName || '系统'}
            </Tag>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(record.scanTime).format('YYYY-MM-DD HH:mm:ss')}
            </div>
            {record.qcResult !== undefined && record.qcResult !== null && (
              <div style={{ marginTop: 4 }}>
                质检结果：
                <Tag color={record.qcResult === 1 ? 'green' : record.qcResult === 2 ? 'orange' : 'red'}>
                  {record.qcResult === 1 ? '合格' : record.qcResult === 2 ? '待定' : '不合格'}
                </Tag>
                {record.qcRemark && <span style={{ fontSize: 12, color: '#666' }}> ({record.qcRemark})</span>}
              </div>
            )}
            {record.remark && (
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>备注：{record.remark}</div>
            )}
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default ProgressTimeline;
