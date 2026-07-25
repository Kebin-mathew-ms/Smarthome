import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Upload, Input, message, Modal, Image } from 'antd';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { UploadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import AppModal from '../../components/common/AppModal';
import FormField from '../../components/common/FormField';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { companyPortalService } from '../../services/companyPortal.service';

const { Title, Text } = Typography;

const CompanyGalleryPage = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await companyPortalService.getGallery();
      if (res.success) {
        setGallery(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load company gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async () => {
    if (!imageFile) {
      message.warning('Please select an image file to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('gallery_image', imageFile);
      if (caption) formData.append('caption', caption);

      const res = await companyPortalService.addImage(formData);
      if (res.success) {
        message.success('Gallery image uploaded successfully');
        setIsModalOpen(false);
        setImageFile(null);
        setCaption('');
        fetchGallery();
      }
    } catch (err) {
      message.error(err.message || 'Failed to upload image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmModal({
      title: 'Delete Portfolio Image',
      content: 'Are you sure you want to remove this image from your company gallery?',
      onOk: async () => {
        try {
          await companyPortalService.deleteImage(id);
          message.success('Image deleted from gallery');
          fetchGallery();
        } catch (err) {
          message.error(err.message || 'Failed to delete image');
        }
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Company Portfolio & Gallery"
        subtitle="Showcase completed projects, team photos, certificates and equipment."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Upload Photo
          </AppButton>
        }
      />

      <Row gutter={[16, 16]}>
        {gallery.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              bordered={false}
              cover={
                <div style={{ height: 180, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <ImageIcon size={48} style={{ color: '#cbd5e1' }} />
                </div>
              }
              actions={[
                <Trash2 key="delete" size={16} style={{ color: '#ef4444' }} onClick={() => handleDelete(item.id)} />
              ]}
            >
              <Text strong style={{ fontSize: 13, display: 'block' }}>
                {item.caption || 'Project Showcase'}
              </Text>
            </Card>
          </Col>
        ))}

        {gallery.length === 0 && !loading && (
          <Col span={24}>
            <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
              <ImageIcon size={48} style={{ color: '#94a3b8', marginBottom: 12 }} />
              <Title level={4} style={{ margin: 0 }}>No Gallery Photos Yet</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Upload photos of your team, completed work, and office facilities to build customer trust.
              </Text>
              <AppButton type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
                Upload Your First Photo
              </AppButton>
            </Card>
          </Col>
        )}
      </Row>

      <AppModal
        title="Upload Portfolio Image"
        open={isModalOpen}
        onOk={handleUpload}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
      >
        <div style={{ marginTop: 16 }}>
          <FormField label="Select Photo" required>
            <Upload beforeUpload={file => { setImageFile(file); return false; }} maxCount={1} accept="image/*">
              <AppButton icon={<UploadOutlined />}>Select Image File</AppButton>
            </Upload>
          </FormField>

          <FormField label="Caption / Project Description">
            <Input
              placeholder="e.g. Master Bathroom Renovation Completed Project"
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
          </FormField>
        </div>
      </AppModal>
    </div>
  );
};

export default CompanyGalleryPage;
