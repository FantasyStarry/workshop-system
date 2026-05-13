import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, getUserInfo } from '../../api/auth';
import { useUserStore } from '../../store/userStore';
import type { LoginParams } from '../../types/user';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUserInfo } = useUserStore();

  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    try {
      const res = await login(values);
      setToken(res.data.token);

      // 获取完整用户信息（含角色数据，用于侧边栏权限控制）
      try {
        const infoRes = await getUserInfo();
        setUserInfo(infoRes.data);
      } catch {
        // 即使获取用户信息失败也不阻断登录流程
        setUserInfo({
          id: Number(res.data.userId),
          username: res.data.username,
          realName: res.data.realName,
          phone: '',
          deptId: 0,
          deptName: '',
          roleIds: '',
          roleCodes: '',
        });
      }
      message.success('登录成功');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 32, fontSize: 24, color: '#333' }}>车间管理系统</h2>
        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
