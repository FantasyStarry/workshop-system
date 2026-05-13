import request from './request';
import type { ApiResult, PageResult } from '../types/api';
import type { Order, OrderItem, OrderFile } from '../types/order';

export function getOrderPage(params: {
  page: number;
  pageSize: number;
  orderNo?: string;
  customerName?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResult<PageResult<Order>>> {
  return request.get('/orders/page', { params }).then((res) => res.data);
}

export function getOrderDetail(id: number): Promise<ApiResult<Order>> {
  return request.get(`/orders/${id}`).then((res) => res.data);
}

export function createOrder(data: Partial<Order>): Promise<ApiResult<Order>> {
  return request.post('/orders', data).then((res) => res.data);
}

export function updateOrder(data: Partial<Order>): Promise<ApiResult<Order>> {
  return request.put(`/orders/${data.id}`, data).then((res) => res.data);
}

export function updateOrderStatus(id: number, status: number): Promise<ApiResult<null>> {
  return request.put(`/orders/${id}/status?status=${status}`).then((res) => res.data);
}

export function deleteOrder(id: number): Promise<ApiResult<null>> {
  return request.delete(`/orders/${id}`).then((res) => res.data);
}

export function getOrderItems(orderId: number): Promise<ApiResult<OrderItem[]>> {
  return request.get(`/orders/${orderId}/items`).then((res) => res.data);
}

export function addOrderItem(data: Partial<OrderItem>): Promise<ApiResult<OrderItem>> {
  return request.post(`/orders/${data.orderId}/items`, data).then((res) => res.data);
}

export function updateOrderItem(data: Partial<OrderItem>): Promise<ApiResult<OrderItem>> {
  return request.put(`/orders/${data.orderId}/items/${data.id}`, data).then((res) => res.data);
}

export function deleteOrderItem(orderId: number, itemId: number): Promise<ApiResult<null>> {
  return request.delete(`/orders/${orderId}/items/${itemId}`).then((res) => res.data);
}

export function uploadOrderFiles(
  orderId: number,
  files: File[]
): Promise<ApiResult<OrderFile[]>> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return request
    .post(`/orders/${orderId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

export function getOrderFiles(orderId: number): Promise<ApiResult<OrderFile[]>> {
  return request.get(`/orders/${orderId}/files`).then((res) => res.data);
}

export function deleteOrderFile(orderId: number, fileId: number): Promise<ApiResult<null>> {
  return request.delete(`/orders/${orderId}/files/${fileId}`).then((res) => res.data);
}
