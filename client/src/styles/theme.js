import { theme } from 'antd';

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#2563eb', // Royal blue
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    borderRadius: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorBorder: '#e2e8f0'
  },
  components: {
    Button: {
      fontWeight: 600,
      controlHeight: 40,
      borderRadius: 8
    },
    Card: {
      borderRadiusLG: 12
    },
    Table: {
      borderRadius: 8,
      headerBg: '#f1f5f9'
    }
  }
};

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#3b82f6',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#60a5fa',
    borderRadius: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    colorBgContainer: '#111827',
    colorBgLayout: '#0b0f19',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    colorBorder: '#1e293b'
  },
  components: {
    Button: {
      fontWeight: 600,
      controlHeight: 40,
      borderRadius: 8
    },
    Card: {
      borderRadiusLG: 12
    },
    Table: {
      borderRadius: 8,
      headerBg: '#1e293b'
    }
  }
};
