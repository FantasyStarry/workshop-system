const { dashboardApi } = require('../../utils/api.js');

Page({
  data: {
    todayRecords: 0,
    totalOrders: 0,
    completedStages: 0
  },

  onLoad: function () {
    this.loadStats();
    this._startAutoRefresh();
  },

  onShow: function () {
    this.loadStats();
  },

  onUnload: function () {
    this._stopAutoRefresh();
  },

  loadStats: function () {
    dashboardApi.overview()
      .then((data) => {
        this.setData({
          todayRecords: data.todayScanCount || 0,
          totalOrders: data.activeOrderCount || 0,
          completedStages: data.monthCompleteCount || 0
        });
      })
      .catch((err) => {
        console.error('加载仪表盘数据失败:', err);
      });
  },

  goScan: function () {
    wx.navigateTo({
      url: '/pages/scan/scan'
    });
  },

  _startAutoRefresh: function () {
    this._autoRefreshTimer = setInterval(() => {
      this.loadStats();
    }, 30000);
  },

  _stopAutoRefresh: function () {
    if (this._autoRefreshTimer) {
      clearInterval(this._autoRefreshTimer);
      this._autoRefreshTimer = null;
    }
  }
});
