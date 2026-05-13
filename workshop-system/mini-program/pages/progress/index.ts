import { api } from '../../utils/api';

Page({
  data: {
    qrContent: '',
    result: null as any,
    records: [] as any[]
  },
  onInput(e: any) {
    this.setData({ qrContent: e.detail.value });
  },
  startScan() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        this.setData({ qrContent: res.result });
        this.query();
      }
    });
  },
  async query() {
    if (!this.data.qrContent) {
      wx.showToast({ title: '请输入二维码内容', icon: 'none' });
      return;
    }
    try {
      const result: any = await api.post('/qrcode/decode', { qrContent: this.data.qrContent });
      this.setData({ result });

      const records = await api.get(`/records/by-qrcode/${result.qrCodeId}`);
      this.setData({ records });
    } catch (err) {
      // 错误已在 api 中处理
    }
  }
});
