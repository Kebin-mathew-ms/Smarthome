import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Table, Tag, Space, Select, Drawer, Button, Input, message } from 'antd';
import { Briefcase, Clock, CheckCircle, XCircle, Users, Eye, UserCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import AppModal from '../../components/common/AppModal';
import { bookingService } from '../../services/booking.service';
import { companyPortalService } from '../../services/companyPortal.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;
const { Title, Text } = Typography = require('antd').Typography;

const CompanyBookingDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('ALL');

  // Assign Employee Drawer State
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Status Change State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('Confirmed');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await companyPortalService.getEmployees({ limit: 100, status: 'active' });
      if (res.success) setEmployees(res.data.items);
    } catch {
      // ignore
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const statusParam = activeStatus === 'ALL' ? undefined : activeStatus;
      const res = await bookingService.getCompanyBookings({ status: statusParam, limit: 50 });
      if (res.success) {
        setBookings(res.data.items);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch company bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [activeStatus]);

  const handleOpenAssignDrawer = (booking) => {
    setSelectedBooking(booking);
    if (booking.employees && booking.employees.length) {
      setSelectedEmployeeIds(booking.employees.map(e => e.id));
    } else {
      setSelectedEmployeeIds([]);
    }
    setIsAssignDrawerOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedBooking) return;
    setAssigning(true);
    try {
      const res = await bookingService.assignCompanyEmployees(selectedBooking.id, selectedEmployeeIds);
      if (res.success) {
        message.success('Technician(s) assigned successfully');
        setIsAssignDrawerOpen(false);
        fetchBookings();
      }
    } catch (err) {
      message.error(err.message || 'Failed to assign technicians');
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenStatusModal = (booking, newStatus) => {
    setSelectedBooking(booking);
    setTargetStatus(newStatus);
    setStatusRemarks('');
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedBooking) return;
    setUpdatingStatus(true);
    try {
      const res = await bookingService.updateCompanyBookingStatus(selectedBooking.id, targetStatus, statusRemarks);
      if (res.success) {
        message.success(`Booking status updated to ${targetStatus}`);
        setIsStatusModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      message.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const columns = [
    {
      title: 'Booking Info',
      key: 'info',
      render: (_, r) => (
        <div>
          <strong style={{ color: '#2563eb', display: 'block' }}>{r.booking_number}</strong>
          <span style={{ fontSize: 12, color: '#64748b' }}>Customer: {r.customer_name} ({r.customer_phone})</span>
        </div>
      )
    },
    {
      title: 'Service & Package',
      key: 'service',
      render: (_, r) => (
        <div>
          <strong style={{ display: 'block' }}>{r.service_name}</strong>
          <span style={{ fontSize: 12, color: '#64748b' }}>{r.package_name || 'Standard Offering'}</span>
        </div>
      )
    },
    {
      title: 'Schedule',
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
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: a => <strong style={{ color: '#16a34a' }}>${Number(a).toFixed(2)}</strong>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.booking_status === 'Pending' && (
            <Space size="small">
              <Button type="primary" size="small" onClick={() => handleOpenStatusModal(record, 'Confirmed')}>
                Accept
              </Button>
              <Button danger size="small" onClick={() => handleOpenStatusModal(record, 'Rejected')}>
                Reject
              </Button>
            </Space>
          )}

          {['Confirmed', 'Scheduled', 'Employee Assigned', 'Work Started'].includes(record.booking_status) && (
            <Space size="small">
              <Button size="small" icon={<UserCheck size={14} />} onClick={() => handleOpenAssignDrawer(record)}>
                Assign Staff
              </Button>
              <Select
                size="small"
                value={record.booking_status}
                onChange={newSt => handleOpenStatusModal(record, newSt)}
                style={{ width: 130 }}
              >
                <Option value="Scheduled">Scheduled</Option>
                <Option value="On The Way">On The Way</Option>
                <Option value="Work Started">Work Started</Option>
                <Option value="Work In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            </Space>
          )}
        </Space>
      )
    }
  ];

  const tabItems = [
    { key: 'ALL', label: 'All Jobs' },
    { key: 'Pending', label: 'Pending Approval' },
    { key: 'Confirmed', label: 'Confirmed' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'Completed', label: 'Completed' }
  ];

  return (
    <div>
      <PageHeader
        title="Company Booking & Dispatch Dashboard"
        subtitle="Manage incoming service requests, assign technicians, and update job execution status."
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Tabs activeKey={activeStatus} onChange={setActiveStatus} items={tabItems} style={{ marginBottom: 16 }} />

        <AppTable
          columns={columns}
          dataSource={bookings}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Employee Assign Drawer */}
      <Drawer
        title="Assign Technicians to Booking"
        width={400}
        open={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
      >
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Company Technicians</Text>
          <Select
            mode="multiple"
            placeholder="Select employees"
            value={selectedEmployeeIds}
            onChange={setSelectedEmployeeIds}
            style={{ width: '100%', marginBottom: 24 }}
          >
            {employees.map(e => (
              <Option key={e.id} value={e.id}>
                {e.employee_name} ({e.designation})
              </Option>
            ))}
          </Select>

          <Button type="primary" block size="large" loading={assigning} onClick={handleAssignSubmit}>
            Assign Selected Technicians
          </Button>
        </div>
      </Drawer>

      {/* Status Modal */}
      <AppModal
        title={`Change Booking Status to '${targetStatus}'`}
        open={isStatusModalOpen}
        onOk={handleStatusSubmit}
        onCancel={() => setIsStatusModalOpen(false)}
        confirmLoading={updatingStatus}
      >
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Remarks / Notes</label>
          <Input.TextArea rows={3} placeholder="Add status transition notes..." value={statusRemarks} onChange={e => setStatusRemarks(e.target.value)} />
        </div>
      </AppModal>
    </div>
  );
};

export default CompanyBookingDashboardPage;
