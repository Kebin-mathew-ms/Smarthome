import React from 'react';
import { Card } from 'antd';

const AppCard = ({ title, extra, children, loading = false, className, style, ...props }) => {
  return (
    <Card
      title={title}
      extra={extra}
      loading={loading}
      className={className}
      style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', ...style }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default AppCard;
