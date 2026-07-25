import React, { useState } from 'react';
import { Rate, Input, Switch, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import AppModal from '../common/AppModal';
import FormField from '../common/FormField';

const ReviewModal = ({ open, onCancel, booking, onSubmitReview }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      message.warning('Please complete review title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('booking_id', booking.id);
      formData.append('rating', rating);
      formData.append('review_title', title.trim());
      formData.append('review_description', description.trim());
      formData.append('recommend', recommend);

      files.forEach(f => {
        formData.append('review_media', f);
      });

      await onSubmitReview(formData);
      setTitle('');
      setDescription('');
      setFiles([]);
      onCancel();
    } catch (err) {
      message.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      title={`Review Service: ${booking?.service_name}`}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
    >
      <div style={{ marginTop: 16 }}>
        <FormField label="Overall Rating" required>
          <Rate value={rating} onChange={setRating} style={{ fontSize: 24 }} />
        </FormField>

        <FormField label="Review Headline / Title" required>
          <Input
            placeholder="e.g. Outstanding service & punctual technician!"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </FormField>

        <FormField label="Detailed Experience Review" required>
          <Input.TextArea
            rows={4}
            placeholder="Describe the quality of work, professionalism, cleanliness..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </FormField>

        <FormField label="Would you recommend this company?">
          <Switch checked={recommend} onChange={setRecommend} checkedChildren="Yes" unCheckedChildren="No" />
        </FormField>

        <FormField label="Upload Experience Photos / Video (Optional)">
          <Upload
            beforeUpload={file => { setFiles(prev => [...prev, file]); return false; }}
            multiple
            accept="image/*,video/*"
          >
            <button style={{ border: '1px dashed #cbd5e1', padding: '8px 16px', borderRadius: 8, background: '#f8fafc', cursor: 'pointer' }}>
              <UploadOutlined style={{ marginRight: 6 }} /> Attach Media
            </button>
          </Upload>
        </FormField>
      </div>
    </AppModal>
  );
};

export default ReviewModal;
