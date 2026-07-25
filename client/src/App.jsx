import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as AntApp } from 'antd';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineNotifier from './components/common/OfflineNotifier';
import './styles/global.css';

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AntApp>
            <AuthProvider>
              <AppRouter />
              <OfflineNotifier />
            </AuthProvider>
          </AntApp>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
