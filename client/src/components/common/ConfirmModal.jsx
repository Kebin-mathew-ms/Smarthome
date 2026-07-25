import { Modal } from 'antd';

export const showConfirmModal = ({
  title = 'Are you sure?',
  content = 'This action cannot be undone.',
  okText = 'Yes, Delete',
  okType = 'danger',
  cancelText = 'Cancel',
  onOk
}) => {
  Modal.confirm({
    title,
    content,
    okText,
    okType,
    cancelText,
    centered: true,
    onOk
  });
};
