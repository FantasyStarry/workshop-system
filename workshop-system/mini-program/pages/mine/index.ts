Page({
  data: {
    userInfo: {} as any
  },
  onLoad() {
    this.getUserInfo();
  },
  getUserInfo() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({ userInfo });
    }
  },
  goScanHistory() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          const app = getApp();
          app.globalData.token = '';
          app.globalData.userInfo = null;
          wx.reLaunch({ url: '/pages/scan/index' });
        }
      }
    });
  }
});
