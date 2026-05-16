var wxRsa = require('./wx-rsa.js');

var BASE_URL = 'https://a8ca5b67.natappfree.cc/api';
var cachedPublicKey = null;

function getPublicKey() {
  if (cachedPublicKey) {
    return Promise.resolve(cachedPublicKey);
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: BASE_URL + '/auth/public-key',
      method: 'GET',
      success: function (res) {
        if (res.statusCode === 200 && res.data.code === 200) {
          cachedPublicKey = res.data.data.publicKey;
          resolve(cachedPublicKey);
        } else {
          reject(new Error('获取公钥失败'));
        }
      },
      fail: function (err) {
        reject(new Error('获取公钥请求失败'));
      }
    });
  });
}

function encryptPasswordAsync(password) {
  return getPublicKey().then(function (publicKey) {
    return wxRsa.encryptRSA(password, publicKey);
  });
}

module.exports = {
  getPublicKey: getPublicKey,
  encryptPasswordAsync: encryptPasswordAsync
};
