import request from './request';
import { encryptPasswordAsync } from './rsa';
import type { ApiResult, PageResult } from '../types/api';
import type { UserItem, DeptItem, RoleItem } from '../types/user';

export function getUserPage(params: {
  page: number;
  pageSize: number;
  username?: string;
  realName?: string;
  deptId?: number;
  status?: number;
}): Promise<ApiResult<PageResult<UserItem>>> {
  return request.get('/users/page', { params }).then((res) => res.data);
}

export function getUserDetail(id: number): Promise<ApiResult<UserItem>> {
  return request.get(`/users/${id}`).then((res) => res.data);
}

export async function createUser(data: Partial<UserItem> & { password: string }): Promise<ApiResult<UserItem>> {
  if (data.password) {
    data = { ...data, password: await encryptPasswordAsync(data.password) };
  }
  return request.post('/users', data).then((res) => res.data);
}

export async function updateUser(data: Partial<UserItem> & { password?: string }): Promise<ApiResult<UserItem>> {
  if (data.password) {
    data = { ...data, password: await encryptPasswordAsync(data.password) };
  }
  return request.put(`/users/${data.id}`, data).then((res) => res.data);
}

export function updateUserStatus(id: number, status: number): Promise<ApiResult<null>> {
  return request.put(`/users/${id}/status?status=${status}`).then((res) => res.data);
}

export function deleteUser(id: number): Promise<ApiResult<null>> {
  return request.delete(`/users/${id}`).then((res) => res.data);
}

export function getDeptTree(): Promise<ApiResult<DeptItem[]>> {
  return request.get('/depts/tree').then((res) => res.data);
}

export function createDept(data: Partial<DeptItem>): Promise<ApiResult<DeptItem>> {
  return request.post('/depts', data).then((res) => res.data);
}

export function updateDept(data: Partial<DeptItem>): Promise<ApiResult<DeptItem>> {
  return request.put(`/depts/${data.id}`, data).then((res) => res.data);
}

export function deleteDept(id: number): Promise<ApiResult<null>> {
  return request.delete(`/depts/${id}`).then((res) => res.data);
}

export function getRoleList(): Promise<ApiResult<RoleItem[]>> {
  return request.get('/roles/list').then((res) => res.data);
}

export function createRole(data: Partial<RoleItem>): Promise<ApiResult<RoleItem>> {
  return request.post('/roles', data).then((res) => res.data);
}

export function updateRole(data: Partial<RoleItem>): Promise<ApiResult<RoleItem>> {
  return request.put(`/roles/${data.id}`, data).then((res) => res.data);
}

export function deleteRole(id: number): Promise<ApiResult<null>> {
  return request.delete(`/roles/${id}`).then((res) => res.data);
}
