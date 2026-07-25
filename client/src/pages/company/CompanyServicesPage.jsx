import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, Tag, Dropdown, Menu } from 'antd';
import { Plus, Search, Briefcase, MoreVertical, Eye, Edit2, Copy, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { companyPortalService } from '../../services/companyPortal.service';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;

const CompanyServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories({ page: 1, limit: 100 });
      if (res.success) setCategories(res.data.items);
    } catch {
      // ignore
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await companyPortalService.getServices({
        page,
        limit: pageSize,
        search,
        category_id: categoryFilter,
        status: statusFilter
      });
      if (res.success) {
        setServices(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch services catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [page, pageSize, search, categoryFilter, statusFilter]);

  const handleStatusChange = async (serviceId, status) => {
    try {
      const res = await companyPortalService.updateServiceStatus(serviceId, status);
      if (res.success) {
        message.success(`Service status updated to ${status}`);
        fetchServices();
      }
    } catch (err) {
      message.error(err.message || 'Failed to update service status');
    }
  };

  const handleDuplicate = async (serviceId) => {
    try {
      const res = await companyPortalService.duplicateService(serviceId);
      if (res.success) {
        message.success('Service duplicated successfully');
        fetchServices();
      }
    } catch (err) {
      message.error(err.message || 'Failed to duplicate service');
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Service',
      content: 'Are you sure you want to delete this service? Soft delete will be performed.',
      onOk: async () => {
        try {
          await companyPortalService.deleteService(id);
          message.success('Service soft deleted');
          fetchServices();
        } catch (err) {
          message.error(err.message || 'Failed to delete service');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (text, record) => (
        <Space>
          <Briefcase size={18} style={{ color: '#2563eb' }} />
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{text}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{record.short_description || 'No description'}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (cat, r) => (
        <div>
          <Tag color="blue">{cat}</Tag>
          <Tag color="geekblue" style={{ fontSize: 11 }}>{r.subcategory_name}</Tag>
        </div>
      )
    },
    {
      title: 'Starting Price',
      dataIndex: 'starting_price',
      key: 'starting_price',
      render: (price) => <strong style={{ color: '#16a34a', fontSize: 15 }}>${Number(price).toFixed(2)}</strong>
    },
    {
      title: 'Duration',
      dataIndex: 'estimated_duration',
      key: 'estimated_duration',
      render: (d) => d || 'N/A'
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
      render: (_, record) => {
        const actionMenu = (
          <Menu
            items={[
              {
                key: 'view',
                label: 'View Details',
                icon: <Eye size={16} />,
                onClick: () => navigate(`/company/services/${record.id}`)
              },
              {
                key: 'edit',
                label: 'Edit Service',
                icon: <Edit2 size={16} />,
                onClick: () => navigate(`/company/services/${record.id}/edit`)
              },
              {
                key: 'duplicate',
                label: 'Duplicate Service',
                icon: <Copy size={16} />,
                onClick: () => handleDuplicate(record.id)
              },
              {
                type: 'divider'
              },
              {
                key: 'status_active',
                label: 'Mark Active',
                icon: <CheckCircle size={16} style={{ color: '#16a34a' }} />,
                onClick: () => handleStatusChange(record.id, 'active')
              },
              {
                key: 'status_inactive',
                label: 'Mark Inactive',
                icon: <XCircle size={16} style={{ color: '#dc2626' }} />,
                onClick: () => handleStatusChange(record.id, 'inactive')
              },
              {
                type: 'divider'
              },
              {
                key: 'delete',
                label: 'Delete Service',
                icon: <Trash2 size={16} />,
                danger: true,
                onClick: () => handleDelete(record.id)
              }
            ]}
          />
        );

        return (
          <Dropdown overlay={actionMenu} trigger={['click']} placement="bottomRight">
            <AppButton icon={<MoreVertical size={16} />} size="small" />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="Services Catalog"
        subtitle="Manage your company's offerings, packages, features and pricing."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => navigate(ROUTES.COMPANY_ADD_SERVICE)}>
            Add New Service
          </AppButton>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search service name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />

        <Select
          placeholder="Filter Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 200 }}
          allowClear
        >
          {categories.map(c => (
            <Option key={c.id} value={c.id}>{c.category_name}</Option>
          ))}
        </Select>

        <Select
          placeholder="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
          allowClear
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </div>

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
    </div>
  );
};

export default CompanyServicesPage;
