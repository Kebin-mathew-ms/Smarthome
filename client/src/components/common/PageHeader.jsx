import React from 'react';
import { Typography, Space } from 'antd';

const { Title, Text } = Typography;

const PageHeader = ({ title, subtitle, extra }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}
    >
      <div>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && <Text type="secondary">{subtitle}</Text>}
      </div>
      {extra && <Space>{extra}</Space>}
    </div>
  );
};

export default PageHeader;
