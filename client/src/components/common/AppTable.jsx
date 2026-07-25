import React from 'react';
import { Table } from 'antd';

const AppTable = ({ columns, dataSource, loading = false, rowKey = 'id', pagination = false, onChange, scroll = { x: 800 }, ...props }) => {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
      onChange={onChange}
      scroll={scroll}
      bordered={false}
      size="middle"
      {...props}
    />
  );
};

export default AppTable;
