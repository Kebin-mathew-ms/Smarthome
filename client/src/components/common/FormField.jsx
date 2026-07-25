import React from 'react';
import { Form } from 'antd';

const FormField = ({ label, name, error, required = false, children, help }) => {
  return (
    <Form.Item
      label={label}
      validateStatus={error ? 'error' : ''}
      help={error ? error.message || error : help}
      required={required}
      style={{ marginBottom: 16 }}
    >
      {children}
    </Form.Item>
  );
};

export default FormField;
