import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, Button, Form, Modal, Tag } from 'antd';
import { Plus, Search, Briefcase, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        search,
        status: statusFilter
      };
      const res = await adminService.getServices(params);
      if (res.success) {
        setServices(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const catRes = await adminService.getCategories();
      if (catRes.success) setCategories(catRes.data.items || catRes.data);
      const subRes = await adminService.getSubcategories();
      if (subRes.success) setSubcategories(subRes.data.items || subRes.data);
    } catch (err) {
      console.error('Failed to load category list', err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const handleOpenAddModal = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    form.setFieldsValue({
      service_name: service.service_name,
      category_id: service.category_id,
      subcategory_id: service.subcategory_id,
      short_description: service.short_description,
      full_description: service.full_description,
      starting_price: service.starting_price,
      estimated_duration: service.estimated_duration,
      service_type: service.service_type || 'on_site',
      status: service.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editingService) {
        await adminService.updateService(editingService.id, values);
        message.success('Service updated successfully');
      } else {
        await adminService.createService(values);
        message.success('Service added successfully');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      message.error(err.message || 'Failed to save service catalog item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Service',
      content: 'Are you sure you want to delete this service from the global catalog? Soft delete will be performed.',
      onOk: async () => {
        try {
          await adminService.deleteService(id);
          message.success('Service deleted successfully');
          fetchServices();
        } catch (err) {
          message.error(err.message || 'Failed to delete service');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Service Info',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (text, record) => (
        <Space>
          <Briefcase size={18} style={{ color: '#16a34a' }} />
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{text}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{record.short_description}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (c, r) => <Tag color="cyan">{c || 'General'}</Tag>
    },
    {
      title: 'Starting Price',
      dataIndex: 'starting_price',
      key: 'starting_price',
      render: p => <strong>${Number(p).toFixed(2)}</strong>
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
        title="Global Services Catalog"
        subtitle="Manage the platform service catalog, subcategories, pricing and configure packages."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={handleOpenAddModal}>
            Add Service
          </AppButton>
        }
      />

      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search services..."
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
          dataSource={services}
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

      {/* Add/Edit Service Modal */}
      <Modal
        title={editingService ? 'Edit Service Details' : 'Add New Service'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ status: 'active', service_type: 'on_site' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="service_name"
            label="Service Title"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="e.g. 3BHK Deep Home Cleaning" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  {categories.map(c => <Option key={c.id} value={c.id}>{c.category_name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subcategory_id"
                label="Subcategory"
                rules={[{ required: true, message: 'Please select subcategory' }]}
              >
                <Select placeholder="Select subcategory">
                  {subcategories.map(s => <Option key={s.id} value={s.id}>{s.subcategory_name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="short_description"
            label="Short Description"
            rules={[{ required: true, message: 'Please enter short description' }]}
          >
            <Input placeholder="Brief 1-sentence highlight of this service" />
          </Form.Item>

          <Form.Item
            name="full_description"
            label="Detailed Description"
          >
            <Input.TextArea rows={3} placeholder="Complete information explaining what is included" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="starting_price"
                label="Starting Price ($)"
                rules={[{ required: true, message: 'Please enter starting price' }]}
              >
                <Input type="number" step="0.01" placeholder="99.99" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimated_duration"
                label="Est. Duration"
                rules={[{ required: true, message: 'Please enter estimated duration' }]}
              >
                <Input placeholder="e.g. 2-3 hours" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="service_type"
                label="Service Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="on_site">On-Site Work</Option>
                  <Option value="online">Virtual / Online Consultation</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingService ? 'Save Changes' : 'Create Service'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminServicesPage;
