import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select } from 'antd';
import { Plus, Search, Edit2, Trash2, Layers } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import AppModal from '../../components/common/AppModal';
import StatusBadge from '../../components/common/StatusBadge';
import FormField from '../../components/common/FormField';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { categoryService } from '../../services/category.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      category_name: '',
      icon: '',
      description: '',
      status: 'active'
    }
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories({ page, limit: pageSize, search });
      if (res.success) {
        setCategories(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, pageSize, search]);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      reset({
        category_name: category.category_name,
        icon: category.icon || '',
        description: category.description || '',
        status: category.status
      });
    } else {
      reset({
        category_name: '',
        icon: '',
        description: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data);
        message.success('Category updated successfully');
      } else {
        await categoryService.createCategory(data);
        message.success('Category created successfully');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      message.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Service Category',
      content: 'Are you sure you want to delete this category? Soft delete will be performed.',
      onOk: async () => {
        try {
          await categoryService.deleteCategory(id);
          message.success('Category deleted successfully');
          fetchCategories();
        } catch (err) {
          message.error(err.message || 'Failed to delete category');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => (
        <Space>
          <Layers size={18} style={{ color: '#16a34a' }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      )
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
        title="Service Categories"
        subtitle="Manage categories for home care services (Plumbing, Electrical, HVAC, etc.)."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
            Add Category
          </AppButton>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 8 }} />}
          placeholder="Search by category name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
          allowClear
        />
      </div>

      <AppTable
        columns={columns}
        dataSource={categories}
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
        title={editingCategory ? 'Edit Service Category' : 'Add New Category'}
        open={isModalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={handleCloseModal}
        confirmLoading={submitting}
      >
        <form style={{ marginTop: 16 }}>
          <Controller
            name="category_name"
            control={control}
            rules={{ required: 'Category name is required' }}
            render={({ field }) => (
              <FormField label="Category Name" error={errors.category_name} required>
                <Input {...field} placeholder="e.g. Plumbing Services" />
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
                <Input.TextArea {...field} rows={3} placeholder="Brief description of services included..." />
              </FormField>
            )}
          />
        </form>
      </AppModal>
    </div>
  );
};

export default CategoriesPage;
