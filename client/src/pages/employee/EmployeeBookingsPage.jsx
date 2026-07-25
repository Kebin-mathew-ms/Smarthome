import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Button, Typography, message } from 'antd';
import { Briefcase, Eye, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import StatusBadge from '../../components/common/StatusBadge';
import Footer from '../../layouts/Footer';
import { employeeService } from '../../services/employee.service';

const { Title, Text } = Typography;

const EmployeeBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const res = await employeeService.getAssignedBookings({ status: statusParam });
      if (res.success) setBookings(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to fetch assigned bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const columns = [
    { title: 'Booking #', dataIndex: 'booking_number', key: 'booking_number', render: t => <strong style={{ color: '#2563eb' }}>{t}</strong> },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name', render: s => <strong>{s}</strong> },
    { title: 'Customer Name', dataIndex: 'customer_name', key: 'customer_name' },
    { title: 'Schedule Date & Time', key: 'schedule', render: (_, r) => `${r.scheduled_date} (${r.scheduled_time})` },
    { title: 'Status', dataIndex: 'booking_status', key: 'booking_status', render: s => <StatusBadge status={s} /> },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => (
        <Button type="primary" size="small" onClick={() => navigate(`/employee/bookings/${r.id}`)}>
          View Job
        </Button>
      )
    }
  ];

  const tabItems = [
    { key: 'ALL', label: 'All Jobs' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'Work Started', label: 'In Progress' },
    { key: 'Completed', label: 'Completed' }
  ];

  return (
    <div>
      <PageHeader
        title="My Assigned Field Jobs"
        subtitle="Manage assigned service bookings, check-in, update work status, and collect customer signatures."
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 16 }} />
        <AppTable columns={columns} dataSource={bookings} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Footer />
    </div>
  );
};

export default EmployeeBookingsPage;
