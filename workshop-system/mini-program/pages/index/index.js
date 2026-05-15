Page({
  data: {
    todayRecords: 0,
    totalOrders: 0,
    completedStages: 0
  },

  onLoad: function () {
    this.loadStats();
  },

  loadStats: function () {
    wx.showLoading({
      title: '加载中...'
    });

    setTimeout(function () {
      wx.hideLoading();
      this.setData({
        todayRecords: 12,
        totalOrders: 8,
        completedStages: 35
      });
    }.bind(this), 1000);
  },

  goScan: function () {
    wx.navigateTo({
      url: '/pages/scan/scan'
    });
  }
});
