const { qrCodeApi } = require('../../utils/api.js');

Page({
  data: {
    recentRecords: []
  },

  onLoad: function () {
    this.loadRecentRecords();
  },

  handleScan: function () {
    const that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        console.log('扫码结果:', res.result);
        that.decodeQrCode(res.result);
      },
      fail: function (err) {
        console.error('扫码失败:', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  decodeQrCode: function (qrContent) {
    wx.showLoading({
      title: '解析中...'
    });

    qrCodeApi.decode(qrContent)
      .then(function (result) {
        wx.hideLoading();
        console.log('解析结果:', result);
        
        if (result) {
          wx.navigateTo({
            url: '/pages/report/report?qrContent=' + encodeURIComponent(qrContent) + 
                 '&qrCodeId=' + (result.qrCodeId || '') +
                 '&productName=' + encodeURIComponent(result.productName || '') +
                 '&orderNo=' + encodeURIComponent(result.orderNo || '') +
                 '&currentStage=' + encodeURIComponent(result.currentStageName || '')
          });
        } else {
          wx.showToast({
            title: '无效的二维码',
            icon: 'none'
          });
        }
      })
      .catch(function (err) {
        wx.hideLoading();
        console.error('解析失败:', err);
        wx.showToast({
          title: '解析失败',
          icon: 'none'
        });
      });
  },

  loadRecentRecords: function () {
    const records = wx.getStorageSync('recentRecords') || [];
    this.setData({
      recentRecords: records.slice(0, 5)
    });
  },

  goBack: function () {
    wx.navigateBack();
  }
});
