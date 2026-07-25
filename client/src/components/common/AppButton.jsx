import React, { forwardRef } from 'react';
import { Button } from 'antd';

const AppButton = forwardRef(({ children, type = 'default', loading = false, icon, onClick, htmlType = 'button', danger = false, block = false, size = 'middle', disabled = false, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      type={type}
      loading={loading}
      icon={icon}
      onClick={onClick}
      htmlType={htmlType}
      danger={danger}
      block={block}
      size={size}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
});

AppButton.displayName = 'AppButton';

export default AppButton;
