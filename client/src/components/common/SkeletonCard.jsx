import React from 'react';
import { Card, Skeleton } from 'antd';

const SkeletonCard = ({ rows = 3 }) => {
  return (
    <Card bordered={false}>
      <Skeleton active paragraph={{ rows }} />
    </Card>
  );
};

export default SkeletonCard;
