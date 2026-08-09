import React, { useState, useEffect } from 'react';
import { Card, Input, Space, message, Select, Button, Form, Tag, Modal } from 'antd';
import { Plus, Search, Users, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const VolunteersPage = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        search,
        status: statusFilter
      };
      const res = await adminService.getVolunteers(params);
      if (res.success) {
        setVolunteers(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [page, pageSize, search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingVolunteer(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (volunteer) => {
    setEditingVolunteer(volunteer);
    form.setFieldsValue({
      volunteer_name: volunteer.volunteer_name,
      email: volunteer.email,
      phone: volunteer.phone,
      designation: volunteer.designation,
      address: volunteer.address,
      status: volunteer.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingVolunteer) {
        await adminService.updateVolunteer(editingVolunteer.id, values);
        message.success('Volunteer updated successfully');
      } else {
        await adminService.createVolunteer(values);
        message.success('Volunteer added successfully');
      }
      setIsModalOpen(false);
      fetchVolunteers();
    } catch (err) {
      message.error(err.message || 'Failed to save volunteer details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Volunteer',
      content: 'Are you sure you want to delete this volunteer? Soft delete will be performed.',
      onOk: async () => {
        try {
          await adminService.deleteVolunteer(id);
          message.success('Volunteer deleted successfully');
          fetchVolunteers();
        } catch (err) {
          message.error(err.message || 'Failed to delete volunteer');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Volunteer Name',
      dataIndex: 'volunteer_name',
      key: 'volunteer_name',
      render: (text, record) => (
        <Space>
          <Users size={18} style={{ color: '#2563eb' }} />
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{text}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{record.email}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Designation / Specialty',
      dataIndex: 'designation',
      key: 'designation',
      render: d => <Tag color="blue">{d}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<Edit2 size={14} />} onClick={() => handleOpenEditModal(record)}>
            Edit
          </Button>
          <Button type="primary" danger size="small" icon={<Trash2 size={14} />} onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Staff Volunteer Directory"
        subtitle="Manage community volunteers, dispatch workers, designations, and view assignments."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={handleOpenAddModal}>
            Add Volunteer
          </AppButton>
        }
      />

      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search volunteers..."
            prefix={<Search size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Space>

        <AppTable
          columns={columns}
          dataSource={volunteers}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            }
          }}
        />
      </Card>

      {/* Add/Edit Volunteer Modal */}
      <Modal
        title={editingVolunteer ? 'Edit Volunteer Details' : 'Add New Staff Volunteer'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ status: 'active' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="volunteer_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter volunteer name' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="john@example.com" disabled={!!editingVolunteer} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="+91-XXXXXXXXXX" />
          </Form.Item>

          <Form.Item
            name="designation"
            label="Designation / specialty"
            rules={[{ required: true, message: 'Please enter designation specialty' }]}
          >
            <Input placeholder="e.g. Senior Electrician, Lead Cleaner" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Home Location Address"
          >
            <Input.TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingVolunteer ? 'Save Changes' : 'Add Volunteer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VolunteersPage;
