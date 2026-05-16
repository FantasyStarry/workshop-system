Page({
  data: {
    success: false,
    productName: '',
    stageName: '',
    currentTime: ''
  },

  onLoad: function (options) {
    console.log('页面参数:', options);
    
    this.setData({
      success: options.success === 'true',
      productName: decodeURIComponent(options.productName || ''),
      stageName: decodeURIComponent(options.stageName || ''),
      currentTime: new Date().toLocaleString()
    });
  },

  goHome: function () {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  goScan: function () {
    wx.navigateTo({
      url: '/pages/scan/scan'
    });
  },

  goBack: function () {
    wx.navigateBack();
  }
});
