import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Space, Button, Tag, message } from 'antd';
import { Search, Download, Calendar, Building2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import ExportCSVButton from '../../components/common/ExportCSVButton';
import { bookingService } from '../../services/booking.service';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);

  const fetchCompanies = async () => {
    try {
      const res = await adminService.getCompanies({ page: 1, limit: 100 });
      if (res.success) setCompanies(res.data.items);
    } catch {
      // ignore
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAdminBookings({
        page,
        limit: pageSize,
        search,
        company_id: companyFilter,
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
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [page, pageSize, search, companyFilter, statusFilter]);

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
      title: 'Provider Company',
      dataIndex: 'company_name',
      key: 'company_name'
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name'
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, r) => `${r.scheduled_date} (${r.scheduled_time})`
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
    }
  ];

  return (
    <div>
      <PageHeader
        title="Platform Bookings Overview"
        subtitle="Monitor all booking requests, payment transactions, and provider execution across the platform."
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search by booking #, customer, or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />

        <Select
          placeholder="Filter Company"
          value={companyFilter}
          onChange={setCompanyFilter}
          style={{ width: 200 }}
          allowClear
        >
          {companies.map(c => <Option key={c.id} value={c.id}>{c.company_name}</Option>)}
        </Select>

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
            { label: 'Company Name', key: 'company_name' },
            { label: 'Service Name', key: 'service_name' },
            { label: 'Status', key: 'booking_status' },
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
      />
    </div>
  );
};

export default AdminBookingsPage;
