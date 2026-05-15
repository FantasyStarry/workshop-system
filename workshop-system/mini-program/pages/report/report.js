const { recordApi, stageApi } = require('../../utils/api.js');

Page({
  data: {
    qrContent: '',
    qrCodeId: '',
    productName: '',
    orderNo: '',
    currentStage: '',
    stages: [],
    selectedStageId: null,
    selectedStageName: '',
    location: '',
    temperature: '',
    humidity: '',
    remark: ''
  },

  onLoad: function (options) {
    console.log('页面参数:', options);
    
    this.setData({
      qrContent: decodeURIComponent(options.qrContent || ''),
      qrCodeId: options.qrCodeId || '',
      productName: decodeURIComponent(options.productName || '未知产品'),
      orderNo: decodeURIComponent(options.orderNo || '未知订单'),
      currentStage: decodeURIComponent(options.currentStage || '未开始')
    });

    this.loadStages();
  },

  loadStages: function () {
    stageApi.list()
      .then(function (stages) {
        console.log('工序列表:', stages);
        this.setData({
          stages: stages || []
        });
      }.bind(this))
      .catch(function (err) {
        console.error('加载工序失败:', err);
      });
  },

  onStageChange: function (e) {
    const index = e.detail.value;
    const stage = this.data.stages[index];
    this.setData({
      selectedStageId: stage.id,
      selectedStageName: stage.stageName
    });
  },

  onLocationInput: function (e) {
    this.setData({
      location: e.detail.value
    });
  },

  onTemperatureInput: function (e) {
    this.setData({
      temperature: e.detail.value
    });
  },

  onHumidityInput: function (e) {
    this.setData({
      humidity: e.detail.value
    });
  },

  onRemarkInput: function (e) {
    this.setData({
      remark: e.detail.value
    });
  },

  getLocation: function () {
    wx.showLoading({
      title: '获取位置...'
    });

    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        wx.hideLoading();
        console.log('位置信息:', res);
        this.setData({
          location: `经度: ${res.longitude.toFixed(4)}, 纬度: ${res.latitude.toFixed(4)}`
        });
      }.bind(this),
      fail: function (err) {
        wx.hideLoading();
        console.error('获取位置失败:', err);
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    });
  },

  handleSubmit: function () {
    if (!this.data.selectedStageId) {
      wx.showToast({
        title: '请选择工序',
        icon: 'none'
      });
      return;
    }

    const data = {
      qrContent: this.data.qrContent,
      stageId: this.data.selectedStageId,
      location: this.data.location,
      temperature: this.data.temperature ? parseFloat(this.data.temperature) : null,
      humidity: this.data.humidity ? parseFloat(this.data.humidity) : null,
      remark: this.data.remark
    };

    wx.showLoading({
      title: '上报中...'
    });

    recordApi.scan(data)
      .then(function (result) {
        wx.hideLoading();
        console.log('上报成功:', result);
        
        const record = {
          id: result.id,
          productName: this.data.productName,
          stageName: this.data.selectedStageName,
          createTime: new Date().toLocaleString()
        };
        
        const recentRecords = wx.getStorageSync('recentRecords') || [];
        recentRecords.unshift(record);
        wx.setStorageSync('recentRecords', recentRecords.slice(0, 10));

        wx.navigateTo({
          url: '/pages/result/result?success=true&productName=' + encodeURIComponent(this.data.productName) + 
               '&stageName=' + encodeURIComponent(this.data.selectedStageName)
        });
      }.bind(this))
      .catch(function (err) {
        wx.hideLoading();
        console.error('上报失败:', err);
        wx.showToast({
          title: err.message || '上报失败',
          icon: 'none'
        });
      });
  }
});
