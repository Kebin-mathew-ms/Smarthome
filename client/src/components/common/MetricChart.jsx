import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const MetricChart = ({ title, subtitle, data = [] }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card title={title} bordered={false}>
      {subtitle && <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>{subtitle}</Text>}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180, paddingTop: 20 }}>
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <Text strong style={{ fontSize: 12, marginBottom: 4 }}>{item.value}</Text>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(heightPercent, 8)}%`,
                  backgroundColor: item.color || '#2563eb',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease'
                }}
              />
              <Text type="secondary" style={{ fontSize: 11, marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {item.label}
              </Text>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MetricChart;
