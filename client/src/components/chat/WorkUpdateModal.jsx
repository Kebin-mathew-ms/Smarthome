import React, { useState } from 'react';
import { Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import AppModal from '../common/AppModal';
import FormField from '../common/FormField';

const WorkUpdateModal = ({ open, onCancel, onSubmitUpdate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.warning('Please enter a title for the work progress update.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description) formData.append('description', description.trim());

      files.forEach(f => {
        formData.append('work_update_media', f);
      });

      await onSubmitUpdate(formData);
      setTitle('');
      setDescription('');
      setFiles([]);
      onCancel();
    } catch (err) {
      message.error(err.message || 'Failed to post work update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      title="Post Work Progress Update"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
    >
      <div style={{ marginTop: 16 }}>
        <FormField label="Update Title" required>
          <Input
            placeholder="e.g. Completed Main Electrical Wiring & Panel Install"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </FormField>

        <FormField label="Work Notes & Description">
          <Input.TextArea
            rows={3}
            placeholder="Detailed notes on work completed, materials replaced..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </FormField>

        <FormField label="Attach Progress Photos & Videos (Before/After)">
          <Upload
            beforeUpload={file => { setFiles(prev => [...prev, file]); return false; }}
            multiple
            accept="image/*,video/*"
          >
            <button style={{ border: '1px dashed #cbd5e1', padding: '8px 16px', borderRadius: 8, background: '#f8fafc', cursor: 'pointer' }}>
              <UploadOutlined style={{ marginRight: 6 }} /> Select Photos / Videos
            </button>
          </Upload>
        </FormField>
      </div>
    </AppModal>
  );
};

export default WorkUpdateModal;
