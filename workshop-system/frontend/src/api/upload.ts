import request from './request';
import type { ApiResult } from '../types/api';

export function uploadImage(file: File): Promise<ApiResult<{ url: string }>> {
  const formData = new FormData();
  formData.append('file', file);
  return request
    .post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

export function uploadFile(file: File): Promise<ApiResult<{ url: string; fileName: string }>> {
  const formData = new FormData();
  formData.append('file', file);
  return request
    .post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}
