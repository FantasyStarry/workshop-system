import request from './request';
import type { ApiResult } from '../types/api';
import type { PositionItem } from '../types/position';

export function getPositionList(deptId?: number): Promise<ApiResult<PositionItem[]>> {
  const params: any = {};
  if (deptId) params.deptId = deptId;
  return request.get('/positions/list', { params }).then((res) => res.data);
}

export function createPosition(data: Partial<PositionItem>): Promise<ApiResult<PositionItem>> {
  return request.post('/positions', data).then((res) => res.data);
}

export function updatePosition(data: Partial<PositionItem>): Promise<ApiResult<PositionItem>> {
  return request.put(`/positions/${data.id}`, data).then((res) => res.data);
}

export function deletePosition(id: number): Promise<ApiResult<null>> {
  return request.delete(`/positions/${id}`).then((res) => res.data);
}
