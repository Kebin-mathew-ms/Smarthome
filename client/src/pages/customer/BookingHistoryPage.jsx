import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Typography, Tag, Space, Button, message } from 'antd';
import { Calendar, Building2, Briefcase, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { bookingService } from '../../services/booking.service';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const res = await bookingService.getUserBookings({ status: statusParam, limit: 50 });
      if (res.success) {
        setBookings(res.data.items);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const columns = [
    {
      title: 'Booking Number',
      dataIndex: 'booking_number',
      key: 'booking_number',
      render: (text, r) => (
        <div>
          <strong style={{ color: '#2563eb', display: 'block' }}>{text}</strong>
          <span style={{ fontSize: 12, color: '#64748b' }}>{formatDate(r.created_at)}</span>
        </div>
      )
    },
    {
      title: 'Service & Company',
      key: 'service',
      render: (_, r) => (
        <div>
          <strong style={{ display: 'block' }}>{r.service_name}</strong>
          <span style={{ fontSize: 12, color: '#64748b' }}>Provider: {r.company_name}</span>
        </div>
      )
    },
    {
      title: 'Schedule Date & Time',
      key: 'schedule',
      render: (_, r) => (
        <div>
          <span>{r.scheduled_date}</span>
          <span style={{ display: 'block', fontSize: 12, color: '#64748b' }}>{r.scheduled_time}</span>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'booking_status',
      key: 'booking_status',
      render: s => <StatusBadge status={s} />
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: p => <strong style={{ color: '#16a34a', fontSize: 15 }}>${Number(p).toFixed(2)}</strong>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => (
        <AppButton icon={<Eye size={16} />} size="small" onClick={() => navigate(`/bookings/${r.id}`)}>
          Details
        </AppButton>
      )
    }
  ];

  const tabItems = [
    { key: 'ALL', label: 'All Bookings' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Confirmed', label: 'Confirmed' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' }
  ];

  return (
    <div>
      <PageHeader
        title="My Bookings History"
        subtitle="Track active service requests, technician assignments, and past bookings."
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 16 }} />

        <AppTable
          columns={columns}
          dataSource={bookings}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Footer />
    </div>
  );
};

export default BookingHistoryPage;
