import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Select, Button, Space, Descriptions, Input, Tag, message } from 'antd';
import { MapPin, Clock, MessageSquare, CheckCircle, Navigation, PenTool } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import StatusBadge from '../../components/common/StatusBadge';
import SkeletonCard from '../../components/common/SkeletonCard';
import AppModal from '../../components/common/AppModal';
import Footer from '../../layouts/Footer';
import { volunteerService } from '../../services/volunteer.service';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const VolunteerBookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Change State
  const [currentStatus, setCurrentStatus] = useState('Scheduled');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Check-In State
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinNotes, setCheckinNotes] = useState('');

  // Signature Modal State
  const [isSigOpen, setIsSigOpen] = useState(false);
  const [savingSig, setSavingSig] = useState(false);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await volunteerService.getAssignedBookingById(id);
      if (res.success) {
        setBooking(res.data);
        setCurrentStatus(res.data.booking_status);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await volunteerService.updateBookingStatus(id, newStatus);
      message.success(`Task status updated to ${newStatus}`);
      setCurrentStatus(newStatus);
      fetchBooking();
    } catch (err) {
      message.error(err.message || 'Status update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      let lat = null;
      let lng = null;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // ignore location denial
        }
      }

      await volunteerService.checkIn({
        booking_id: id,
        latitude: lat,
        longitude: lng,
        notes: checkinNotes
      });

      message.success('GPS Check-In recorded!');
      fetchBooking();
    } catch (err) {
      message.error(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking.checkin) return;
    try {
      await volunteerService.checkOut({ checkin_id: booking.checkin.id, notes: 'Completed work' });
      message.success('Check-Out recorded!');
      fetchBooking();
    } catch (err) {
      message.error(err.message || 'Check-out failed');
    }
  };

  // Canvas Signature Methods
  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSavingSig(true);
    try {
      await volunteerService.saveCustomerSignature(id, dataUrl);
      message.success('Customer digital signature saved!');
      setIsSigOpen(false);
      fetchBooking();
    } catch (err) {
      message.error(err.message || 'Failed to save signature');
    } finally {
      setSavingSig(false);
    }
  };

  if (loading || !booking) {
    return (
      <div>
        <PageHeader title="Assignment Details" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  const breadcrumbItems = [
    { title: 'My Assigned Jobs', path: ROUTES.VOLUNTEER_BOOKINGS },
    { title: booking.booking_number }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={`Task #${booking.booking_number}`}
        subtitle={`${booking.service_name} for ${booking.customer_name}`}
        extra={
          <Space>
            <Button type="primary" icon={<MessageSquare size={16} />} onClick={() => navigate(`/chat/${booking.id}`)}>
              Open Chat Room
            </Button>
            <Button icon={<PenTool size={16} />} onClick={() => setIsSigOpen(true)}>
              Customer Signature
            </Button>
          </Space>
        }
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Status & GPS Check-In Control */}
          <Card title="Volunteer Action Center" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Work Status</label>
                <Select value={currentStatus} onChange={handleStatusChange} loading={updatingStatus} style={{ width: 180 }}>
                  <Option value="On The Way">On The Way</Option>
                  <Option value="Work Started">Work Started</Option>
                  <Option value="Work In Progress">Work In Progress</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>GPS Check-In</label>
                {booking.checkin && !booking.checkin.check_out_time ? (
                  <Button type="primary" danger onClick={handleCheckOut}>
                    Check-Out from Site
                  </Button>
                ) : (
                  <Button type="primary" icon={<Navigation size={14} />} loading={checkingIn} onClick={handleCheckIn}>
                    Check-In to Site
                  </Button>
                )}
              </div>
            </div>

            {booking.checkin && (
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, fontSize: 13 }}>
                <div><strong>Check-In Time:</strong> {formatDate(booking.checkin.check_in_time)}</div>
                {booking.checkin.check_out_time && <div><strong>Check-Out Time:</strong> {formatDate(booking.checkin.check_out_time)}</div>}
                {booking.checkin.latitude && <div><strong>GPS Coordinates:</strong> {booking.checkin.latitude}, {booking.checkin.longitude}</div>}
              </div>
            )}
          </Card>

          {/* Service Details & Requirements */}
          <Card title="Service Details & Requirements" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Service Details">
                <strong>{booking.service_name}</strong>
                {booking.package_name && <Tag color="blue" style={{ marginLeft: 8 }}>{booking.package_name}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Booking Price">
                <strong style={{ color: '#16a34a', fontSize: 16 }}>${Number(booking.total_amount).toFixed(2)}</strong>
              </Descriptions.Item>
              {booking.customizations && booking.customizations.length > 0 && (
                <Descriptions.Item label="Customer Requirements">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {booking.customizations.map(c => (
                      <Tag key={c.id} color="cyan">
                        {c.option_name}{c.quantity > 1 ? ` (x${c.quantity})` : ''}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Customer & Address Card */}
          <Card title="Customer & Address Information" bordered={false} style={{ borderRadius: 16 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Customer Name">{booking.customer_name}</Descriptions.Item>
              <Descriptions.Item label="Customer Phone">{booking.customer_phone}</Descriptions.Item>
              <Descriptions.Item label="Schedule Date & Time">{booking.scheduled_date} ({booking.scheduled_time})</Descriptions.Item>
              <Descriptions.Item label="Special Instructions">{booking.special_instructions || 'None provided'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Digital Customer Signature" bordered={false} style={{ borderRadius: 16 }}>
            {booking.signature ? (
              <div style={{ textAlign: 'center' }}>
                <img src={booking.signature.customer_signature} alt="sig" style={{ maxWidth: '100%', maxHeight: 120, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>Signed on {formatDate(booking.signature.signed_at)}</Text>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>No signature captured yet.</Text>
                <Button type="primary" icon={<PenTool size={14} />} onClick={() => setIsSigOpen(true)}>Collect Signature</Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Signature Canvas Modal */}
      <AppModal
        title="Collect Customer Digital Signature"
        open={isSigOpen}
        onOk={handleSaveSignature}
        onCancel={() => setIsSigOpen(false)}
        confirmLoading={savingSig}
      >
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <canvas
            ref={canvasRef}
            width={340}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ border: '2px dashed #2563eb', borderRadius: 12, background: '#ffffff', cursor: 'crosshair', touchAction: 'none' }}
          />
          <div style={{ marginTop: 8 }}>
            <Button size="small" onClick={clearCanvas}>Clear Canvas</Button>
          </div>
        </div>
      </AppModal>

      <Footer />
    </div>
  );
};

export default VolunteerBookingDetailsPage;
