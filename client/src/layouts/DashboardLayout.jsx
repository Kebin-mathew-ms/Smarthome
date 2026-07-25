import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useTheme } from '../hooks/useTheme';

const { Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#0b0f19' : '#f8fafc' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <TopNav />
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: isDarkMode ? '#111827' : '#ffffff',
            borderRadius: 12,
            minHeight: 280,
            border: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
