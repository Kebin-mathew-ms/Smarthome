import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const AppBreadcrumb = ({ items = [] }) => {
  return (
    <Breadcrumb style={{ marginBottom: 16 }}>
      {items.map((item, idx) => (
        <Breadcrumb.Item key={idx}>
          {item.path ? <Link to={item.path}>{item.title}</Link> : item.title}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
