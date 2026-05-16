import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
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

      try {
        const infoRes = await getUserInfo();
        setUserInfo(infoRes.data);
      } catch {
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
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoMark}>
            <span style={styles.logoLetter}>W</span>
          </div>
          <h1 style={styles.brandTitle}>车间管理系统</h1>
          <p style={styles.brandSubtitle}>Workshop Management System</p>
          <div style={styles.divider} />
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>订单全流程追踪</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>生产环节精细管控</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>二维码扫码流转</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>质检记录可追溯</span>
            </div>
          </div>
        </div>
        <div style={styles.decorCircle1} />
        <div style={styles.decorCircle2} />
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>登录</h2>
            <p style={styles.formDesc}>请输入您的账号信息</p>
          </div>

          <Form name="login" onFinish={onFinish} size="large" style={styles.form}>
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                placeholder="用户名"
                style={styles.input}
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                placeholder="密码"
                style={styles.input}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={styles.submitBtn}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    background: '#F8FAFC',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 0,
  },
  brandContent: {
    position: 'relative',
    zIndex: 2,
    padding: '0 60px',
    maxWidth: 480,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: '-0.5px',
  },
  brandTitle: {
    color: '#F1F5F9',
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    marginBottom: 8,
    lineHeight: 1.2,
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: 400,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    marginBottom: 0,
  },
  divider: {
    width: 40,
    height: 3,
    background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
    borderRadius: 2,
    margin: '32px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4F46E5',
    flexShrink: 0,
  },
  featureText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: 400,
  },
  decorCircle1: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)',
    zIndex: 1,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, transparent 70%)',
    zIndex: 1,
  },
  rightPanel: {
    width: 480,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 60px',
    background: '#FFFFFF',
    boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.04)',
    flexShrink: 0,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 340,
  },
  formHeader: {
    marginBottom: 36,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: '-0.3px',
  },
  formDesc: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: 400,
    marginBottom: 0,
  },
  form: {
    width: '100%',
  },
  input: {
    height: 46,
    borderRadius: 10,
    fontSize: 15,
  },
  submitBtn: {
    height: 46,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    marginTop: 8,
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  },
};

export default LoginPage;
