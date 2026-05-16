import request from './request';
import { encryptPasswordAsync } from './rsa';
import type { ApiResult } from '../types/api';
import type { LoginParams, UserInfo } from '../types/user';

export async function login(params: LoginParams): Promise<ApiResult<{ token: string; userId: string; username: string; realName: string }>> {
  const encryptedParams = {
    username: params.username,
    password: await encryptPasswordAsync(params.password),
  };
  return request.post('/auth/login', encryptedParams).then((res) => res.data);
}

export function getUserInfo(): Promise<ApiResult<UserInfo>> {
  return request.get('/auth/userinfo').then((res) => res.data);
}

export async function changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResult<null>> {
  const encryptedData = {
    oldPassword: await encryptPasswordAsync(data.oldPassword),
    newPassword: await encryptPasswordAsync(data.newPassword),
  };
  return request.put('/auth/password', encryptedData).then((res) => res.data);
}
