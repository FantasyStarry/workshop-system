import { api } from '../../utils/api';

Page({
  data: {
    qrCodeId: 0,
    qrContent: '',
    currentStageId: 0,
    availableStages: [] as any[],
    selectedStageId: 0,
    location: '',
    temperature: '',
    humidity: '',
    photoUrl: '',
    remark: '',
    submitting: false
  },
  async onLoad(options: any) {
    this.setData({
      qrCodeId: Number(options.qrCodeId),
      qrContent: decodeURIComponent(options.qrContent || ''),
      currentStageId: Number(options.currentStageId || 0)
    });

    // 加载所有环节，只显示下一环节
    try {
      const stages: any[] = await api.get('/stages/list');
      const availableStages = stages.filter((s: any) => {
        // 如果是第一个环节，显示第一个
        if (this.data.currentStageId === 0) return s.stageSeq === 1;
        // 找到当前环节序号，显示下一环节
        const currentStage = stages.find((cs: any) => cs.id === this.data.currentStageId);
        if (!currentStage) return false;
        return s.stageSeq === currentStage.stageSeq + 1;
      });
      this.setData({ availableStages });
    } catch (err) {
      // 错误已在 api 中处理
    }
  },
  selectStage(e: any) {
    this.setData({ selectedStageId: Number(e.currentTarget.dataset.id) });
  },
  onLocationInput(e: any) { this.setData({ location: e.detail.value }); },
  onTempInput(e: any) { this.setData({ temperature: e.detail.value }); },
  onHumidityInput(e: any) { this.setData({ humidity: e.detail.value }); },
  onRemarkInput(e: any) { this.setData({ remark: e.detail.value }); },
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.setData({ photoUrl: res.tempFilePaths[0] });
      }
    });
  },
  async submitReport() {
    if (!this.data.selectedStageId) {
      wx.showToast({ title: '请选择环节', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      let photoUrl = '';
      if (this.data.photoUrl) {
        photoUrl = this.data.photoUrl;
      }

      await api.post('/records/scan', {
        qrContent: this.data.qrContent,
        stageId: this.data.selectedStageId,
        location: this.data.location,
        temperature: this.data.temperature ? Number(this.data.temperature) : null,
        humidity: this.data.humidity ? Number(this.data.humidity) : null,
        photoUrl: photoUrl,
        remark: this.data.remark
      });

      wx.showToast({ title: '上报成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      this.setData({ submitting: false });
    }
  }
});
