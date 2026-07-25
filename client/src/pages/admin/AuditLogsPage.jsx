import React, { useState, useEffect } from 'react';
import { Input, Space, message, Tag } from 'antd';
import { Search, Activity } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import ExportCSVButton from '../../components/common/ExportCSVButton';
import { adminService } from '../../services/admin.service';
import { formatDateTime } from '../../utils/formatters';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        page,
        limit: pageSize,
        action: actionFilter || undefined,
        table_name: tableFilter || undefined
      });
      if (res.success) {
        setLogs(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, pageSize, actionFilter, tableFilter]);

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Space>
          <Activity size={16} style={{ color: '#2563eb' }} />
          <strong style={{ color: '#0f172a' }}>{action}</strong>
        </Space>
      )
    },
    {
      title: 'Performed By',
      key: 'user',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{r.user_name}</span>
          {r.user_email && <span style={{ fontSize: 12, color: '#64748b' }}>{r.user_email}</span>}
        </div>
      )
    },
    {
      title: 'Target Entity',
      dataIndex: 'table_name',
      key: 'table_name',
      render: (t) => <Tag color="geekblue">{t}</Tag>
    },
    {
      title: 'Record ID',
      dataIndex: 'record_id',
      key: 'record_id',
      render: (id) => id ? `#${id}` : 'N/A'
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip) => ip || '127.0.0.1'
    },
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDateTime(date)
    }
  ];

  return (
    <div>
      <PageHeader
        title="Audit Logs & Compliance"
        subtitle="Complete record of all administrative operations, entity modifications and security events."
        extra={<ExportCSVButton data={logs} filename="audit-logs-export.csv" />}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Filter by action name (e.g., Company Created)..."
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />

        <Input
          placeholder="Filter by table name (e.g., companies)..."
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          style={{ width: 220 }}
          allowClear
        />
      </div>

      <AppTable
        columns={columns}
        dataSource={logs}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          }
        }}
      />
    </div>
  );
};

export default AuditLogsPage;
