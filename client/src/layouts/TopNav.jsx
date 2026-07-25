import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, SunOutlined, MoonOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ROUTES } from '../constants/routes';
import NotificationBell from '../components/common/NotificationBell';

const { Header } = Layout;
const { Text } = Typography;

const TopNav = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate(ROUTES.PROFILE)
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: logout
    }
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: isDarkMode ? '#141414' : '#ffffff',
        borderBottom: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 99
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: 16 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <NotificationBell />

        <Button
          type="text"
          icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        />

        {user && (
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#2563eb' }} icon={<UserOutlined />}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <Text strong style={{ fontSize: 13 }}>{user.full_name || user.email}</Text>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'capitalize' }}>{user.role}</Text>
              </div>
            </Space>
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default TopNav;
