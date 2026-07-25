import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Space, Button, message } from 'antd';
import { Download, Filter, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import ExportCSVButton from '../../components/common/ExportCSVButton';
import Footer from '../../layouts/Footer';
import { analyticsService } from '../../services/analytics.service';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportsCenterPage = () => {
  const [reportData, setReportData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState([]);
  const [companyId, setCompanyId] = useState(undefined);
  const [status, setStatus] = useState(undefined);

  const fetchCompanies = async () => {
    try {
      const res = await adminService.getCompanies({ page: 1, limit: 100 });
      if (res.success) setCompanies(res.data.items);
    } catch {
      // ignore
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
        companyId,
        status
      };
      const res = await analyticsService.getBookingReport(params);
      if (res.success) setReportData(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    generateReport();
  }, []);

  const columns = [
    { title: 'Booking #', dataIndex: 'booking_number', key: 'booking_number', render: t => <strong style={{ color: '#2563eb' }}>{t}</strong> },
    { title: 'Scheduled Date', dataIndex: 'scheduled_date', key: 'scheduled_date' },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name' },
    { title: 'Provider Company', dataIndex: 'company_name', key: 'company_name' },
    { title: 'Service Name', dataIndex: 'service_name', key: 'service_name' },
    { title: 'Status', dataIndex: 'booking_status', key: 'booking_status' },
    { title: 'Payment Status', dataIndex: 'payment_status', key: 'payment_status' },
    { title: 'Total Revenue', dataIndex: 'total_amount', key: 'total_amount', render: r => <strong style={{ color: '#16a34a' }}>${Number(r || 0).toFixed(2)}</strong> }
  ];

  return (
    <div>
      <PageHeader
        title="Enterprise Reports & Export Center"
        subtitle="Filter platform bookings by date range, provider, and status, and export structured CSV/PDF reports."
      />

      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <RangePicker value={dateRange} onChange={setDateRange} style={{ width: 260 }} />

          <Select placeholder="Filter Company" value={companyId} onChange={setCompanyId} style={{ width: 200 }} allowClear>
            {companies.map(c => <Option key={c.id} value={c.id}>{c.company_name}</Option>)}
          </Select>

          <Select placeholder="Filter Status" value={status} onChange={setStatus} style={{ width: 140 }} allowClear>
            <Option value="Completed">Completed</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>

          <Button type="primary" icon={<Filter size={14} />} onClick={generateReport}>
            Generate Report
          </Button>

          <ExportCSVButton
            data={reportData}
            filename="enterprise_booking_report.csv"
            headers={[
              { label: 'Booking Number', key: 'booking_number' },
              { label: 'Scheduled Date', key: 'scheduled_date' },
              { label: 'Customer Name', key: 'customer_name' },
              { label: 'Company Name', key: 'company_name' },
              { label: 'Service Name', key: 'service_name' },
              { label: 'Status', key: 'booking_status' },
              { label: 'Total Amount', key: 'total_amount' }
            ]}
          />
        </div>
      </Card>

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <AppTable columns={columns} dataSource={reportData} loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Footer />
    </div>
  );
};

export default ReportsCenterPage;
