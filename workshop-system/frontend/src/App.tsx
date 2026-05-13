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

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
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
