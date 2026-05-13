import { api } from '../../utils/api';

Page({
  data: { qrContent: '' },
  onLoad() {
    // 页面加载
  },
  startScan() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        const qrContent = res.result;
        this.queryQrContent(qrContent);
      },
      fail: (err) => {
        wx.showToast({ title: '取消扫码', icon: 'none' });
      }
    });
  },
  onInputChange(e: any) {
    this.setData({ qrContent: e.detail.value });
  },
  onQuery() {
    if (!this.data.qrContent) {
      wx.showToast({ title: '请输入二维码内容', icon: 'none' });
      return;
    }
    this.queryQrContent(this.data.qrContent);
  },
  async queryQrContent(qrContent: string) {
    try {
      const data: any = await api.post('/qrcode/decode', { qrContent });
      wx.navigateTo({
        url: `/pages/product/index?qrCodeId=${data.qrCodeId}&qrContent=${encodeURIComponent(qrContent)}`
      });
    } catch (err) {
      // 错误已在 api 中处理
    }
  }
});
