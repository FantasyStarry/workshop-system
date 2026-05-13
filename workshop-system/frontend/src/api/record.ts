import request from './request';
import type { ApiResult, PageResult } from '../types/api';
import type { ProductionRecord, ScanReport, QcSubmit } from '../types/production';

export function scanReport(data: ScanReport): Promise<ApiResult<ProductionRecord>> {
  return request.post('/records/scan', data).then((res) => res.data);
}

export function getRecordPage(params: {
  page: number;
  pageSize: number;
  orderId?: number;
  qrCodeId?: number;
  stageId?: number;
}): Promise<ApiResult<PageResult<ProductionRecord>>> {
  return request.get('/records/page', { params }).then((res) => res.data);
}

export function getRecordsByQrCode(qrCodeId: number): Promise<ApiResult<ProductionRecord[]>> {
  return request.get(`/records/by-qrcode/${qrCodeId}`).then((res) => res.data);
}

export function getRecordsByOrder(orderId: number): Promise<ApiResult<ProductionRecord[]>> {
  return request.get(`/records/by-order/${orderId}`).then((res) => res.data);
}

export function submitQcResult(data: QcSubmit): Promise<ApiResult<null>> {
  return request.put(`/records/${data.recordId}/qc`, data).then((res) => res.data);
}
