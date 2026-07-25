import React from 'react';
import { Modal, Image as AntImage } from 'antd';

const MediaViewerModal = ({ open, onCancel, mediaUrl, mediaType = 'image' }) => {
  if (!mediaUrl) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      centered
      bodyStyle={{ padding: 0, background: '#000', borderRadius: 8, overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        {mediaType === 'video' ? (
          <video src={mediaUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        ) : (
          <img src={mediaUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
        )}
      </div>
    </Modal>
  );
};

export default MediaViewerModal;
