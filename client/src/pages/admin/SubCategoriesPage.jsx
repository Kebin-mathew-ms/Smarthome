import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, Tag } from 'antd';
import { Plus, Search, Edit2, Trash2, ShieldCheck, Layers } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import AppModal from '../../components/common/AppModal';
import StatusBadge from '../../components/common/StatusBadge';
import FormField from '../../components/common/FormField';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const SubCategoriesPage = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      category_id: undefined,
      subcategory_name: '',
      icon: '',
      description: '',
      status: 'active'
    }
  });

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories({ page: 1, limit: 100 });
      if (res.success) {
        setCategories(res.data.items);
      }
    } catch {
      // ignore silently
    }
  };

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSubcategories({
        page,
        limit: pageSize,
        search,
        category_id: selectedCategory
      });
      if (res.success) {
        setSubcategories(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, [page, pageSize, search, selectedCategory]);

  const handleOpenModal = (sub = null) => {
    setEditingSubcategory(sub);
    if (sub) {
      reset({
        category_id: sub.category_id,
        subcategory_name: sub.subcategory_name,
        icon: sub.icon || '',
        description: sub.description || '',
        status: sub.status
      });
    } else {
      reset({
        category_id: selectedCategory || (categories[0] ? categories[0].id : undefined),
        subcategory_name: '',
        icon: '',
        description: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubcategory(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingSubcategory) {
        await adminService.updateSubcategory(editingSubcategory.id, data);
        message.success('Subcategory updated successfully');
      } else {
        await adminService.createSubcategory(data);
        message.success('Subcategory created successfully');
      }
      handleCloseModal();
      fetchSubcategories();
    } catch (err) {
      message.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Service Subcategory',
      content: 'Are you sure you want to delete this subcategory? Soft delete will be performed.',
      onOk: async () => {
        try {
          await adminService.deleteSubcategory(id);
          message.success('Subcategory deleted successfully');
          fetchSubcategories();
        } catch (err) {
          message.error(err.message || 'Failed to delete subcategory');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Subcategory Name',
      dataIndex: 'subcategory_name',
      key: 'subcategory_name',
      render: (text) => (
        <Space>
          <ShieldCheck size={18} style={{ color: '#0d9488' }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      )
    },
    {
      title: 'Parent Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (cat) => <Tag color="blue"><Layers size={12} style={{ marginRight: 4 }} />{cat}</Tag>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => desc || 'N/A'
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
        <Space size="small">
          <AppButton icon={<Edit2 size={16} />} size="small" onClick={() => handleOpenModal(record)}>
            Edit
          </AppButton>
          <AppButton icon={<Trash2 size={16} />} danger size="small" onClick={() => handleDelete(record.id)}>
            Delete
          </AppButton>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Service Subcategories"
        subtitle="Manage detailed sub-services (e.g. House Cleaning, Fan Repair, Leak Repair, Interior Painting)."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
            Add Subcategory
          </AppButton>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search subcategory or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />

        <Select
          placeholder="Filter Parent Category"
          value={selectedCategory}
          onChange={setSelectedCategory}
          style={{ width: 220 }}
          allowClear
        >
          {categories.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.category_name}
            </Option>
          ))}
        </Select>
      </div>

      <AppTable
        columns={columns}
        dataSource={subcategories}
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

      <AppModal
        title={editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
        open={isModalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={handleCloseModal}
        confirmLoading={submitting}
      >
        <form style={{ marginTop: 16 }}>
          <Controller
            name="category_id"
            control={control}
            rules={{ required: 'Parent category is required' }}
            render={({ field }) => (
              <FormField label="Parent Category" error={errors.category_id} required>
                <Select {...field} placeholder="Select Category" style={{ width: '100%' }}>
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.category_name}
                    </Option>
                  ))}
                </Select>
              </FormField>
            )}
          />

          <Controller
            name="subcategory_name"
            control={control}
            rules={{ required: 'Subcategory name is required' }}
            render={({ field }) => (
              <FormField label="Subcategory Name" error={errors.subcategory_name} required>
                <Input {...field} placeholder="e.g. Kitchen Cleaning / Leak Repair" />
              </FormField>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormField label="Status">
                <Select {...field} style={{ width: '100%' }}>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </FormField>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <FormField label="Description">
                <Input.TextArea {...field} rows={3} placeholder="Subcategory details and scope of work..." />
              </FormField>
            )}
          />
        </form>
      </AppModal>
    </div>
  );
};

export default SubCategoriesPage;
