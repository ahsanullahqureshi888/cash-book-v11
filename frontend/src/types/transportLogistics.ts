/**
 * Isolated Transport & International Logistics Accounting System Data Models
 * Specialized for SKY ARIANA LTD (Sky Ariana & Balam Bar Baran)
 */

export type TenantType = 'LOGISTICS_FREIGHT' | 'STANDARD_RETAIL';
export type ContainerSize = '20FT_STD' | '40FT_STD' | '40FT_HC' | '45FT_HC' | 'LCL';
export type PaymentMethodType = 'HAWALA_TRANSFER' | 'DUBAI_CASH_DROP' | 'BANK_WIRE' | 'CASH_KABUL';
export type TransactionCategory = 'FREIGHT_INVOICE' | 'HAWALA_PAYMENT' | 'CUSTOMS_DUTY' | 'PORT_DEMURRAGE';

export interface TenantConfig {
  id: string;
  name: string;
  code: string;
  type: TenantType;
  primaryCurrency: 'USD' | 'AFN' | 'AED';
  secondaryCurrency?: 'AFN' | 'USD';
  licenseNo: string;
  address: string;
}

export interface ClientAccount {
  id: string;
  accountNumber: string;
  accountName: string;         // e.g., "HAJI IBRAHIM - DANISH AGHA"
  accountNameDari?: string;     // e.g., "حاجی ابراهیم او دانش بهای"
  clientType: 'EXPORTER' | 'IMPORTER' | 'TRANSIT_AGENT' | 'CONSIGNEE';
  phone?: string;
  email?: string;
  city: string;                // e.g., "Kandahar", "Dubai", "Kabul"
  country: string;
  currentBalanceUSD: number;
}

export interface ContainerDetail {
  containerNo: string;         // e.g., "RXTU4545407"
  typeSize: ContainerSize;     // e.g., "40FT_HC"
  sealNumber?: string;
  weightKg?: number;
}

export interface FreightShipmentInvoice {
  id: string;
  invoiceNo: string;           // e.g., "INV-2026-002"
  shipmentDate: string;
  shipper: string;             // Exporter Company e.g. "NAJEB-AMIN LTD"
  consignee: string;           // Importer Company e.g. "MIDA ENTERPRISES"
  blNumber: string;            // Bill of Lading e.g. "JADSUHN5A33481"
  commodity: string;           // Goods description e.g. "2300 CNT GREEN RAISINS"
  containers: ContainerDetail[];
  containerQuantity: number;
  ratePerContainerUSD: number; // Unit Freight Cost
  totalFreightCostUSD: number; // Total Credit Amount (USD)
  originPort: string;          // e.g., "Hairatan Border"
  destinationPort: string;     // e.g., "Jebel Ali / Dubai"
}

export interface HawalaPaymentReceipt {
  id: string;
  receiptNo: string;           // e.g., "HAW-7950568"
  paymentDate: string;
  amountUSD: number;
  exchangeRateAFN?: number;    // e.g., 64.30
  amountAFN?: number;
  method: PaymentMethodType;
  depositedBy: string;         // Person making payment e.g. "Danish Agha" / "Haji Ibrahim"
  hawalaAgentName?: string;    // e.g., "Mohammad Adras"
  hawalaRefNo?: string;        // e.g., "7950568"
  cityLocation: string;        // e.g., "Dubai", "Kabul", "Kandahar"
  notesDari?: string;          // e.g. "نقدی په دوبی کی دانش بیای راته جعمه کړی"
}

export interface TransportLedgerEntry {
  id: string;
  sn: number;
  date: string;
  tenantId: string;
  accountId: string;
  shipper: string;
  consignee: string;
  commodityInvoice: string;
  blContainerNo: string;
  containerQty: number;
  ratePerContainerUSD: number;
  creditUSD: number;           // Freight Invoice Billed (Charges Owed)
  debitUSD: number;            // Hawala / Cash Payment Deposited
  runningBalanceUSD: number;   // Cumulative Balance
  category: TransactionCategory;
  notesDari?: string;
  shipmentRef?: FreightShipmentInvoice;
  paymentRef?: HawalaPaymentReceipt;
}
