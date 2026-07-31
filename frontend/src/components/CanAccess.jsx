import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

export const CanAccess = ({ perform, fallback = null, children }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(perform)) {
    return fallback;
  }

  return <>{children}</>;
};

export default CanAccess;
