import React from 'react';
import { Steps } from 'antd';
import type { ProductionStage } from '../../types/production';

interface StageFlowChartProps {
  stages: ProductionStage[];
  currentStageId?: number;
}

const StageFlowChart: React.FC<StageFlowChartProps> = ({ stages, currentStageId }) => {
  const sorted = [...stages].sort((a, b) => a.stageSeq - b.stageSeq);
  const currentIndex = sorted.findIndex((s) => s.id === currentStageId);

  const items = sorted.map((stage, index) => {
    let status: 'wait' | 'process' | 'finish' | 'error' = 'wait';
    if (currentIndex >= 0) {
      if (index < currentIndex) status = 'finish';
      else if (index === currentIndex) status = 'process';
    }
    return {
      title: stage.stageName,
      description: stage.needQc === 1 ? '需质检' : undefined,
      status,
    };
  });

  return <Steps current={currentIndex >= 0 ? currentIndex : -1} items={items as any} />;
};

export default StageFlowChart;
