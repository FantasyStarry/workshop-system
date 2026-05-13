export interface Product {
  id: number;
  productCode: string;
  productName: string;
  productType: string;
  specification: string;
  beamLength: number;
  beamWidth: number;
  beamHeight: number;
  concreteGrade: string;
  steelSpec: string;
  prestressSpec: string;
  unitWeight: number;
  batchNo: string;
  technicalParams: string;
  drawingFile: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}
