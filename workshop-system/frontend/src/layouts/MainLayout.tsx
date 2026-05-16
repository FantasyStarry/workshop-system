import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
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
const { Text } = Typography;

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

  const sidebarWidth = collapsed ? 80 : 240;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* ── Sidebar ── */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          background: '#1e293b',
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            W
          </div>
          {!collapsed && (
            <Text
              style={{
                color: '#f1f5f9',
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              车间管理
            </Text>
          )}
        </div>

        {/* Navigation */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={filteredMenuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            paddingTop: 8,
          }}
        />
      </Sider>

      {/* ── Main Area ── */}
      <Layout style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 9,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 18,
              width: 40,
              height: 40,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }} size={10}>
              <Avatar
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  fontWeight: 500,
                }}
              />
              <Text style={{ color: '#374151', fontSize: 14 }}>
                {userInfo?.realName || userInfo?.username || '用户'}
              </Text>
            </Space>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 20,
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
