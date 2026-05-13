const BASE_URL = 'http://localhost:8080/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
  showLoading?: boolean;
}

function request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, showLoading = false } = options;
  const token = wx.getStorageSync('token') || '';
  
  if (showLoading) wx.showLoading({ title: '加载中...' });
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : ''
      },
      success(res: any) {
        if (res.data.code === 200) {
          resolve(res.data.data);
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
      complete() {
        if (showLoading) wx.hideLoading();
      }
    });
  });
}

export const api = {
  get<T>(url: string, data?: any) { return request<T>(url, { method: 'GET', data }); },
  post<T>(url: string, data?: any) { return request<T>(url, { method: 'POST', data, showLoading: true }); },
  put<T>(url: string, data?: any) { return request<T>(url, { method: 'PUT', data, showLoading: true }); },
};
