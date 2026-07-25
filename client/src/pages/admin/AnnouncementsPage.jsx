import React, { useState, useEffect } from 'react';
import { Card, Input, Select, DatePicker, Button, Tag, Space, Table, message } from 'antd';
import { Plus, Trash2, Edit2, Megaphone } from 'lucide-react';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import AppModal from '../../components/common/AppModal';
import FormField from '../../components/common/FormField';
import Footer from '../../layouts/Footer';
import { analyticsService } from '../../services/analytics.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibleTo, setVisibleTo] = useState('all');
  const [dates, setDates] = useState([dayjs(), dayjs().add(7, 'day')]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAllAnnouncements();
      if (res.success) setAnnouncements(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenModal = (ann = null) => {
    setEditingId(ann ? ann.id : null);
    if (ann) {
      setTitle(ann.title);
      setDescription(ann.description);
      setVisibleTo(ann.visible_to);
      setDates([dayjs(ann.start_date), dayjs(ann.end_date)]);
    } else {
      setTitle('');
      setDescription('');
      setVisibleTo('all');
      setDates([dayjs(), dayjs().add(7, 'day')]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      message.warning('Please enter title and description');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        visible_to: visibleTo,
        start_date: dates[0].format('YYYY-MM-DD'),
        end_date: dates[1].format('YYYY-MM-DD'),
        status: 'active'
      };

      if (editingId) {
        await analyticsService.updateAnnouncement(editingId, payload);
        message.success('Announcement updated');
      } else {
        await analyticsService.createAnnouncement(payload);
        message.success('Announcement published');
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      message.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await analyticsService.deleteAnnouncement(id);
      message.success('Announcement removed');
      fetchAnnouncements();
    } catch (err) {
      message.error(err.message || 'Failed to delete');
    }
  };

  const columns = [
    { title: 'Headline Title', dataIndex: 'title', key: 'title', render: t => <strong>{t}</strong> },
    { title: 'Target Audience', dataIndex: 'visible_to', key: 'visible_to', render: v => <Tag color="blue" style={{ textTransform: 'uppercase' }}>{v}</Tag> },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date', render: d => formatDate(d) },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date', render: d => formatDate(d) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'active' ? 'green' : 'default'}>{s}</Tag> },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<Edit2 size={14} />} onClick={() => handleOpenModal(r)} />
          <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDelete(r.id)} />
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="System Announcements & Broadcast Banners"
        subtitle="Publish platform notifications and maintenance banners to companies and customers."
        extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>Post Announcement</Button>}
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <Table columns={columns} dataSource={announcements} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <AppModal
        title={editingId ? 'Edit Announcement' : 'Post Broadcast Announcement'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
      >
        <div style={{ marginTop: 16 }}>
          <FormField label="Announcement Title" required>
            <Input placeholder="e.g. Scheduled System Maintenance Notice" value={title} onChange={e => setTitle(e.target.value)} />
          </FormField>

          <FormField label="Visible Target Audience">
            <Select value={visibleTo} onChange={setVisibleTo} style={{ width: '100%' }}>
              <Option value="all">All Users (Admin, Company & Customer)</Option>
              <Option value="companies">Companies Only</Option>
              <Option value="customers">Customers Only</Option>
            </Select>
          </FormField>

          <FormField label="Banner Visibility Dates" required>
            <DatePicker.RangePicker value={dates} onChange={setDates} style={{ width: '100%' }} />
          </FormField>

          <FormField label="Detailed Banner Description" required>
            <Input.TextArea rows={3} placeholder="Full details..." value={description} onChange={e => setDescription(e.target.value)} />
          </FormField>
        </div>
      </AppModal>

      <Footer />
    </div>
  );
};

export default AnnouncementsPage;
