import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const RoleGuard = ({ roles, children }) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
};

export default RoleGuard;
