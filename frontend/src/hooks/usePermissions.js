import { useTenant } from '../context/CompanyContext';

const ROLE_PERMISSIONS = {
  ADMIN: ['view:ledger', 'create:transaction', 'export:csv', 'manage:accounts', 'view:metrics', 'delete:transaction'],
  ADMINISTRATOR: ['view:ledger', 'create:transaction', 'export:csv', 'manage:accounts', 'view:metrics', 'delete:transaction'],
  SUPER_ADMIN: ['view:ledger', 'create:transaction', 'export:csv', 'manage:accounts', 'view:metrics', 'delete:transaction'],
  MANAGER: ['view:ledger', 'create:transaction', 'export:csv', 'view:metrics'],
  BRANCH_MANAGER: ['view:ledger', 'create:transaction', 'export:csv', 'view:metrics'],
  CASHIER: ['create:transaction', 'view:today_summary'],
  CLERK: ['create:transaction', 'view:today_summary']
};

export const usePermissions = () => {
  const { activeCompany } = useTenant();

  const user = (() => {
    try {
      const stored = localStorage.getItem('cashbook_user') || localStorage.getItem('cashbook-auth-user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse cached user permissions:', e);
    }
    return {
      name: 'Standard User',
      role: 'ADMINISTRATOR',
      assignedCompanies: ['cashbook_skyariana_prod', 'cashbook_bawar_prod', 'bawar-star', 'sky-ariana']
    };
  })();

  const normalizedRole = (user.role || 'ADMINISTRATOR').toUpperCase().replace(/\s+/g, '_');

  const hasPermission = (action) => {
    if (user.assignedCompanies && user.assignedCompanies.length > 0) {
      const isAssigned = user.assignedCompanies.some(c => 
        c === activeCompany?.id || c === activeCompany?.dbName || c === 'ALL'
      );
      if (!isAssigned && normalizedRole !== 'ADMIN' && normalizedRole !== 'ADMINISTRATOR' && normalizedRole !== 'SUPER_ADMIN') {
        return false;
      }
    }

    const permissions = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS['ADMINISTRATOR'];
    return permissions.includes(action);
  };

  return { user, hasPermission, role: user.role || 'Administrator' };
};

export default usePermissions;
