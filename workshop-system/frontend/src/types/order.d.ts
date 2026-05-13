export interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  remark: string;
  status: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productCode: string;
  specification: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productionStatus: number;
  sortOrder: number;
  remark: string;
  createdAt: string;
}

export interface OrderFile {
  id: number;
  orderId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  sortOrder: number;
  createdAt: string;
}
