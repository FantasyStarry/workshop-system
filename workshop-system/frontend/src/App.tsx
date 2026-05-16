import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AuthGuard from './components/AuthGuard';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import OrderListPage from './pages/order/list';
import OrderFormPage from './pages/order/form';
import OrderDetailPage from './pages/order/detail';
import ProductListPage from './pages/product/list';
import ProductFormPage from './pages/product/form';
import ProductDetailPage from './pages/product/detail';
import StagePage from './pages/stage';
import QrCodePage from './pages/qrcode';
import ProgressPage from './pages/progress';
import UserListPage from './pages/user/list';
import DeptPage from './pages/dept';
import RolePage from './pages/role';
import PositionPage from './pages/position';
import SettingsPage from './pages/settings';

const themeConfig = {
  token: {
    colorPrimary: '#4F46E5',
    colorSuccess: '#059669',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorInfo: '#0284C7',
    colorBgLayout: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',
    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#94A3B8',
    colorTextQuaternary: '#CBD5E1',
    fontFamily: "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 14,
    controlHeight: 36,
    controlHeightSM: 28,
    controlHeightLG: 44,
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    lineHeight: 1.6,
    wireframe: false,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
  },
  components: {
    Card: {
      paddingLG: 20,
    },
    Table: {
      headerBg: '#F1F5F9',
      headerColor: '#475569',
      rowHoverBg: '#EEF2FF',
      borderColor: '#F1F5F9',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemHoverBg: '#1E293B',
      darkItemSelectedBg: 'rgba(79, 70, 229, 0.15)',
      darkItemColor: '#94A3B8',
      darkItemHoverColor: '#F1F5F9',
      darkItemSelectedColor: '#FFFFFF',
      darkItemActiveBg: 'rgba(79, 70, 229, 0.15)',
    },
    Button: {
      primaryShadow: '0 1px 2px rgba(79, 70, 229, 0.25)',
      defaultBorderColor: '#E2E8F0',
      defaultColor: '#475569',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
    },
    Input: {
      activeBorderColor: '#4F46E5',
      hoverBorderColor: '#818CF8',
      activeShadow: '0 0 0 2px rgba(79, 70, 229, 0.12)',
    },
    Select: {
      activeBorderColor: '#4F46E5',
      hoverBorderColor: '#818CF8',
      activeShadow: '0 0 0 2px rgba(79, 70, 229, 0.12)',
    },
    Tag: {
      defaultBg: '#F1F5F9',
      defaultColor: '#475569',
    },
    Steps: {
      colorPrimary: '#4F46E5',
    },
    Timeline: {
      dotBg: '#4F46E5',
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 28,
    },
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="orders/:id/edit" element={<OrderFormPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="stages" element={<StagePage />} />
            <Route path="qrcodes" element={<QrCodePage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="users" element={<UserListPage />} />
            <Route path="depts" element={<DeptPage />} />
            <Route path="roles" element={<RolePage />} />
            <Route path="positions" element={<PositionPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
