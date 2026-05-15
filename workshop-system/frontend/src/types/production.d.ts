export interface ProductionStage {
  id: number;
  stageName: string;
  stageCode: string;
  stageSeq: number;
  description: string;
  needQc: number;
  needPhoto: number;
  estimatedHours: number;
  status: number;
  createdAt: string;
}

export interface ProductionRecord {
  id: number;
  recordNo: string;
  qrCodeId: number;
  orderItemId: number;
  
  productId: number;
  productCode: string;
  productName: string;
  
  stageId: number;
  stageName: string;
  stageSeq: number;
  
  operatorId: number;
  operatorName: string;
  
  scanTime: string;
  location: string;
  temperature: number;
  humidity: number;
  photoUrl: string;
  
  qcResult: number | null;
  qcUserId: number;
  qcUserName: string;
  qcTime: string;
  qcRemark: string;
  
  remark: string;
  createdAt: string;
}

export interface QrCode {
  id: number;
  qrContent: string;
  orderItemId: number;
  productId: number;
  productName: string;
  productCode: string;
  serialNo: string;
  batchNo: string;
  qrImagePath: string;
  currentStageId: number;
  currentStageName: string;
  status: number;
  generatedBy: number;
  generatedAt: string;
  createdAt: string;
}

export interface ScanReport {
  qrCodeContent: string;
  stageId: number;
  operator: string;
  location?: string;
  temperature?: number;
  humidity?: number;
  remark?: string;
}

export interface QcSubmit {
  recordId: number;
  qcResult: number;
  qcRemark?: string;
}
