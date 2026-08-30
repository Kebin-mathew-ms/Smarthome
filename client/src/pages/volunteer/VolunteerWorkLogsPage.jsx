import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Typography, Tag, message } from 'antd';
import { FileText, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppModal from '../../components/common/AppModal';
import FormField from '../../components/common/FormField';
import Footer from '../../layouts/Footer';
import { volunteerService } from '../../services/volunteer.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;
const { Title, Text } = Typography;

const VolunteerWorkLogsPage = () => {
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [workSummary, setWorkSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      const fetchDetails = async () => {
        setDetailsLoading(true);
        try {
          const res = await volunteerService.getAssignedBookingById(bookingId);
          if (res.success) {
            setSelectedBookingDetails(res.data);
          }
        } catch (err) {
          console.error('Failed to load booking details', err);
        } finally {
          setDetailsLoading(false);
        }
      };
      fetchDetails();
    } else {
      setSelectedBookingDetails(null);
    }
  }, [bookingId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await volunteerService.getAssignedBookings({});
      if (res.success) {
        setAssignedBookings(res.data);
        if (res.data.length > 0) setBookingId(res.data[0].id);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async () => {
    if (!bookingId || !workSummary.trim()) {
      message.warning('Please select a booking and enter work summary.');
      return;
    }

    setSubmitting(true);
    try {
      await volunteerService.createWorkLog(bookingId, workSummary.trim());
      message.success('Work log entry posted!');
      setIsModalOpen(false);
      setWorkSummary('');
    } catch (err) {
      message.error(err.message || 'Failed to post work log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Volunteer Work Logs"
        subtitle="Log task summaries, community help details, and job progress notes."
        extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>Create Work Log Entry</Button>}
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Text type="secondary">Select a task from your assigned tasks list to record work notes.</Text>
      </Card>

      <AppModal
        title="Create Work Log Entry"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
      >
        <div style={{ marginTop: 16 }}>
          <FormField label="Select Assigned Task" required>
            <Select value={bookingId} onChange={setBookingId} style={{ width: '100%' }}>
              {assignedBookings.map(b => (
                <Option key={b.id} value={b.id}>
                  #{b.booking_number} - {b.service_name} ({b.customer_name})
                </Option>
              ))}
            </Select>
          </FormField>

          {detailsLoading ? (
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Loading task requirements...</p>
          ) : selectedBookingDetails && (
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}><strong>Task:</strong> {selectedBookingDetails.service_name} {selectedBookingDetails.package_name && `(${selectedBookingDetails.package_name})`}</div>
              {selectedBookingDetails.customizations && selectedBookingDetails.customizations.length > 0 ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Customer Requirements:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedBookingDetails.customizations.map(c => (
                      <Tag key={c.id} color="cyan" style={{ fontSize: 11 }}>
                        {c.option_name}{c.quantity > 1 ? ` (x${c.quantity})` : ''}
                      </Tag>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#64748b' }}>No customizations selected.</div>
              )}
            </div>
          )}

          <FormField label="Work Notes & Summary" required>
            <Input.TextArea rows={4} placeholder="Describe tasks completed, community assistance provided..." value={workSummary} onChange={e => setWorkSummary(e.target.value)} />
          </FormField>
        </div>
      </AppModal>

      <Footer />
    </div>
  );
};

export default VolunteerWorkLogsPage;
