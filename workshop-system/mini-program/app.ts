App({
  globalData: {
    baseUrl: 'http://localhost:8080/api',
    token: '',
    userInfo: null
  },
  onLaunch() {
    // 自动登录
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  }
});
