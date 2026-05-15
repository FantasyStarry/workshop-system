App({
  globalData: {
    userInfo: null,
    baseUrl: 'https://a8ca5b67.natappfree.cc/api'
  },

  onLaunch: function () {
    console.log('App Launch');
    this.checkLogin();
  },

  onShow: function () {
    console.log('App Show');
  },

  onHide: function () {
    console.log('App Hide');
  },

  checkLogin: function () {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  login: function (callback) {
    const that = this;
    wx.login({
      success: (res) => {
        wx.request({
          url: that.globalData.baseUrl + '/wx/login',
          method: 'POST',
          data: { code: res.code },
          success: (response) => {
            if (response.data.code === 200) {
              const result = response.data.data;
              if (!result.needBind) {
                wx.setStorageSync('token', result.token);
                wx.setStorageSync('userInfo', {
                  userId: result.userId,
                  username: result.username,
                  realName: result.realName
                });
                that.globalData.userInfo = wx.getStorageSync('userInfo');
                callback && callback(null, result);
              } else {
                callback && callback(new Error('需要绑定账号'), null);
              }
            } else {
              callback && callback(new Error(response.data.message), null);
            }
          },
          fail: (err) => {
            callback && callback(err, null);
          }
        });
      },
      fail: (err) => {
        callback && callback(err, null);
      }
    });
  },

  logout: function () {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.userInfo = null;
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});
