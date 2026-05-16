import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductDetail } from '../../api/product';

const { TextArea } = Input;

const productTypes = [
  { label: '预制梁', value: '预制梁' },
  { label: '预制柱', value: '预制柱' },
  { label: '预制板', value: '预制板' },
  { label: '其他', value: '其他' },
];

const ProductFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      loadProduct(Number(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      const res = await getProductDetail(productId);
      form.setFieldsValue(res.data);
    } catch {
      // handled
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateProduct({ ...values, id: Number(id) });
      } else {
        await createProduct(values);
      }
      message.success(isEdit ? '更新成功' : '创建成功');
      navigate('/products');
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<span style={{ color: '#0F172A', fontWeight: 600 }}>{isEdit ? '编辑产品' : '新增产品'}</span>} style={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 800 }}>
        <Form.Item name="productCode" label="产品编号" rules={[{ required: true, message: '请输入产品编号' }]}>
          <Input placeholder="请输入产品编号" />
        </Form.Item>
        <Form.Item name="productName" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
          <Input placeholder="请输入产品名称" />
        </Form.Item>
        <Form.Item name="productType" label="产品类型" rules={[{ required: true, message: '请选择产品类型' }]}>
          <Select options={productTypes} placeholder="请选择产品类型" />
        </Form.Item>
        <Form.Item name="specification" label="规格">
          <Input placeholder="请输入规格" />
        </Form.Item>
        <Form.Item name="beamLength" label="梁体长(m)">
          <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入长度" />
        </Form.Item>
        <Form.Item name="beamWidth" label="梁体宽(m)">
          <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入宽度" />
        </Form.Item>
        <Form.Item name="beamHeight" label="梁体高(m)">
          <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入高度" />
        </Form.Item>
        <Form.Item name="concreteGrade" label="混凝土强度等级">
          <Input placeholder="如 C50" />
        </Form.Item>
        <Form.Item name="steelSpec" label="钢筋规格">
          <Input placeholder="请输入钢筋规格" />
        </Form.Item>
        <Form.Item name="prestressSpec" label="预应力规格">
          <Input placeholder="请输入预应力规格" />
        </Form.Item>
        <Form.Item name="unitWeight" label="单位重量(kg)">
          <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入单位重量" />
        </Form.Item>
        <Form.Item name="batchNo" label="批次号">
          <Input placeholder="请输入批次号" />
        </Form.Item>
        <Form.Item name="technicalParams" label="技术参数">
          <TextArea rows={4} placeholder="请输入技术参数" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8, background: '#4F46E5', borderColor: '#4F46E5' }}>
            {isEdit ? '更新' : '创建'}
          </Button>
          <Button onClick={() => navigate('/products')} style={{ color: '#475569', borderColor: '#E2E8F0' }}>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductFormPage;
