import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#0b0f19' : '#f8fafc' }}>
      {user && <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />}
      <Layout>
        <TopNav collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Content
          style={{
            margin: user ? '24px' : '0',
            padding: user ? '24px' : '0',
            background: isDarkMode ? '#111827' : '#ffffff',
            borderRadius: user ? 12 : 0,
            minHeight: 280,
            border: user ? `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}` : 'none'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
