import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, message } from 'antd';
import { Clock, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Footer from '../../layouts/Footer';
import { volunteerService } from '../../services/volunteer.service';
import { formatDate } from '../../utils/formatters';

const VolunteerAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await volunteerService.getAttendance();
        if (res.success) setAttendance(res.data);
      } catch (err) {
        message.error(err.message || 'Failed to fetch attendance history');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const columns = [
    { title: 'Booking #', dataIndex: 'booking_number', key: 'booking_number', render: b => <strong>#{b}</strong> },
    { title: 'Check-In Timestamp', dataIndex: 'check_in_time', key: 'check_in_time', render: d => formatDate(d) },
    { title: 'Check-Out Timestamp', dataIndex: 'check_out_time', key: 'check_out_time', render: d => d ? formatDate(d) : <Tag color="orange">Checked In</Tag> },
    { title: 'GPS Address', dataIndex: 'address', key: 'address', render: a => a || 'N/A' }
  ];

  return (
    <div>
      <PageHeader
        title="Attendance & Check-In History"
        subtitle="Immutable log of GPS site check-ins and hours worked."
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Table columns={columns} dataSource={attendance} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Footer />
    </div>
  );
};

export default VolunteerAttendancePage;
