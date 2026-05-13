import request from './request';
import type { ApiResult } from '../types/api';
import type { ProductionStage } from '../types/production';

export function getStageList(): Promise<ApiResult<ProductionStage[]>> {
  return request.get('/stages/list').then((res) => res.data);
}

export function createStage(data: Partial<ProductionStage>): Promise<ApiResult<ProductionStage>> {
  return request.post('/stages', data).then((res) => res.data);
}

export function updateStage(data: Partial<ProductionStage>): Promise<ApiResult<ProductionStage>> {
  return request.put(`/stages/${data.id}`, data).then((res) => res.data);
}

export function deleteStage(id: number): Promise<ApiResult<null>> {
  return request.delete(`/stages/${id}`).then((res) => res.data);
}

// Stage-Position bindings
export function getStagePositions(stageId: number): Promise<ApiResult<number[]>> {
  return request.get(`/stages/${stageId}/positions`).then((res) => res.data);
}

export function updateStagePositions(stageId: number, positionIds: number[]): Promise<ApiResult<null>> {
  return request.put(`/stages/${stageId}/positions`, { positionIds }).then((res) => res.data);
}
