import request from './request';
import type { ApiResult } from '../types/api';

export interface DashboardOverview {
  todayScanCount: number;
  activeOrderCount: number;
  monthCompleteCount: number;
  inProductionCount: number;
  stageDistribution: { stageName: string; count: number }[];
  last7DaysTrend: { date: string; count: number }[];
}

export function getDashboardOverview(): Promise<ApiResult<DashboardOverview>> {
  return request.get('/dashboard/overview').then((res) => res.data);
}
