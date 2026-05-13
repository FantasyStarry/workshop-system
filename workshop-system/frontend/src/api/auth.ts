import request from './request';
import type { ApiResult } from '../types/api';
import type { LoginParams, UserInfo } from '../types/user';

export function login(params: LoginParams): Promise<ApiResult<{ token: string; userId: string; username: string; realName: string }>> {
  return request.post('/auth/login', params).then((res) => res.data);
}

export function getUserInfo(): Promise<ApiResult<UserInfo>> {
  return request.get('/auth/userinfo').then((res) => res.data);
}

export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResult<null>> {
  return request.put('/auth/password', data).then((res) => res.data);
}
