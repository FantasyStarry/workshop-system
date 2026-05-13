import request from './request';
import type { ApiResult, PageResult } from '../types/api';
import type { Product } from '../types/product';

export function getProductPage(params: {
  page: number;
  pageSize: number;
  productName?: string;
  productCode?: string;
  productType?: string;
  status?: number;
}): Promise<ApiResult<PageResult<Product>>> {
  return request.get('/products/page', { params }).then((res) => res.data);
}

export function getProductDetail(id: number): Promise<ApiResult<Product>> {
  return request.get(`/products/${id}`).then((res) => res.data);
}

export function createProduct(data: Partial<Product>): Promise<ApiResult<Product>> {
  return request.post('/products', data).then((res) => res.data);
}

export function updateProduct(data: Partial<Product>): Promise<ApiResult<Product>> {
  return request.put(`/products/${data.id}`, data).then((res) => res.data);
}

export function updateProductStatus(id: number, status: number): Promise<ApiResult<null>> {
  return request.put(`/products/${id}/status?status=${status}`).then((res) => res.data);
}

export function deleteProduct(id: number): Promise<ApiResult<null>> {
  return request.delete(`/products/${id}`).then((res) => res.data);
}
