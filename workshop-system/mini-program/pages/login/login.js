const { authApi } = require('../../utils/api.js');

Page({
  data: {
    showBind: false,
    username: '',
    password: '',
    tempOpenid: ''
  },

  onLoad: function () {
    const token = wx.getStorageSync('token');
    if (token) {
      wx.navigateTo({
        url: '/pages/index/index'
      });
    }
  },

  wxLogin: function () {
    wx.showLoading({
      title: '登录中...'
    });

    wx.login({
      success: (res) => {
        console.log('微信登录成功:', res);
        this.handleWxLogin(res.code);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('微信登录失败:', err);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  handleWxLogin: function (code) {
    authApi.wxLogin(code)
      .then((result) => {
        wx.hideLoading();
        console.log('后端登录结果:', result);

        if (result.needBind) {
          this.setData({
            showBind: true,
            tempOpenid: result.userId
          });
        } else {
          this.saveLoginInfo(result);
          wx.navigateTo({
            url: '/pages/index/index'
          });
        }
      })
      .catch((err) => {
        wx.hideLoading();
        console.error('登录失败:', err);
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        });
      });
  },

  onUsernameInput: function (e) {
    this.setData({
      username: e.detail.value
    });
  },

  onPasswordInput: function (e) {
    this.setData({
      password: e.detail.value
    });
  },

  bindAccount: function () {
    if (!this.data.username || !this.data.password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '绑定中...'
    });

    authApi.bind({
      username: this.data.username,
      password: this.data.password,
      wxOpenid: this.data.tempOpenid
    })
      .then((result) => {
        wx.hideLoading();
        console.log('绑定成功:', result);
        this.saveLoginInfo(result);
        wx.showToast({
          title: '绑定成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/index/index'
          });
        }, 1500);
      })
      .catch((err) => {
        wx.hideLoading();
        console.error('绑定失败:', err);
        wx.showToast({
          title: err.message || '绑定失败',
          icon: 'none'
        });
      });
  },

  cancelBind: function () {
    this.setData({
      showBind: false,
      username: '',
      password: '',
      tempOpenid: ''
    });
  },

  saveLoginInfo: function (result) {
    wx.setStorageSync('token', result.token);
    wx.setStorageSync('userInfo', {
      userId: result.userId,
      username: result.username,
      realName: result.realName
    });
  }
});
