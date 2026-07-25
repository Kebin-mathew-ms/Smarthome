import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default UnauthorizedPage;
