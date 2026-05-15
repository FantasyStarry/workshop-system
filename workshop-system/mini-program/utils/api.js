const BASE_URL = 'http://localhost:8080/api';

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        } else {
          reject(new Error('网络请求失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

const qrCodeApi = {
  decode: (qrContent) => {
    return request({
      url: '/qrcode/decode',
      method: 'POST',
      data: { qrContent }
    });
  }
};

const recordApi = {
  scan: (data) => {
    return request({
      url: '/records/scan',
      method: 'POST',
      data
    });
  }
};

const stageApi = {
  list: () => {
    return request({
      url: '/stage/list',
      method: 'GET'
    });
  }
};

module.exports = {
  qrCodeApi,
  recordApi,
  stageApi,
  request
};
