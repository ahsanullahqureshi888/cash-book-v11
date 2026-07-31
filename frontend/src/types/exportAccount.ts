/**
 * TypeScript Data Schema Definitions for SKY ARIANA LTD Export Accounting Ledger
 */

export interface ExportTransactionItem {
  id: string | number;
  sn: number;
  date: string;
  shipper?: string;
  consignee?: string;
  commodityInvoice: string;
  invoiceNo?: string;
  blContainer?: string;
  containerNo?: string;
  blNo?: string;
  containerType?: string;
  quantity: number;
  creditUSD: number; // Export Charges / Invoices billed (USD)
  debitUSD: number;  // Payments Received / Cash & Transfer (USD)
  balanceUSD: number;// Running Balance (USD)
  type: 'invoice' | 'payment';
  notes?: string;    // Notes / Dari or Pashto description
}

export interface AccountProfileHeader {
  accountName: string;       // e.g., "HAJI IBRAHIM - DANISH AGHA"
  accountNameDari: string;   // e.g., "حاجی ابراهیم او دانش بهای"
  companyName: string;       // e.g., "SKY ARIANA & BALAM BAR BARAN"
  address: string;           // e.g., "Kandahar, Afghanistan"
  licenseNo: string;         // e.g., "2401-2198"
  currency: 'USD' | 'AFN';
}

export interface ExportLedgerSummary {
  totalContainers: number;
  totalCreditUSD: number;
  totalDebitUSD: number;
  netBalanceUSD: number;
}
