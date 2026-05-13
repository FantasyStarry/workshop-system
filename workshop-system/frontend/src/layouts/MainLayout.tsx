import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ProductOutlined,
  NodeIndexOutlined,
  QrcodeOutlined,
  LineChartOutlined,
  UserOutlined,
  ApartmentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { key: '/', icon: <HomeOutlined />, label: '仪表盘' },
  { key: '/orders', icon: <FileTextOutlined />, label: '订单管理' },
  { key: '/products', icon: <ProductOutlined />, label: '产品库' },
  { key: '/stages', icon: <NodeIndexOutlined />, label: '环节管理' },
  { key: '/qrcodes', icon: <QrcodeOutlined />, label: '二维码管理' },
  { key: '/progress', icon: <LineChartOutlined />, label: '进度追踪' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理', roles: ['admin'] },
  { key: '/depts', icon: <ApartmentOutlined />, label: '部门管理', roles: ['admin'] },
  { key: '/positions', icon: <TeamOutlined />, label: '岗位管理', roles: ['admin'] },
  { key: '/roles', icon: <SafetyOutlined />, label: '角色管理', roles: ['admin'] },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useUserStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const isAdmin = userInfo?.roleCodes?.includes('ADMIN') || userInfo?.roleIds === '1';

  const filteredMenuItems = menuItems
    .filter((item) => !item.roles || item.roles.some((r) => isAdmin))
    .map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
    }));

  const selectedKeys = [location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '修改密码',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {collapsed ? '车间' : '车间管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={filteredMenuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 9,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <span>{userInfo?.realName || userInfo?.username || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
