import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input, Select, Upload, message, Card, Row, Col, Typography, InputNumber, Button, Space, Tag } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import { companyPortalService } from '../../services/companyPortal.service';
import { adminService } from '../../services/admin.service';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;
const { Title } = Typography;

const CompanyServiceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [featuresList, setFeaturesList] = useState(['Free Inspection', 'Warranty Included', 'Licensed Professionals']);
  const [newFeatureText, setNewFeatureText] = useState('');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      category_id: undefined,
      subcategory_id: undefined,
      service_name: '',
      short_description: '',
      full_description: '',
      starting_price: 50,
      estimated_duration: '2 hours',
      service_type: 'on_site',
      status: 'active'
    }
  });

  const watchCategory = watch('category_id');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const catRes = await adminService.getCategories({ page: 1, limit: 100 });
        if (catRes.success) setCategories(catRes.data.items);

        const subRes = await adminService.getSubcategories({ page: 1, limit: 200 });
        if (subRes.success) setSubcategories(subRes.data.items);
      } catch {
        // ignore
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (watchCategory) {
      setFilteredSubcategories(subcategories.filter(s => s.category_id === watchCategory));
    } else {
      setFilteredSubcategories([]);
    }
  }, [watchCategory, subcategories]);

  useEffect(() => {
    if (isEditMode) {
      const fetchServiceData = async () => {
        setLoading(true);
        try {
          const res = await companyPortalService.getServiceById(id);
          if (res.success) {
            const s = res.data;
            reset({
              category_id: s.category_id,
              subcategory_id: s.subcategory_id,
              service_name: s.service_name,
              short_description: s.short_description || '',
              full_description: s.full_description || '',
              starting_price: s.starting_price,
              estimated_duration: s.estimated_duration || '2 hours',
              service_type: s.service_type || 'on_site',
              status: s.status
            });
            if (s.features && s.features.length) {
              setFeaturesList(s.features.map(f => f.feature_name));
            }
          }
        } catch (err) {
          message.error(err.message || 'Failed to load service data');
        } finally {
          setLoading(false);
        }
      };
      fetchServiceData();
    }
  }, [id, isEditMode]);

  const handleAddFeature = () => {
    if (newFeatureText && newFeatureText.trim()) {
      setFeaturesList(prev => [...prev, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFeaturesList(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      formData.append('features', JSON.stringify(featuresList));

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      if (galleryFiles && galleryFiles.length) {
        galleryFiles.forEach(file => {
          formData.append('gallery', file);
        });
      }

      if (isEditMode) {
        await companyPortalService.updateService(id, formData);
        message.success('Service updated successfully');
      } else {
        await companyPortalService.createService(formData);
        message.success('Service created successfully');
      }
      navigate(ROUTES.COMPANY_SERVICES);
    } catch (err) {
      message.error(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { title: 'Dashboard', path: ROUTES.COMPANY_DASHBOARD },
    { title: 'Services Catalog', path: ROUTES.COMPANY_SERVICES },
    { title: isEditMode ? 'Edit Service' : 'Add New Service' }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={isEditMode ? 'Edit Service Listing' : 'Create New Service Offering'}
        subtitle="Configure service specifications, pricing, duration, features and gallery images."
        extra={
          <AppButton icon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.COMPANY_SERVICES)}>
            Back to Catalog
          </AppButton>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="General Service Information" bordered={false} style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Controller
                    name="category_id"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <FormField label="Service Category" error={errors.category_id} required>
                        <Select
                          {...field}
                          placeholder="Select Category"
                          onChange={val => {
                            field.onChange(val);
                            setValue('subcategory_id', undefined);
                          }}
                          style={{ width: '100%' }}
                        >
                          {categories.map(c => (
                            <Option key={c.id} value={c.id}>{c.category_name}</Option>
                          ))}
                        </Select>
                      </FormField>
                    )}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Controller
                    name="subcategory_id"
                    control={control}
                    rules={{ required: 'Subcategory is required' }}
                    render={({ field }) => (
                      <FormField label="Subcategory" error={errors.subcategory_id} required>
                        <Select {...field} placeholder="Select Subcategory" style={{ width: '100%' }} disabled={!watchCategory}>
                          {filteredSubcategories.map(s => (
                            <Option key={s.id} value={s.id}>{s.subcategory_name}</Option>
                          ))}
                        </Select>
                      </FormField>
                    )}
                  />
                </Col>
              </Row>

              <Controller
                name="service_name"
                control={control}
                rules={{ required: 'Service name is required' }}
                render={({ field }) => (
                  <FormField label="Service Name" error={errors.service_name} required>
                    <Input {...field} placeholder="e.g. Deep Kitchen Sanitize & Cleaning" size="large" />
                  </FormField>
                )}
              />

              <Controller
                name="short_description"
                control={control}
                render={({ field }) => (
                  <FormField label="Short Summary">
                    <Input {...field} placeholder="Brief one-line summary..." />
                  </FormField>
                )}
              />

              <Controller
                name="full_description"
                control={control}
                render={({ field }) => (
                  <FormField label="Detailed Description">
                    <Input.TextArea {...field} rows={4} placeholder="Full scope of work, tools used, guarantees..." />
                  </FormField>
                )}
              />
            </Card>

            <Card title="Features & Offerings Checklist" bordered={false}>
              <div style={{ marginBottom: 16 }}>
                <Space.Compact style={{ width: '100%', maxWidth: 400 }}>
                  <Input
                    placeholder="Add feature (e.g. Same Day Service)..."
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                    onPressEnter={handleAddFeature}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFeature}>
                    Add
                  </Button>
                </Space.Compact>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {featuresList.map((feature, idx) => (
                  <Tag
                    key={idx}
                    closable
                    onClose={() => handleRemoveFeature(idx)}
                    color="blue"
                    style={{ padding: '4px 10px', fontSize: 13 }}
                  >
                    ✓ {feature}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Pricing & Availability" bordered={false} style={{ marginBottom: 24 }}>
              <Controller
                name="starting_price"
                control={control}
                rules={{ required: 'Starting price is required' }}
                render={({ field }) => (
                  <FormField label="Starting Price ($)" error={errors.starting_price} required>
                    <InputNumber {...field} style={{ width: '100%' }} min={1} precision={2} />
                  </FormField>
                )}
              />

              <Controller
                name="estimated_duration"
                control={control}
                render={({ field }) => (
                  <FormField label="Estimated Duration">
                    <Input {...field} placeholder="e.g. 2 - 3 hours" />
                  </FormField>
                )}
              />

              <Controller
                name="service_type"
                control={control}
                render={({ field }) => (
                  <FormField label="Service Type" required>
                    <Select {...field} style={{ width: '100%' }}>
                      <Option value="on_site">On-Site Home Visit</Option>
                      <Option value="remote">Remote Consultation</Option>
                      <Option value="consultation">In-Store Consultation</Option>
                    </Select>
                  </FormField>
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormField label="Listing Status" required>
                    <Select {...field} style={{ width: '100%' }}>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </FormField>
                )}
              />

              <FormField label="Service Thumbnail Image">
                <Upload beforeUpload={file => { setThumbnailFile(file); return false; }} maxCount={1} accept="image/*">
                  <AppButton icon={<UploadOutlined />}>Upload Thumbnail</AppButton>
                </Upload>
              </FormField>

              <FormField label="Additional Gallery Images">
                <Upload
                  beforeUpload={(file) => {
                    setGalleryFiles(prev => [...prev, file]);
                    return false;
                  }}
                  multiple
                  accept="image/*"
                >
                  <AppButton icon={<UploadOutlined />}>Upload Gallery Photos</AppButton>
                </Upload>
              </FormField>
            </Card>

            <AppButton type="primary" htmlType="submit" block size="large" loading={submitting}>
              {isEditMode ? 'Save Service Changes' : 'Publish Service Listing'}
            </AppButton>
          </Col>
        </Row>
      </form>
    </div>
  );
};

export default CompanyServiceFormPage;
