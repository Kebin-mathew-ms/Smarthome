import React, { useState, useEffect } from 'react';
import { Card, Input, Table, Tag, Typography, message } from 'antd';
import { Search, Activity } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import Footer from '../../layouts/Footer';
import { analyticsService } from '../../services/analytics.service';
import { formatDate } from '../../utils/formatters';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getActivityLogs({ page, limit: 15, search });
      if (res.success) {
        setLogs(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  const columns = [
    { title: 'Timestamp', dataIndex: 'created_at', key: 'created_at', render: d => formatDate(d) },
    { title: 'User Email / Name', key: 'user', render: (_, r) => <strong>{r.user_name || r.user_email || 'System'}</strong> },
    { title: 'Action / Activity Logged', dataIndex: 'activity', key: 'activity', render: a => <Tag color="blue">{a}</Tag> },
    { title: 'IP Address', dataIndex: 'ip_address', key: 'ip_address', render: ip => ip || 'N/A' }
  ];

  return (
    <div>
      <PageHeader
        title="Security & System Activity Logs"
        subtitle="Immutable audit trail recording administrative actions, booking changes, and security events."
      />

      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search activity logs by action, user email, or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 340 }}
          allowClear
        />
      </Card>

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <AppTable
          columns={columns}
          dataSource={logs}
          loading={loading}
          pagination={{
            current: page,
            pageSize: 15,
            total,
            onChange: p => setPage(p)
          }}
        />
      </Card>

      <Footer />
    </div>
  );
};

export default ActivityLogsPage;
