import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Tooltip } from 'antd';
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
import { isAdmin } from '../utils/permission';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
  group?: string;
}

const menuItems: MenuItem[] = [
  { key: '/', icon: <HomeOutlined />, label: '仪表盘', group: '概览' },
  { key: '/orders', icon: <FileTextOutlined />, label: '订单管理', group: '业务' },
  { key: '/products', icon: <ProductOutlined />, label: '产品库', group: '业务' },
  { key: '/stages', icon: <NodeIndexOutlined />, label: '环节管理', group: '业务' },
  { key: '/qrcodes', icon: <QrcodeOutlined />, label: '二维码管理', group: '业务' },
  { key: '/progress', icon: <LineChartOutlined />, label: '进度追踪', group: '业务' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理', roles: ['admin'], group: '系统' },
  { key: '/depts', icon: <ApartmentOutlined />, label: '部门管理', roles: ['admin'], group: '系统' },
  { key: '/positions', icon: <TeamOutlined />, label: '岗位管理', roles: ['admin'], group: '系统' },
  { key: '/roles', icon: <SafetyOutlined />, label: '角色管理', roles: ['admin'], group: '系统' },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useUserStore();

  const adminRoleCodes = userInfo?.roleCodes || '';
  const roleIds = userInfo?.roleIds;
  const isAdminUser = isAdmin(adminRoleCodes, roleIds);

  const filteredMenuItems = menuItems
    .filter((item) => !item.roles || item.roles.some((r) => isAdminUser))
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
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const sidebarWidth = collapsed ? 72 : 248;

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={248}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          background: '#0F172A',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>
            <span style={styles.logoText}>W</span>
          </div>
          {!collapsed && (
            <div style={styles.logoInfo}>
              <Text style={styles.logoTitle}>车间管理</Text>
              <Text style={styles.logoSub}>Workshop</Text>
            </div>
          )}
        </div>

        <div style={styles.menuWrapper}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            items={filteredMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: 'transparent',
              borderRight: 'none',
              padding: '8px 12px',
            }}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: sidebarWidth, transition: 'margin-left 200ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <Header
          style={{
            padding: '0 28px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
            position: 'sticky',
            top: 0,
            zIndex: 9,
            borderBottom: '1px solid #F1F5F9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Tooltip title={collapsed ? '展开菜单' : '收起菜单'} placement="right">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 16,
                width: 36,
                height: 36,
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            />
          </Tooltip>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Space
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 10,
                transition: 'background 150ms',
              }}
              size={10}
              className="user-dropdown-trigger"
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              />
              <Text style={{ color: '#334155', fontSize: 14, fontWeight: 500 }}>
                {userInfo?.realName || userInfo?.username || '用户'}
              </Text>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            padding: 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  logoArea: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0 20px',
    userSelect: 'none',
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '-0.5px',
  },
  logoInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  logoTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '0.3px',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
  logoSub: {
    color: '#475569',
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: '1px',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  menuWrapper: {
    flex: 1,
    overflow: 'auto',
    paddingTop: 4,
  },
};

export default MainLayout;
