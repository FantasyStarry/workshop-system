import axios from 'axios';
import { message } from 'antd';
import type { ApiResult } from '../types/api';

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function getTokenExpirationTime(token: string): number {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000;
  } catch {
    return 0;
  }
}

function isTokenExpiringSoon(token: string, minutesBeforeExpiry: number = 5): boolean {
  const expiryTime = getTokenExpirationTime(token);
  const currentTime = Date.now();
  return expiryTime > 0 && (expiryTime - currentTime) < (minutesBeforeExpiry * 60 * 1000);
}

async function refreshToken(): Promise<string> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('没有token');
  }

  const response = await axios.post('/api/auth/refresh', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.data as ApiResult;
  if (data.code === 200 && data.data?.token) {
    return data.data.token;
  }
  throw new Error(data.message || '刷新token失败');
}

request.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpiringSoon(token) && !isRefreshing && config.url !== '/auth/refresh') {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          localStorage.setItem('token', newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
          
          refreshQueue.forEach((callback) => callback(newToken));
          refreshQueue = [];
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing && config.url !== '/auth/refresh') {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          });
        });
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResult;
    if (res.code === 200 || res.code === 0) {
      return response;
    }
    if (res.code === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
      return Promise.reject(new Error(res.message || '未授权'));
    }
    message.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    message.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export default request;
