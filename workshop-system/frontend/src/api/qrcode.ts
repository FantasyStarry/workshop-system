import request from './request';
import type { ApiResult, PageResult } from '../types/api';
import type { QrCode } from '../types/production';

export interface QrCodeDetail {
  id: number;
  qrContent: string;
  orderItemId: number;
  serialNo: string;
  status: number;
  statusText: string;
  productName: string;
  productCode: string;
  currentStageName: string;
  currentStageSeq: number;
  totalStages: number;
  completedStages: number;
  progressPercent: number;
  lastOperator: string;
  lastOperatorName: string;
  lastScanTime: string;
  lastLocation: string;
  generatedAt: string;
  generatedByName: string;
}

export function generateQrCodes(data: {
  orderId: number;
  orderItemId: number;
  quantity: number;
}): Promise<ApiResult<QrCode[]>> {
  return request.post('/qrcode/generate', data).then((res) => res.data);
}

export function getQrCodePage(params: {
  page: number;
  pageSize: number;
  orderId?: number;
  productId?: number;
  status?: number;
}): Promise<ApiResult<PageResult<QrCode>>> {
  return request.get('/qrcode/page', { params }).then((res) => res.data);
}

export function getQrCodeDetail(qrCodeId: number): Promise<ApiResult<QrCode>> {
  return request.get(`/qrcode/${qrCodeId}`).then((res) => res.data);
}

export function decodeQrCode(qrContent: string): Promise<ApiResult<QrCode>> {
  return request.post('/qrcode/decode', { qrContent }).then((res) => res.data);
}

export function getQrCodeDetailList(orderId: number): Promise<ApiResult<QrCodeDetail[]>> {
  return request.get('/qrcode/detail/list', { params: { orderId } }).then((res) => res.data);
}
