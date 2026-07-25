import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ tip = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%'
        }}
      >
        <Spin size="large" tip={tip}>
          <span />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <Spin size="large" tip={tip}>
        <span />
      </Spin>
    </div>
  );
};

export default LoadingSpinner;

