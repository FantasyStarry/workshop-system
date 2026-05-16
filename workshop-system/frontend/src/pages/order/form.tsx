import React, { useEffect, useState } from 'react';
import {
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
  Card,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { createOrder, updateOrder, getOrderDetail, getOrderItems, addOrderItem, updateOrderItem, deleteOrderItem } from '../../api/order';
import { getProductPage } from '../../api/product';
import type { Product } from '../../types/product';
import type { Order, OrderItem } from '../../types/order';

const { TextArea } = Input;

const OrderFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      loadOrderDetail(Number(id));
    }
    loadProducts();
  }, [id]);

  const loadOrderDetail = async (orderId: number) => {
    try {
      const res = await getOrderDetail(orderId);
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
      if (err?.message) {
        message.error(err.message);
      }
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
        orderId: Number(id) || 0,
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
      // 先校验表单，确保必填字段已填写
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

      let orderId: number;
      if (isEdit) {
        orderData.id = Number(id);
        await updateOrder(orderData);
        orderId = Number(id);
      } else {
        const res = await createOrder(orderData);
        orderId = res.data as unknown as number;
      }

      // Save order items
      const existingItems = isEdit ? await getOrderItems(orderId).catch(() => ({ data: [] as OrderItem[] })) : { data: [] as OrderItem[] };
      for (const item of existingItems.data) {
        if (!selectedProducts.find((p) => p.productId === item.productId)) {
          await deleteOrderItem(orderId, item.id);
        }
      }
      for (const item of selectedProducts) {
        const existing = existingItems.data.find((ei: OrderItem) => ei.productId === item.productId);
        if (existing) {
          await updateOrderItem({ ...item, id: existing.id, orderId });
        } else {
          await addOrderItem({ ...item, orderId });
        }
      }

      message.success(isEdit ? '更新成功' : '创建成功');
      navigate('/orders');
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const hiddenStyle = { display: 'none' };
    return (
      <>
        <div style={current === 0 ? undefined : hiddenStyle}>
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
          <Form.Item name="deliveryDate" label="交付日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </div>
        <div style={current === 1 ? undefined : hiddenStyle}>
          <Select
            showSearch
            placeholder="搜索并添加产品"
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            options={products.map((p) => ({
              label: `${p.productCode} - ${p.productName}`,
              value: p.id,
            }))}
            onChange={handleAddProduct}
            style={{ width: '100%', marginBottom: 16 }}
            loading={productLoading}
            value={undefined}
          />
          <Table
            dataSource={selectedProducts}
            rowKey="productId"
            pagination={false}
            columns={[
              { title: '产品编号', dataIndex: 'productCode', width: 120 },
              { title: '产品名称', dataIndex: 'productName', width: 150 },
              {
                title: '数量',
                dataIndex: 'quantity',
                width: 100,
                render: (val: number, record: OrderItem) => (
                  <InputNumber
                    min={1}
                    value={val}
                    onChange={(v) => handleQuantityChange(record.productId, v || 1)}
                  />
                ),
              },
              {
                title: '单价',
                dataIndex: 'unitPrice',
                width: 120,
                render: (val: number, record: OrderItem) => (
                  <InputNumber
                    min={0}
                    precision={2}
                    prefix="¥"
                    value={val}
                    onChange={(v) => handlePriceChange(record.productId, v || 0)}
                  />
                ),
              },
              {
                title: '小计',
                dataIndex: 'subtotal',
                width: 120,
                render: (val: number) => `¥${(val || 0).toFixed(2)}`,
              },
              {
                title: '操作',
                width: 80,
                render: (_: any, record: OrderItem) => (
                  <Button danger size="small" onClick={() => handleRemoveProduct(record.productId)}>
                    移除
                  </Button>
                ),
              },
            ]}
          />
          <div style={{ textAlign: 'right', marginTop: 16, fontSize: 16, fontWeight: 600, color: '#4F46E5' }}>
            总计：¥{selectedProducts.reduce((s, p) => s + p.subtotal, 0).toFixed(2)}
          </div>
        </div>
        <div style={current === 2 ? undefined : hiddenStyle}>
          <Card title="订单确认" style={{ borderColor: '#E2E8F0' }}>
            <div style={{ marginBottom: 16, color: '#0F172A' }}>
              <strong style={{ color: '#475569' }}>客户信息：</strong>
              {form.getFieldValue('customerName') || '（未填写）'}
            </div>
            <Table
              dataSource={selectedProducts}
              rowKey="productId"
              pagination={false}
              columns={[
                { title: '产品编号', dataIndex: 'productCode' },
                { title: '产品名称', dataIndex: 'productName' },
                { title: '数量', dataIndex: 'quantity' },
                { title: '单价', dataIndex: 'unitPrice', render: (v: number) => `¥${v.toFixed(2)}` },
                { title: '小计', dataIndex: 'subtotal', render: (v: number) => `¥${v.toFixed(2)}` },
              ]}
            />
            <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18, fontWeight: 600, color: '#4F46E5' }}>
              订单总额：¥{selectedProducts.reduce((s, p) => s + p.subtotal, 0).toFixed(2)}
            </div>
          </Card>
        </div>
      </>
    );
  };

  return (
    <Card style={{ borderColor: '#E2E8F0' }}>
      <Steps
        current={current}
        items={steps}
        style={{ marginBottom: 32 }}
        className="order-form-steps"
      />
      <Form form={form} layout="vertical">
        {renderStepContent()}
      </Form>
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Space>
          {current > 0 && (
            <Button onClick={() => setCurrent(current - 1)} style={{ borderColor: '#E2E8F0', color: '#475569' }}>上一步</Button>
          )}
          {current < 2 && (
            <Button type="primary" style={{ background: '#4F46E5', borderColor: '#4F46E5' }} onClick={async () => {
              // 第0步为基本信息，需要先校验表单
              if (current === 0) {
                try {
                  await form.validateFields();
                } catch {
                  return;
                }
              }
              setCurrent(current + 1);
            }}>
              下一步
            </Button>
          )}
          {current === 2 && (
            <Button type="primary" style={{ background: '#4F46E5', borderColor: '#4F46E5' }} loading={loading} onClick={handleSubmit}>
              提交订单
            </Button>
          )}
          <Button onClick={() => navigate('/orders')} style={{ borderColor: '#E2E8F0', color: '#475569' }}>取消</Button>
        </Space>
      </div>
    </Card>
  );
};

export default OrderFormPage;
