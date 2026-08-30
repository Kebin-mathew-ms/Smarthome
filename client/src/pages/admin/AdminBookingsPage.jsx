import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Space, Button, Tag, Modal, Form, message } from 'antd';
import { Search, UserCheck, XCircle, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import StatusBadge from '../../components/common/StatusBadge';
import ExportCSVButton from '../../components/common/ExportCSVButton';
import { bookingService } from '../../services/booking.service';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const ExpandedBookingRow = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bookingService.getBookingById(bookingId);
        if (res.success) {
          setBooking(res.data);
        }
      } catch (err) {
        message.error('Failed to load booking customizations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  if (loading) return <span style={{ fontSize: 13, color: '#64748b' }}>Loading customizations...</span>;
  if (!booking) return <span style={{ fontSize: 13, color: '#ef4444' }}>Failed to load details.</span>;

  let basePrice = Number(booking.subtotal);
  let addOnsTotal = 0;

  if (booking.customizations && booking.customizations.length > 0) {
    addOnsTotal = booking.customizations.reduce((sum, c) => sum + Number(c.total_price), 0);
    basePrice = Number(booking.subtotal) - addOnsTotal;
  }

  return (
    <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <p style={{ margin: '0 0 8px 0', fontSize: 13 }}><strong>Customization & Price Breakdown:</strong></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12, fontSize: 13 }}>
        <div>Base Package Price: <strong>${basePrice.toFixed(2)}</strong></div>
        <div>Add-on Amount: <strong>${addOnsTotal.toFixed(2)}</strong></div>
        <div>Final Booking Price: <strong style={{ color: '#16a34a' }}>${booking.total_amount.toFixed(2)}</strong></div>
      </div>
      
      {booking.customizations && booking.customizations.length > 0 ? (
        <div>
          <p style={{ margin: '8px 0 4px', fontSize: 13 }}><strong>Selected Customizations:</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {booking.customizations.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 600, fontSize: 12 }}>
                <span>
                  <Tag color="cyan" style={{ fontSize: 11 }}>{c.group_name}</Tag>
                  <strong>{c.option_name}</strong>
                  {c.quantity > 1 && ` x ${c.quantity}`}
                </span>
                <span style={{ color: Number(c.total_price) === 0 ? '#16a34a' : '#475569', fontWeight: 600 }}>
                  {Number(c.total_price) === 0 ? 'Included' : `$${Number(c.total_price).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>No customizations selected.</p>
      )}
    </div>
  );
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchVolunteers = async () => {
    try {
      const res = await adminService.getVolunteers({ page: 1, limit: 100 });
      if (res.success) {
        setVolunteers(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch volunteers', err);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAdminBookings({
        page,
        limit: pageSize,
        search,
        status: statusFilter
      });
      if (res.success) {
        setBookings(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch admin bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [page, pageSize, search, statusFilter]);

  const handleOpenAssignModal = (booking) => {
    setSelectedBooking(booking);
    // Preset if volunteer is already assigned
    setSelectedVolunteer(null);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedBooking(null);
    setSelectedVolunteer(null);
  };

  const handleAssignVolunteer = async () => {
    if (!selectedVolunteer) {
      message.error('Please select a volunteer to assign.');
      return;
    }

    setAssignLoading(true);
    try {
      const res = await adminService.assignVolunteers(selectedBooking.id, [selectedVolunteer]);
      if (res.success) {
        message.success('Volunteer assigned successfully');
        handleCloseAssignModal();
        fetchBookings();
      }
    } catch (err) {
      message.error(err.message || 'Failed to assign volunteer');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const res = await adminService.updateBookingStatus(bookingId, status, 'Admin status update');
      if (res.success) {
        message.success(`Booking marked as ${status}`);
        fetchBookings();
      }
    } catch (err) {
      message.error(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Booking Number',
      dataIndex: 'booking_number',
      key: 'booking_number',
      render: text => <strong style={{ color: '#2563eb' }}>{text}</strong>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name'
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (text, r) => (
        <div>
          <span>{text}</span>
          <Tag color="blue" style={{ marginLeft: 8 }}>{r.package_name || 'Standard'}</Tag>
        </div>
      )
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, r) => `${r.scheduled_date} (${r.scheduled_time})`
    },
    {
      title: 'Assigned Volunteer',
      dataIndex: 'volunteer_names',
      key: 'volunteer_names',
      render: text => text ? <Tag color="geekblue">{text}</Tag> : <Tag color="warning">Unassigned</Tag>
    },
    {
      title: 'Booking Status',
      dataIndex: 'booking_status',
      key: 'booking_status',
      render: s => <StatusBadge status={s} />
    },
    {
      title: 'Payment Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: ps => <StatusBadge status={ps} />
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: a => <strong style={{ color: '#16a34a' }}>${Number(a).toFixed(2)}</strong>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => {
        const isCompleted = r.booking_status === 'COMPLETED';
        const isCancelled = r.booking_status === 'CANCELLED';

        return (
          <Space size="small">
            {!isCompleted && !isCancelled && (
              <Button
                type="primary"
                size="small"
                icon={<UserCheck size={14} />}
                onClick={() => handleOpenAssignModal(r)}
              >
                Assign
              </Button>
            )}

            {r.booking_status === 'Pending' && (
              <Button
                size="small"
                type="dashed"
                icon={<CheckCircle2 size={14} />}
                onClick={() => handleUpdateStatus(r.id, 'Confirmed')}
              >
                Confirm
              </Button>
            )}

            {!isCompleted && !isCancelled && (
              <Button
                danger
                size="small"
                icon={<XCircle size={14} />}
                onClick={() => handleUpdateStatus(r.id, 'Cancelled')}
              >
                Cancel
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="Platform Bookings Overview"
        subtitle="Monitor and dispatch volunteers for all smart home service bookings."
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search by booking # or customer name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />

        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="Pending">Pending</Option>
          <Option value="Confirmed">Confirmed</Option>
          <Option value="Scheduled">Scheduled</Option>
          <Option value="Completed">Completed</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>

        <ExportCSVButton
          data={bookings}
          filename="platform_bookings.csv"
          headers={[
            { label: 'Booking Number', key: 'booking_number' },
            { label: 'Customer Name', key: 'customer_name' },
            { label: 'Service Name', key: 'service_name' },
            { label: 'Status', key: 'booking_status' },
            { label: 'Volunteer Assigned', key: 'volunteer_names' },
            { label: 'Total Amount', key: 'total_amount' }
          ]}
        />
      </div>

      <AppTable
        columns={columns}
        dataSource={bookings}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); }
        }}
        expandable={{
          expandedRowRender: record => <ExpandedBookingRow bookingId={record.id} />,
          rowExpandable: () => true
        }}
      />

      {/* Assign Volunteer Modal */}
      <Modal
        title={`Assign Volunteer — ${selectedBooking?.booking_number}`}
        open={isAssignModalOpen}
        onOk={handleAssignVolunteer}
        onCancel={handleCloseAssignModal}
        confirmLoading={assignLoading}
        okText="Assign & Dispatch"
      >
        <div style={{ padding: '12px 0' }}>
          <p><strong>Customer:</strong> {selectedBooking?.customer_name}</p>
          <p><strong>Service:</strong> {selectedBooking?.service_name}</p>
          <p><strong>Schedule:</strong> {selectedBooking?.scheduled_date} ({selectedBooking?.scheduled_time})</p>

          <Form layout="vertical" style={{ marginTop: 20 }}>
            <Form.Item label="Select Community Volunteer" required>
              <Select
                placeholder="Choose a volunteer..."
                style={{ width: '100%' }}
                value={selectedVolunteer}
                onChange={setSelectedVolunteer}
                showSearch
                optionFilterProp="children"
              >
                {volunteers.map(v => (
                  <Option key={v.id} value={v.id}>
                    {v.volunteer_name} ({v.designation || 'Volunteer'})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBookingsPage;
