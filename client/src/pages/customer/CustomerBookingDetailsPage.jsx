import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Timeline, Typography, Tag, Space, Descriptions, Button, DatePicker, Select, Input, message } from 'antd';
import { Clock, MapPin, Building2, User, Phone, CheckCircle2, AlertCircle, XCircle, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import StatusBadge from '../../components/common/StatusBadge';
import SkeletonCard from '../../components/common/SkeletonCard';
import AppModal from '../../components/common/AppModal';
import Footer from '../../layouts/Footer';
import { bookingService } from '../../services/booking.service';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;

const timeSlots = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

const CustomerBookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reschedule Modal State
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState(dayjs().add(1, 'day'));
  const [newTime, setNewTime] = useState(timeSlots[0]);
  const [rescheduling, setRescheduling] = useState(false);

  // Cancel Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookingById(id);
      if (res.success) {
        setBooking(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleRescheduleSubmit = async () => {
    setRescheduling(true);
    try {
      const res = await bookingService.rescheduleBooking(id, newDate.format('YYYY-MM-DD'), newTime);
      if (res.success) {
        message.success('Booking rescheduled successfully');
        setIsRescheduleOpen(false);
        fetchBooking();
      }
    } catch (err) {
      message.error(err.message || 'Failed to reschedule booking');
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancelSubmit = async () => {
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(id, cancelReason);
      if (res.success) {
        message.success('Booking cancelled successfully');
        setIsCancelOpen(false);
        fetchBooking();
      }
    } catch (err) {
      message.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Booking Details" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <PageHeader title="Booking Not Found" />
        <Button onClick={() => navigate(ROUTES.BOOKINGS)}>Back to My Bookings</Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { title: 'My Bookings', path: ROUTES.BOOKINGS },
    { title: booking.booking_number }
  ];

  const canModify = !['Completed', 'Cancelled', 'Rejected'].includes(booking.booking_status);
  const isChatAllowed = booking.booking_status !== 'Pending' && booking.booking_status !== 'Cancelled' && booking.booking_status !== 'Rejected';

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={`Booking #${booking.booking_number}`}
        subtitle={`Scheduled for ${booking.scheduled_date} (${booking.scheduled_time})`}
        extra={
          <Space>
            {isChatAllowed && (
              <AppButton type="primary" icon={<MessageSquare size={16} />} onClick={() => navigate(`/chat/${booking.id}`)}>
                Open Chat & Work Updates
              </AppButton>
            )}
            {canModify && (
              <>
                <Button onClick={() => setIsRescheduleOpen(true)}>Reschedule</Button>
                <Button danger onClick={() => setIsCancelOpen(true)}>Cancel Booking</Button>
              </>
            )}
          </Space>
        }
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Booking Status Timeline */}
          <Card title="Live Booking Timeline & Status History" bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
            <div style={{ padding: '12px 0' }}>
              <Timeline
                items={booking.history.map(item => ({
                  color: item.status === 'Completed' ? 'green' : item.status === 'Cancelled' ? 'red' : 'blue',
                  children: (
                    <div>
                      <strong style={{ fontSize: 14 }}>{item.status}</strong>
                      <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>{formatDate(item.created_at)} ({item.changed_by || 'System'})</span>
                      {item.remarks && <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>{item.remarks}</Text>}
                    </div>
                  )
                }))}
              />
            </div>
          </Card>

          {/* Service & Package Details */}
          <Card title="Service Specifications & Financial Summary" bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Service">{booking.service_name}</Descriptions.Item>
              <Descriptions.Item label="Package">{booking.package_name || 'Standard Offering'}</Descriptions.Item>
              <Descriptions.Item label="Provider">{booking.company_name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Current Status"><StatusBadge status={booking.booking_status} /></Descriptions.Item>
              <Descriptions.Item label="Payment Method">{booking.payment_method}</Descriptions.Item>
              <Descriptions.Item label="Payment Status"><StatusBadge status={booking.payment_status} /></Descriptions.Item>
              
              {booking.customizations && booking.customizations.length > 0 && (
                <Descriptions.Item label="Selected Customizations" span={2}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {booking.customizations.map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 13 }}>
                        <span>
                          <Tag color="cyan">{c.group_name}</Tag>
                          <strong>{c.option_name}</strong>
                          {c.quantity > 1 && ` x ${c.quantity}`}
                        </span>
                        <span style={{ color: Number(c.total_price) === 0 ? '#16a34a' : '#475569' }}>
                          {Number(c.total_price) === 0 ? 'Included' : `$${Number(c.total_price).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Subtotal">${Number(booking.subtotal).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Tax (10%)">${Number(booking.tax_amount).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Total Amount"><strong style={{ color: '#16a34a', fontSize: 18 }}>${Number(booking.total_amount).toFixed(2)}</strong></Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Assigned Technicians */}
          <Card title="Assigned Technicians" bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
            {booking.employees && booking.employees.length > 0 ? (
              booking.employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {emp.employee_name.charAt(0)}
                  </div>
                  <div>
                    <strong style={{ display: 'block' }}>{emp.employee_name}</strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{emp.designation} ({emp.phone})</span>
                  </div>
                </div>
              ))
            ) : (
              <Text type="secondary">No technicians assigned yet by provider.</Text>
            )}
          </Card>

          {/* Dispatch Address Card */}
          {booking.address && (
            <Card title="Dispatch Address" bordered={false} style={{ borderRadius: 16 }}>
              <strong style={{ display: 'block' }}>{booking.address.contact_person} ({booking.address.phone})</strong>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                {booking.address.house_name}, {booking.address.street}, {booking.address.city}, {booking.address.state} - {booking.address.postal_code}
              </Text>
            </Card>
          )}
        </Col>
      </Row>

      {/* Reschedule Modal */}
      <AppModal
        title="Reschedule Booking"
        open={isRescheduleOpen}
        onOk={handleRescheduleSubmit}
        onCancel={() => setIsRescheduleOpen(false)}
        confirmLoading={rescheduling}
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>New Date</label>
            <DatePicker value={newDate} onChange={setNewDate} style={{ width: '100%' }} disabledDate={d => d && d.isBefore(dayjs(), 'day')} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>New Time Slot</label>
            <Select value={newTime} onChange={setNewTime} style={{ width: '100%' }}>
              {timeSlots.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </div>
        </div>
      </AppModal>

      {/* Cancel Modal */}
      <AppModal
        title="Cancel Booking Request"
        open={isCancelOpen}
        onOk={handleCancelSubmit}
        onCancel={() => setIsCancelOpen(false)}
        confirmLoading={cancelling}
      >
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Reason for Cancellation</label>
          <Input.TextArea rows={3} placeholder="Please provide reason..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
        </div>
      </AppModal>

      <Footer />
    </div>
  );
};

export default CustomerBookingDetailsPage;
