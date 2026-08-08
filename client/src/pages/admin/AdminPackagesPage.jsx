import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, Button, Form, Modal, Tag } from 'antd';
import { Plus, Search, Layers, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const AdminPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPackages();
      if (res.success) {
        setPackages(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await adminService.getServices();
      if (res.success) setServices(res.data.items || res.data);
    } catch (err) {
      console.error('Failed to load services list', err);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchServices();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg) => {
    setEditingPackage(pkg);
    form.setFieldsValue({
      service_id: pkg.service_id,
      package_name: pkg.package_name,
      package_description: pkg.package_description,
      price: pkg.price,
      estimated_duration: pkg.estimated_duration,
      status: pkg.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingPackage) {
        await adminService.updatePackage(editingPackage.id, values);
        message.success('Package updated successfully');
      } else {
        await adminService.createPackage(values);
        message.success('Package added successfully');
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      message.error(err.message || 'Failed to save service package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Package',
      content: 'Are you sure you want to delete this package? Soft delete will be performed.',
      onOk: async () => {
        try {
          await adminService.deletePackage(id);
          message.success('Package deleted successfully');
          fetchPackages();
        } catch (err) {
          message.error(err.message || 'Failed to delete package');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Package Info',
      dataIndex: 'package_name',
      key: 'package_name',
      render: (text, record) => (
        <Space>
          <Layers size={18} style={{ color: '#854d0e' }} />
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{text}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{record.package_description}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Linked Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: s => <strong>{s}</strong>
    },
    {
      title: 'Package Price',
      dataIndex: 'price',
      key: 'price',
      render: p => <strong style={{ color: '#16a34a' }}>${Number(p).toFixed(2)}</strong>
    },
    {
      title: 'Est. Duration',
      dataIndex: 'estimated_duration',
      key: 'estimated_duration'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />
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
        title="Service Packages Management"
        subtitle="Manage service tier pricing, time limits, and configuration details."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={handleOpenAddModal}>
            Add Package
          </AppButton>
        }
      />

      <Card bordered={false} style={{ borderRadius: 16 }}>
        <AppTable columns={columns} dataSource={packages} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      {/* Add/Edit Package Modal */}
      <Modal
        title={editingPackage ? 'Edit Package Details' : 'Add New Service Package'}
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
            name="service_id"
            label="Service Title"
            rules={[{ required: true, message: 'Please select service' }]}
          >
            <Select placeholder="Link package to service" disabled={!!editingPackage}>
              {services.map(s => <Option key={s.id} value={s.id}>{s.service_name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            name="package_name"
            label="Package Name / Tier"
            rules={[{ required: true, message: 'Please enter package tier name' }]}
          >
            <Input placeholder="e.g. Basic Setup, Full Renovation" />
          </Form.Item>

          <Form.Item
            name="package_description"
            label="Package Description"
          >
            <Input.TextArea rows={2} placeholder="Explain what is included in this specific tier" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Package Price ($)"
                rules={[{ required: true, message: 'Please enter package price' }]}
              >
                <Input type="number" step="0.01" placeholder="49.99" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimated_duration"
                label="Est. Duration"
                rules={[{ required: true, message: 'Please enter duration limit' }]}
              >
                <Input placeholder="e.g. 1 hour" />
              </Form.Item>
            </Col>
          </Row>

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
                {editingPackage ? 'Save Changes' : 'Create Package'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPackagesPage;
