import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Space, Descriptions, Input, Button, Upload, message } from 'antd';
import { Ticket, Send, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { experienceService } from '../../services/experience.service';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const res = await experienceService.getComplaintById(id);
      if (res.success) setComplaint(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', replyText.trim());
      replyFiles.forEach(f => formData.append('complaint_attachments', f));

      await experienceService.addComplaintMessage(id, formData);
      message.success('Response posted to ticket');
      setReplyText('');
      setReplyFiles([]);
      fetchComplaint();
    } catch (err) {
      message.error(err.message || 'Failed to post message');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Support Ticket Details" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div>
        <PageHeader title="Ticket Not Found" />
        <Button onClick={() => navigate(ROUTES.COMPLAINTS)}>Back to Complaints</Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { title: 'Support Tickets', path: ROUTES.COMPLAINTS },
    { title: complaint.ticket_number }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={`Ticket ${complaint.ticket_number}: ${complaint.subject}`}
        subtitle={`Category: ${complaint.complaint_category} | Priority: ${complaint.priority}`}
        extra={<Tag color={complaint.status === 'Resolved' ? 'green' : 'processing'} style={{ fontSize: 14, padding: '4px 12px' }}>{complaint.status}</Tag>}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Messages Thread */}
          <Card title="Support Ticket Conversation History" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
            {complaint.messages && complaint.messages.map(msg => (
              <div key={msg.id} style={{ padding: 14, background: '#f8fafc', borderRadius: 10, marginBottom: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>{msg.sender_name} ({msg.sender_role})</strong>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{formatDate(msg.created_at)}</span>
                </div>
                <Paragraph style={{ margin: 0, color: '#334155' }}>{msg.message}</Paragraph>

                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {msg.attachments.map(att => (
                      <a key={att.id} href={att.file_path} target="_blank" rel="noreferrer" style={{ fontSize: 12, marginRight: 12 }}>
                        <FileText size={14} style={{ marginRight: 4 }} /> View Attachment
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Reply Box */}
            <div style={{ marginTop: 20 }}>
              <Input.TextArea
                rows={3}
                placeholder="Post response to support team..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Upload beforeUpload={f => { setReplyFiles(prev => [...prev, f]); return false; }} multiple>
                  <Button icon={<FileText size={14} />}>Attach Evidence</Button>
                </Upload>
                <Button type="primary" icon={<Send size={14} />} loading={submitting} onClick={handleSendReply}>
                  Send Response
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Ticket Information" bordered={false} style={{ borderRadius: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Ticket #">{complaint.ticket_number}</Descriptions.Item>
              <Descriptions.Item label="Booking #">{complaint.booking_number}</Descriptions.Item>
              <Descriptions.Item label="Category">{complaint.complaint_category}</Descriptions.Item>
              <Descriptions.Item label="Priority">{complaint.priority}</Descriptions.Item>
              <Descriptions.Item label="Status">{complaint.status}</Descriptions.Item>
              <Descriptions.Item label="Opened Date">{formatDate(complaint.created_at)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Footer />
    </div>
  );
};

export default ComplaintDetailsPage;
