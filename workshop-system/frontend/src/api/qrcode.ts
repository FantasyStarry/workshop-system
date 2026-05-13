import request from './request';
import type { ApiResult, PageResult } from '../types/api';
import type { QrCode } from '../types/production';

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
