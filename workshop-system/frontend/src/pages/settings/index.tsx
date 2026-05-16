import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { changePassword } from '../../api/auth';

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次新密码输入不一致');
      return;
    }
    setLoading(true);
    try {
      await changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword });
      message.success('密码修改成功');
      form.resetFields();
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <Card
        title={<span style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>修改密码</span>}
        style={{
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
        styles={{ body: { padding: '24px 32px' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="oldPassword"
            label={<span style={{ color: '#475569' }}>原密码</span>}
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={<span style={{ color: '#475569' }}>新密码</span>}
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={<span style={{ color: '#475569' }}>确认新密码</span>}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
