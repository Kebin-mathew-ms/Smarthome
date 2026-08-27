import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Tag, Input, Switch, Modal, Space, message, Button } from 'antd';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Phone, User } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import SkeletonCard from '../../components/common/SkeletonCard';
import AppModal from '../../components/common/AppModal';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import Footer from '../../layouts/Footer';
import { bookingService } from '../../services/booking.service';

const { Title, Text } = Typography;

const AddressManagementPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      label: 'Home',
      contact_person: '',
      phone: '',
      house_name: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postal_code: '',
      is_default: false
    }
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAddresses();
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenModal = (addr = null) => {
    setEditingAddress(addr);
    if (addr) {
      reset({
        label: addr.label,
        contact_person: addr.contact_person,
        phone: addr.phone,
        house_name: addr.house_name,
        street: addr.street,
        landmark: addr.landmark || '',
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        is_default: addr.is_default
      });
    } else {
      reset({
        label: 'Home',
        contact_person: '',
        phone: '',
        house_name: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        postal_code: '',
        is_default: addresses.length === 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingAddress) {
        await bookingService.updateAddress(editingAddress.id, data);
        message.success('Address updated successfully');
      } else {
        await bookingService.createAddress(data);
        message.success('New address added');
      }
      handleCloseModal();
      fetchAddresses();
    } catch (err) {
      message.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Address',
      content: 'Are you sure you want to remove this address from your address book?',
      onOk: async () => {
        try {
          await bookingService.deleteAddress(id);
          message.success('Address removed');
          fetchAddresses();
        } catch (err) {
          message.error(err.message || 'Failed to delete address');
        }
      }
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await bookingService.setDefaultAddress(id);
      message.success('Default address updated');
      fetchAddresses();
    } catch (err) {
      message.error(err.message || 'Failed to set default address');
    }
  };

  return (
    <div>
      <PageHeader
        title="Saved Addresses"
        subtitle="Manage home and work addresses for service dispatch."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
            Add New Address
          </AppButton>
        }
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <Row gutter={[20, 20]}>
          {addresses.map(addr => (
            <Col xs={24} sm={12} key={addr.id}>
              <Card
                bordered={false}
                style={{ borderRadius: 16, border: addr.is_default ? '2px solid #2563eb' : undefined }}
                actions={[
                  <Edit2 key="edit" size={16} onClick={() => handleOpenModal(addr)} />,
                  <Trash2 key="del" size={16} style={{ color: '#ef4444' }} onClick={() => handleDelete(addr.id)} />
                ]}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Tag color="blue" style={{ fontSize: 12, fontWeight: 700 }}>{addr.label}</Tag>
                  {addr.is_default ? (
                    <Tag color="green" icon={<CheckCircle2 size={12} />}>Default Address</Tag>
                  ) : (
                    <Button type="link" size="small" onClick={() => handleSetDefault(addr.id)}>
                      Set as Default
                    </Button>
                  )}
                </div>

                <Title level={5} style={{ margin: '0 0 4px', fontWeight: 700 }}>
                  <User size={14} style={{ marginRight: 6 }} />{addr.contact_person}
                </Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                  <Phone size={12} style={{ marginRight: 6 }} />{addr.phone}
                </Text>

                <div style={{ fontSize: 13, color: '#334155', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  <div><strong>{addr.house_name}</strong>, {addr.street}</div>
                  {addr.landmark && <div style={{ fontSize: 12, color: '#64748b' }}>Landmark: {addr.landmark}</div>}
                  <div>{addr.city}, {addr.state} - {addr.postal_code}</div>
                </div>
              </Card>
            </Col>
          ))}

          {addresses.length === 0 && (
            <Col span={24}>
              <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
                <MapPin size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
                <Title level={5}>No Addresses Saved</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Add your home address to start booking services.
                </Text>
                <AppButton type="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
                  Add Address Now
                </AppButton>
              </Card>
            </Col>
          )}
        </Row>
      )}

      <AppModal
        title={editingAddress ? 'Edit Address' : 'Add New Service Address'}
        open={isModalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={handleCloseModal}
        confirmLoading={submitting}
      >
        <form style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Controller
                name="label"
                control={control}
                render={({ field }) => (
                  <FormField label="Address Label">
                    <Input {...field} placeholder="Home / Office / Villa" />
                  </FormField>
                )}
              />
            </Col>
            <Col span={12}>
              <Controller
                name="contact_person"
                control={control}
                rules={{ required: 'Contact person is required' }}
                render={({ field }) => (
                  <FormField label="Contact Person Name" error={errors.contact_person} required>
                    <Input {...field} placeholder="John Doe" />
                  </FormField>
                )}
              />
            </Col>
          </Row>

          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <FormField label="Phone Number" error={errors.phone} required>
                <Input {...field} placeholder="+1 (555) 000-1122" />
              </FormField>
            )}
          />

          <Controller
            name="house_name"
            control={control}
            rules={{ required: 'House / Building name is required' }}
            render={({ field }) => (
              <FormField label="House / Flat / Building Name" error={errors.house_name} required>
                <Input {...field} placeholder="Apt 4B, Sunset Heights" />
              </FormField>
            )}
          />

          <Controller
            name="street"
            control={control}
            rules={{ required: 'Street / Area is required' }}
            render={({ field }) => (
              <FormField label="Street Address" error={errors.street} required>
                <Input {...field} placeholder="742 Evergreen Terrace" />
              </FormField>
            )}
          />

          <Controller
            name="landmark"
            control={control}
            render={({ field }) => (
              <FormField label="Landmark (Optional)">
                <Input {...field} placeholder="Near Central Park" />
              </FormField>
            )}
          />

          <Row gutter={12}>
            <Col span={8}>
              <Controller
                name="city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <FormField label="City" error={errors.city} required>
                    <Input {...field} />
                  </FormField>
                )}
              />
            </Col>
            <Col span={8}>
              <Controller
                name="state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field }) => (
                  <FormField label="State" error={errors.state} required>
                    <Input {...field} />
                  </FormField>
                )}
              />
            </Col>
            <Col span={8}>
              <Controller
                name="postal_code"
                control={control}
                rules={{ required: 'Postal Code is required' }}
                render={({ field }) => (
                  <FormField label="Postal Code" error={errors.postal_code} required>
                    <Input {...field} />
                  </FormField>
                )}
              />
            </Col>
          </Row>

          <Controller
            name="is_default"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormField label="Set as Default Address">
                <Switch checked={value} onChange={onChange} />
              </FormField>
            )}
          />
        </form>
      </AppModal>

      <Footer />
    </div>
  );
};

export default AddressManagementPage;
