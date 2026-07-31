import React from 'react';
import { useCompany } from '../../context/CompanyContext';
import TransportLedgerTable from '../transport/TransportLedgerTable';
import AccountLedger from '../../pages/AccountLedger';

/**
 * TenantModuleRouter
 * System Isolation Logic:
 * Decouples accounting UI modules based on tenant type.
 * - When active tenant is 'LOGISTICS_FREIGHT' (e.g. SKY ARIANA LTD), loads TransportLedgerTable
 * - Otherwise loads standard retail/manufacturing AccountLedger
 */
export default function TenantModuleRouter(props) {
  const { currentCompany } = useCompany();

  const isLogisticsTenant = 
    currentCompany?.id === 'sky-ariana' || 
    currentCompany?.type === 'LOGISTICS_FREIGHT' ||
    currentCompany?.name?.toLowerCase().includes('sky ariana');

  if (isLogisticsTenant) {
    return <TransportLedgerTable {...props} />;
  }

  return <AccountLedger {...props} />;
}
