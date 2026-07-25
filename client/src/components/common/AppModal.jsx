import React from 'react';
import { Modal } from 'antd';

const AppModal = ({ title, open, onOk, onCancel, confirmLoading = false, children, okText = 'Save', cancelText = 'Cancel', width = 520, ...props }) => {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={okText}
      cancelText={cancelText}
      width={width}
      destroyOnHidden
      centered
      {...props}
    >
      {children}
    </Modal>
  );
};

export default AppModal;
