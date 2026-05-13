import { api } from '../../utils/api';
import { getStatusText } from '../../utils/util';

Page({
  data: {
    qrCodeId: 0,
    qrContent: '',
    productInfo: {} as any,
    stages: [] as any[],
    records: [] as any[],
    statusText: ''
  },
  onLoad(options: any) {
    this.setData({
      qrCodeId: Number(options.qrCodeId),
      qrContent: decodeURIComponent(options.qrContent || '')
    });
    this.loadDetail();
    this.loadRecords();
  },
  async loadDetail() {
    try {
      const data: any = await api.post('/qrcode/decode', { qrContent: this.data.qrContent });
      this.setData({
        productInfo: data,
        statusText: getStatusText(data.status)
      });

      // 加载所有生产环节
      const stages: any[] = await api.get('/stages/list');
      const currentStageSeq = data.currentStageSeq || 0;
      const enhancedStages = stages.map((s: any) => ({
        ...s,
        status: s.stageSeq < currentStageSeq ? 'finish' :
                s.stageSeq === currentStageSeq ? 'process' : 'wait'
      }));
      this.setData({ stages: enhancedStages });
    } catch (err) {
      // 错误已在 api 中处理
    }
  },
  async loadRecords() {
    try {
      const records = await api.get(`/records/by-qrcode/${this.data.qrCodeId}`);
      this.setData({ records });
    } catch (err) {
      // 错误已在 api 中处理
    }
  },
  goReport() {
    wx.navigateTo({
      url: `/pages/report/index?qrCodeId=${this.data.qrCodeId}&qrContent=${encodeURIComponent(this.data.qrContent)}&currentStageId=${this.data.productInfo.currentStageId || 0}`
    });
  }
});
