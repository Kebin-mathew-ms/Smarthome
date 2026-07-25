import React from 'react';
import { Tag } from 'antd';

const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'default',
  suspended: 'error'
};

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  const color = statusColors[normalized] || 'default';
  const label = status ? status.toUpperCase() : 'UNKNOWN';

  return <Tag color={color}>{label}</Tag>;
};

export default StatusBadge;
