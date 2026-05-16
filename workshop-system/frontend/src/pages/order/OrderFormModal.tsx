import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Steps,
  message,
  Select,
  Table,
  Space,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import { createOrder, updateOrder, getOrderDetail, getOrderItems, addOrderItem, updateOrderItem, deleteOrderItem } from '../../api/order';
import { getProductPage } from '../../api/product';
import type { Product } from '../../types/product';
import type { Order, OrderItem } from '../../types/order';

const { TextArea } = Input;

interface OrderFormModalProps {
  open: boolean;
  orderId?: number; // undefined = 新增, 有值 = 编辑
  onClose: () => void;
  onSuccess: () => void;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({ open, orderId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const isEdit = !!orderId;

  useEffect(() => {
    if (open) {
      setCurrent(0);
      form.resetFields();
      setSelectedProducts([]);
      if (orderId) loadOrderDetail(orderId);
      loadProducts();
    }
  }, [open, orderId]);

  const loadOrderDetail = async (oid: number) => {
    try {
      const res = await getOrderDetail(oid);
      const detail = res.data;
      const order = detail.order;
      form.setFieldsValue({
        ...order,
        orderDate: order.orderDate ? dayjs(order.orderDate) : undefined,
        deliveryDate: order.deliveryDate ? dayjs(order.deliveryDate) : undefined,
      });
      setSelectedProducts(detail.items || []);
    } catch {
      // handled
    }
  };

  const loadProducts = async () => {
    setProductLoading(true);
    try {
      const res = await getProductPage({ page: 1, pageSize: 1000 });
      setProducts(res.data.records.filter((p) => p.status === 1));
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setProductLoading(false);
    }
  };

  const steps = [
    { title: '基本信息' },
    { title: '产品选择' },
    { title: '确认提交' },
  ];

  const handleAddProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (selectedProducts.find((p) => p.productId === productId)) {
      message.warning('该产品已添加');
      return;
    }
    setSelectedProducts([
      ...selectedProducts,
      {
        id: 0,
        orderId: orderId || 0,
        productId: product.id,
        productName: product.productName,
        productCode: product.productCode,
        specification: product.specification,
        productType: product.productType,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
        productionStatus: 0,
        sortOrder: 0,
        remark: '',
        createdAt: '',
      },
    ]);
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.productId === productId) {
          return { ...p, quantity, subtotal: quantity * p.unitPrice };
        }
        return p;
      })
    );
  };

  const handlePriceChange = (productId: number, unitPrice: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.productId === productId) {
          return { ...p, unitPrice, subtotal: p.quantity * unitPrice };
        }
        return p;
      })
    );
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const orderData: Partial<Order> = {
        customerName: values.customerName,
        customerContact: values.customerContact,
        customerPhone: values.customerPhone,
        customerAddress: values.customerAddress,
        orderDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        deliveryDate: values.deliveryDate ? values.deliveryDate.format('YYYY-MM-DD') : undefined,
        totalAmount: selectedProducts.reduce((sum, p) => sum + p.subtotal, 0),
        remark: values.remark,
      };

      let newOrderId: number;
      if (isEdit && orderId) {
        orderData.id = orderId;
        await updateOrder(orderData);
        newOrderId = orderId;
      } else {
        const res = await createOrder(orderData);
        newOrderId = res.data as unknown as number;
      }

      // Save order items
      const existingItems = isEdit
        ? await getOrderItems(newOrderId).catch(() => ({ data: [] as OrderItem[] }))
        : { data: [] as OrderItem[] };
      for (const item of existingItems.data) {
        if (!selectedProducts.find((p) => p.productId === item.productId)) {
          await deleteOrderItem(newOrderId, item.id);
        }
      }
      for (const item of selectedProducts) {
        const existing = existingItems.data.find((ei: OrderItem) => ei.productId === item.productId);
        if (existing) {
          await updateOrderItem({ ...item, id: existing.id, orderId: newOrderId });
        } else {
          await addOrderItem({ ...item, orderId: newOrderId });
        }
      }

      message.success(isEdit ? '更新成功' : '创建成功');
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const productColumns = [
    { title: '产品编号', dataIndex: 'productCode', key: 'productCode' },
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '规格', dataIndex: 'specification', key: 'specification' },
    {
      title: '数量',
      key: 'quantity',
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(v) => handleQuantityChange(record.productId, v || 1)}
        />
      ),
    },
    {
      title: '单价',
      key: 'unitPrice',
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(v) => handlePriceChange(record.productId, v || 0)}
          prefix="¥"
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_: any, record: any) => `¥${record.subtotal.toFixed(2)}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" danger onClick={() => handleRemoveProduct(record.productId)}>
          移除
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={isEdit ? '编辑订单' : '新增订单'}
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
      maskClosable={false}
      styles={{ header: { borderBottom: '1px solid #F1F5F9', paddingBottom: 16 } }}
    >
      <Steps current={current} items={steps} style={{ marginBottom: 24 }} />

      <Form form={form} layout="vertical">
        {/* Step 1: 基本信息 */}
        <div style={{ display: current === 0 ? 'block' : 'none' }}>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="customerContact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="customerPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="customerAddress" label="客户地址">
            <Input placeholder="请输入客户地址" />
          </Form.Item>
          <Form.Item name="deliveryDate" label="要求交货日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="订单备注" />
          </Form.Item>
        </div>

        {/* Step 2: 产品选择 */}
        <div style={{ display: current === 1 ? 'block' : 'none' }}>
          <Select
            showSearch
            style={{ width: '100%', marginBottom: 16 }}
            placeholder="搜索并选择产品添加"
            loading={productLoading}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            onSelect={handleAddProduct}
            options={products.map((p) => ({
              label: `${p.productCode} - ${p.productName} (${p.specification})`,
              value: p.id,
            }))}
          />
          <Table
            dataSource={selectedProducts}
            columns={productColumns}
            rowKey="productId"
            pagination={false}
            size="middle"
          />
          {selectedProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>请从上方选择产品添加到订单</div>
          )}
          <div style={{ textAlign: 'right', marginTop: 12, fontSize: 15, fontWeight: 600, color: '#4F46E5' }}>
            合计：¥{selectedProducts.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}
          </div>
        </div>

        {/* Step 3: 确认 */}
        <div style={{ display: current === 2 ? 'block' : 'none' }}>
          <Table
            dataSource={selectedProducts}
            columns={[
              { title: '产品名称', dataIndex: 'productName' },
              { title: '数量', dataIndex: 'quantity' },
              {
                title: '单价',
                dataIndex: 'unitPrice',
                render: (v: number) => `¥${v.toFixed(2)}`,
              },
              {
                title: '小计',
                dataIndex: 'subtotal',
                render: (v: number) => `¥${v.toFixed(2)}`,
              },
            ]}
            rowKey="productId"
            pagination={false}
            size="middle"
          />
          <div style={{ textAlign: 'right', marginTop: 12, fontSize: 16, fontWeight: 600, color: '#4F46E5' }}>
            总计：¥{selectedProducts.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}
          </div>
        </div>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
        <Button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)} style={{ borderColor: '#E2E8F0', color: '#475569' }}>
          上一步
        </Button>
        {current < steps.length - 1 ? (
          <Button type="primary" style={{ background: '#4F46E5', borderColor: '#4F46E5' }} onClick={() => setCurrent((c) => c + 1)}>
            下一步
          </Button>
        ) : (
          <Button type="primary" style={{ background: '#4F46E5', borderColor: '#4F46E5' }} onClick={handleSubmit} loading={loading}>
            {isEdit ? '保存修改' : '提交订单'}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default OrderFormModal;
