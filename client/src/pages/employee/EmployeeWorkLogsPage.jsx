import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Typography, message } from 'antd';
import { FileText, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppModal from '../../components/common/AppModal';
import FormField from '../../components/common/FormField';
import Footer from '../../layouts/Footer';
import { employeeService } from '../../services/employee.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;
const { Title, Text } = Typography;

const EmployeeWorkLogsPage = () => {
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [workSummary, setWorkSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAssignedBookings({});
      if (res.success) {
        setAssignedBookings(res.data);
        if (res.data.length > 0) setBookingId(res.data[0].id);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch assigned bookings');
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
      await employeeService.createWorkLog(bookingId, workSummary.trim());
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
        title="Technician Field Work Logs"
        subtitle="Log daily site summaries, materials used, and job progress notes."
        extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>Create Work Log Entry</Button>}
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Text type="secondary">Select a job from your assigned bookings list to record field notes.</Text>
      </Card>

      <AppModal
        title="Create Field Work Log Entry"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
      >
        <div style={{ marginTop: 16 }}>
          <FormField label="Select Assigned Job" required>
            <Select value={bookingId} onChange={setBookingId} style={{ width: '100%' }}>
              {assignedBookings.map(b => (
                <Option key={b.id} value={b.id}>
                  #{b.booking_number} - {b.service_name} ({b.customer_name})
                </Option>
              ))}
            </Select>
          </FormField>

          <FormField label="Daily Work Notes & Summary" required>
            <Input.TextArea rows={4} placeholder="Describe tasks completed, materials used, issues found..." value={workSummary} onChange={e => setWorkSummary(e.target.value)} />
          </FormField>
        </div>
      </AppModal>

      <Footer />
    </div>
  );
};

export default EmployeeWorkLogsPage;
