import React, { useState, useEffect } from 'react';
import { Input, Space, message, Select, InputNumber } from 'antd';
import { Plus, Search, Edit2, Trash2, Layers, DollarSign } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import AppModal from '../../components/common/AppModal';
import StatusBadge from '../../components/common/StatusBadge';
import FormField from '../../components/common/FormField';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { companyPortalService } from '../../services/companyPortal.service';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;

const CompanyPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      service_id: undefined,
      package_name: '',
      package_description: '',
      price: 99,
      estimated_duration: '2 hours',
      status: 'active'
    }
  });

  const fetchServices = async () => {
    try {
      const res = await companyPortalService.getServices({ page: 1, limit: 100 });
      if (res.success) setServices(res.data.items);
    } catch {
      // ignore
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await companyPortalService.getPackages();
      if (res.success) {
        setPackages(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPackages();
  }, []);

  const handleOpenModal = (pkg = null) => {
    setEditingPackage(pkg);
    if (pkg) {
      reset({
        service_id: pkg.service_id,
        package_name: pkg.package_name,
        package_description: pkg.package_description || '',
        price: pkg.price,
        estimated_duration: pkg.estimated_duration || '2 hours',
        status: pkg.status
      });
    } else {
      reset({
        service_id: services[0] ? services[0].id : undefined,
        package_name: '',
        package_description: '',
        price: 99,
        estimated_duration: '2 hours',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingPackage) {
        await companyPortalService.updatePackage(editingPackage.id, data);
        message.success('Package updated successfully');
      } else {
        await companyPortalService.createPackage(data);
        message.success('Package created successfully');
      }
      handleCloseModal();
      fetchPackages();
    } catch (err) {
      message.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Package',
      content: 'Are you sure you want to delete this service package?',
      onOk: async () => {
        try {
          await companyPortalService.deletePackage(id);
          message.success('Package soft deleted');
          fetchPackages();
        } catch (err) {
          message.error(err.message || 'Failed to delete package');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Package Name',
      dataIndex: 'package_name',
      key: 'package_name',
      render: (text) => (
        <Space>
          <Layers size={18} style={{ color: '#2563eb' }} />
          <strong style={{ color: '#0f172a' }}>{text}</strong>
        </Space>
      )
    },
    {
      title: 'Linked Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (s) => s || 'N/A'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (p) => <strong style={{ color: '#16a34a', fontSize: 15 }}>${Number(p).toFixed(2)}</strong>
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
      render: (s) => <StatusBadge status={s} />
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
        title="Service Tiers & Packages"
        subtitle="Manage tiered service packages (Basic, Premium, Luxury) across your offerings."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
            Add Package Tier
          </AppButton>
        }
      />

      <AppTable
        columns={columns}
        dataSource={packages}
        loading={loading}
        pagination={false}
      />

      <AppModal
        title={editingPackage ? 'Edit Package Tier' : 'Add New Package Tier'}
        open={isModalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={handleCloseModal}
        confirmLoading={submitting}
      >
        <form style={{ marginTop: 16 }}>
          <Controller
            name="service_id"
            control={control}
            rules={{ required: 'Target service is required' }}
            render={({ field }) => (
              <FormField label="Target Service" error={errors.service_id} required>
                <Select {...field} placeholder="Select Service" style={{ width: '100%' }}>
                  {services.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.service_name}
                    </Option>
                  ))}
                </Select>
              </FormField>
            )}
          />

          <Controller
            name="package_name"
            control={control}
            rules={{ required: 'Package name is required' }}
            render={({ field }) => (
              <FormField label="Package Tier Name" error={errors.package_name} required>
                <Input {...field} placeholder="e.g. Premium Deep Cleaning Package" />
              </FormField>
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Controller
              name="price"
              control={control}
              rules={{ required: 'Price is required' }}
              render={({ field }) => (
                <FormField label="Package Price ($)" error={errors.price} required>
                  <InputNumber {...field} style={{ width: '100%' }} min={1} precision={2} />
                </FormField>
              )}
            />

            <Controller
              name="estimated_duration"
              control={control}
              render={({ field }) => (
                <FormField label="Duration">
                  <Input {...field} placeholder="3 hours" />
                </FormField>
              )}
            />
          </div>

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
            name="package_description"
            control={control}
            render={({ field }) => (
              <FormField label="Package Inclusions & Description">
                <Input.TextArea {...field} rows={3} placeholder="Detailed breakdown of package inclusions..." />
              </FormField>
            )}
          />
        </form>
      </AppModal>
    </div>
  );
};

export default CompanyPackagesPage;
