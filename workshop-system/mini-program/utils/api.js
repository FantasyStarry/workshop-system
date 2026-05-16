const BASE_URL = 'https://a8ca5b67.natappfree.cc/api';

const request = (options) => {
  const token = wx.getStorageSync('token');
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': 'Bearer ' + token }),
        ...options.header
      },
      timeout: options.timeout || 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else {
            if (res.data.code === 401) {
              wx.removeStorageSync('token');
              wx.removeStorageSync('userInfo');
            }
            reject(new Error(res.data.message || '请求失败'));
          }
        } else {
          reject(new Error('网络请求失败，状态码: ' + res.statusCode));
        }
      },
      fail: (err) => {
        console.warn('请求失败:', err);
        if (err.errMsg && err.errMsg.includes('timeout')) {
          reject(new Error('网络超时，请检查网络连接'));
        } else {
          reject(new Error(err.message || '网络请求失败'));
        }
      }
    });
  });
};

const authApi = {
  wxLogin: (code) => {
    return request({
      url: '/wx/login',
      method: 'POST',
      data: { code },
      timeout: 15000
    });
  },
  bind: (data) => {
    return request({
      url: '/wx/bind',
      method: 'POST',
      data,
      timeout: 15000
    });
  }
};

const qrCodeApi = {
  decode: (qrContent) => {
    return request({
      url: '/qrcode/decode',
      method: 'POST',
      data: { qrContent },
      timeout: 15000
    });
  }
};

const recordApi = {
  scan: (data) => {
    return request({
      url: '/records/scan',
      method: 'POST',
      data,
      timeout: 15000
    });
  }
};

const stageApi = {
  list: () => {
    return request({
      url: '/stages/list',
      method: 'GET',
      timeout: 10000
    });
  }
};

const dashboardApi = {
  overview: () => {
    return request({
      url: '/dashboard/overview',
      method: 'GET',
      timeout: 10000
    });
  }
};

module.exports = {
  authApi,
  dashboardApi,
  qrCodeApi,
  recordApi,
  stageApi,
  request
};
