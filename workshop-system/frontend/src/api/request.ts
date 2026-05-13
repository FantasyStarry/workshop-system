import axios from 'axios';
import { message } from 'antd';
import type { ApiResult } from '../types/api';

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
