import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Wrench } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const AuthLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#0b0f19' : '#f8fafc' }}>
      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 16px'
        }}
      >
        <div style={{ textCenter: 'center', marginBottom: 24, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              marginBottom: 12,
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Wrench size={28} />
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, tracking: '-0.02em' }}>
            Smart Home Care
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Maintenance & Service System
          </Text>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 440,
            background: isDarkMode ? '#111827' : '#ffffff',
            borderRadius: 16,
            padding: 32,
            boxShadow: isDarkMode
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
              : '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            border: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`
          }}
        >
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: 'transparent', padding: '16px 0 24px' }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          © {new Date().getFullYear()} Smart Home Care System. All rights reserved.
        </Text>
      </Footer>
    </Layout>
  );
};

export default AuthLayout;
