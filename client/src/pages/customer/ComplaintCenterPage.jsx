import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Select, Input, Button, Upload, Space, Typography, message } from 'antd';
import { Ticket, Plus, Search, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import AppModal from '../../components/common/AppModal';
import FormField from '../../components/common/FormField';
import Footer from '../../layouts/Footer';
import { experienceService } from '../../services/experience.service';
import { bookingService } from '../../services/booking.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;
const { Title, Text } = Typography;

const categories = [
  'Poor Work Quality',
  'Late Arrival',
  'Payment Issue',
  'Employee Behaviour',
  'Damage',
  'Warranty Claim',
  'Other'
];

const ComplaintCenterPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cmpRes = await experienceService.getComplaints();
      if (cmpRes.success) setComplaints(cmpRes.data);

      const bkRes = await bookingService.getUserBookings({ limit: 50 });
      if (bkRes.success) {
        setBookings(bkRes.data.items);
        if (bkRes.data.items.length > 0) setBookingId(bkRes.data.items[0].id);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async () => {
    if (!bookingId || !subject.trim() || !description.trim()) {
      message.warning('Please select a booking and provide subject and description.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('booking_id', bookingId);
      formData.append('complaint_category', category);
      formData.append('priority', priority);
      formData.append('subject', subject.trim());
      formData.append('description', description.trim());

      files.forEach(f => {
        formData.append('complaint_attachments', f);
      });

      await experienceService.createComplaint(formData);
      message.success('Support complaint ticket opened successfully!');
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      setFiles([]);
      fetchData();
    } catch (err) {
      message.error(err.message || 'Failed to open support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Ticket Number',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (text, r) => (
        <div>
          <strong style={{ color: '#2563eb', display: 'block' }}>{text}</strong>
          <span style={{ fontSize: 11, color: '#64748b' }}>Booking #{r.booking_number}</span>
        </div>
      )
    },
    {
      title: 'Subject & Category',
      key: 'subject',
      render: (_, r) => (
        <div>
          <strong style={{ display: 'block' }}>{r.subject}</strong>
          <Tag color="blue" style={{ fontSize: 11 }}>{r.complaint_category}</Tag>
        </div>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: p => (
        <Tag color={p === 'Critical' ? 'red' : p === 'High' ? 'orange' : 'gold'}>{p}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: s => (
        <Tag color={s === 'Resolved' || s === 'Closed' ? 'green' : s === 'Open' ? 'processing' : 'warning'}>{s}</Tag>
      )
    },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: d => formatDate(d)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => (
        <Button size="small" onClick={() => navigate(`/complaints/${r.id}`)}>
          View Ticket
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Support Ticket & Complaint Center"
        subtitle="Lodge service issues, report damages, and communicate directly with support admins."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Open Support Ticket
          </AppButton>
        }
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <AppTable
          columns={columns}
          dataSource={complaints}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* New Complaint Modal */}
      <AppModal
        title="Open New Support Ticket"
        open={isModalOpen}
        onOk={handleCreateTicket}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
      >
        <div style={{ marginTop: 16 }}>
          <FormField label="Select Related Booking" required>
            <Select value={bookingId} onChange={setBookingId} style={{ width: '100%' }}>
              {bookings.map(b => (
                <Option key={b.id} value={b.id}>
                  #{b.booking_number} - {b.service_name} ({b.company_name})
                </Option>
              ))}
            </Select>
          </FormField>

          <Row gutter={12}>
            <Col span={12}>
              <FormField label="Complaint Category">
                <Select value={category} onChange={setCategory} style={{ width: '100%' }}>
                  {categories.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Priority">
                <Select value={priority} onChange={setPriority} style={{ width: '100%' }}>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Critical">Critical</Option>
                </Select>
              </FormField>
            </Col>
          </Row>

          <FormField label="Subject / Brief Summary" required>
            <Input placeholder="e.g. Technician arrived 2 hours late and left debris" value={subject} onChange={e => setSubject(e.target.value)} />
          </FormField>

          <FormField label="Detailed Issue Description" required>
            <Input.TextArea rows={4} placeholder="Describe exact details..." value={description} onChange={e => setDescription(e.target.value)} />
          </FormField>

          <FormField label="Attach Evidence Files / Screenshots">
            <Upload beforeUpload={f => { setFiles(prev => [...prev, f]); return false; }} multiple>
              <Button icon={<FileText size={14} />}>Select Files</Button>
            </Upload>
          </FormField>
        </div>
      </AppModal>

      <Footer />
    </div>
  );
};

export default ComplaintCenterPage;
