/**
 * Export Accounts & Ledgers Data matching master Excel workbook:
 * ALL-EXPORT-COMPANIES-ACCOUNT-LEDGER-04_2.xlsx
 */

export const DUMMY_EXPORT_ACCOUNTS = [
  {
    id: 'haji-ibrahim',
    clientName: 'HAJI IBRAHIM - DANISH AGHA',
    clientNameDari: 'حاجی ابراهیم او دانش بهای',
    contactInfo: 'Kandahar Freight Center, AF | +93 799 123456',
    currency: 'USD',
    licenseNo: '2401-2198',
    location: 'Kandahar, AF',
    transactions: [
      {
        id: 1,
        sn: 1,
        date: '28-Feb-26',
        shipper: 'NAJEB-AMIN LTD',
        consignee: 'MIDA ENTERPRISES',
        commodityInvoice: '2300 CNT GREEN RAISINS (INV: 002)',
        blContainer: 'RXTU4545407 (1X40 HC) / JADSUHN5A33481',
        isSurrenderedBL: true,
        quantity: 1,
        creditUSD: 2050.00,
        debitUSD: 0,
        balanceUSD: 2050.00,
        type: 'shipment',
        notes: ''
      },
      {
        id: 2,
        sn: 2,
        date: '27-Feb-26',
        shipper: 'NAJEB-AMIN LTD',
        consignee: 'MIDA ENTERPRISES',
        commodityInvoice: '2315 CNT GREEN RAISINS (INV: 001)',
        blContainer: 'PCIU8304571 (1X40 HC) / BWSBNONSA2009231',
        isSurrenderedBL: true,
        quantity: 1,
        creditUSD: 18540.00,
        debitUSD: 0,
        balanceUSD: 20590.00,
        type: 'shipment',
        notes: ''
      },
      {
        id: 3,
        sn: 3,
        date: '25-Feb-26',
        shipper: 'KARIM ABID TRANSIT',
        consignee: 'ARISSA INT\'L',
        commodityInvoice: '2300 CTNS RAISIN (INV: N/A)',
        blContainer: 'FCIU8617410 (1X40 HC) / JADSUHNSA3371',
        isSurrenderedBL: false,
        quantity: 1,
        creditUSD: 18540.00,
        debitUSD: 0,
        balanceUSD: 39130.00,
        type: 'shipment',
        notes: ''
      },
      {
        id: 4,
        sn: 4,
        date: '02-Mar-26',
        shipper: 'HAJI IBRAHIM HAWALA',
        consignee: 'SKY ARIANA TREASURY',
        commodityInvoice: 'HAWALA PAYMENT RECEIVED via DUBAI',
        blContainer: 'REF: HWL-77402-KND',
        isSurrenderedBL: false,
        quantity: 0,
        creditUSD: 0,
        debitUSD: 113520.00,
        balanceUSD: -74390.00,
        type: 'payment',
        notes: 'Paid in full via Hawala Transfer'
      }
    ]
  },
  {
    id: 'hussain-ayubi',
    clientName: 'Hussain-Ayubi-ltd',
    clientNameDari: 'حسین ایوبی لمیتد',
    contactInfo: 'Herat Industrial Zone, AF | +93 799 654321',
    currency: 'USD',
    licenseNo: '4502-8812',
    location: 'Herat, AF',
    transactions: [
      {
        id: 101,
        sn: 1,
        date: '05-Jan-26',
        shipper: 'HUSSAIN AYUBI EXP',
        consignee: 'AL SHAMS LOGISTICS DUBAI',
        commodityInvoice: '1400 CTNS SAFFRON & DRY FRUITS (INV: HA-01)',
        blContainer: 'MSCU9941028 (1X20 FT) / BL-DXB-9021',
        isSurrenderedBL: true,
        quantity: 1,
        creditUSD: 35000.00,
        debitUSD: 0,
        balanceUSD: 35000.00,
        type: 'shipment',
        notes: 'Express clearance approved'
      },
      {
        id: 102,
        sn: 2,
        date: '18-Jan-26',
        shipper: 'HUSSAIN AYUBI EXP',
        consignee: 'GULF LOGISTICS CORP',
        commodityInvoice: '2200 CTNS BLACK RAISINS (INV: HA-02)',
        blContainer: 'CMAU1094821 (1X40 HC) / BL-DXB-9088',
        isSurrenderedBL: false,
        quantity: 1,
        creditUSD: 50000.00,
        debitUSD: 0,
        balanceUSD: 85000.00,
        type: 'shipment',
        notes: ''
      },
      {
        id: 103,
        sn: 3,
        date: '01-Feb-26',
        shipper: 'HAWALA RECEIPT',
        consignee: 'SKY ARIANA LTD',
        commodityInvoice: 'PARTIAL PAYMENT via SARAFI HERAT',
        blContainer: 'REF: HWL-HRT-4401',
        isSurrenderedBL: false,
        quantity: 0,
        creditUSD: 0,
        debitUSD: 52000.00,
        balanceUSD: 33000.00,
        type: 'payment',
        notes: 'Partial payment received'
      }
    ]
  },
  {
    id: 'najeb-amin',
    clientName: 'NAJEB-AMIN LTD',
    clientNameDari: 'نجیب امین لمیتد',
    contactInfo: 'Kabul Custom Market, AF | +93 700 987654',
    currency: 'USD',
    licenseNo: '1109-3341',
    location: 'Kabul, AF',
    transactions: [
      {
        id: 201,
        sn: 1,
        date: '10-Feb-26',
        shipper: 'NAJEB-AMIN TRANSIT',
        consignee: 'TURKISH OVERSEAS IMPORT',
        commodityInvoice: '1800 CTNS PISTACHIO & ALMONDS (INV: NA-90)',
        blContainer: 'HLCU0019283 (1X40 HC) / BL-IST-1102',
        isSurrenderedBL: true,
        quantity: 1,
        creditUSD: 64500.00,
        debitUSD: 0,
        balanceUSD: 64500.00,
        type: 'shipment',
        notes: 'Original B/L Surrendered at Jebel Ali'
      },
      {
        id: 202,
        sn: 2,
        date: '20-Feb-26',
        shipper: 'BANK WIRE TRANSFER',
        consignee: 'SKY ARIANA ACCOUNT',
        commodityInvoice: 'HAWALA / BANK DEPOSIT IN USD',
        blContainer: 'REF: BK-TRF-00921',
        isSurrenderedBL: false,
        quantity: 0,
        creditUSD: 0,
        debitUSD: 40000.00,
        balanceUSD: 24500.00,
        type: 'payment',
        notes: 'Direct Sarafi Hawala'
      }
    ]
  },
  {
    id: 'mida-enterprises',
    clientName: 'MIDA ENTERPRISES',
    clientNameDari: 'میدا انترپرایزز',
    contactInfo: 'Dubai Office: Al Ras, Deira | +971 4 2234567',
    currency: 'USD',
    licenseNo: 'DXB-99214',
    location: 'Dubai, UAE',
    transactions: [
      {
        id: 301,
        sn: 1,
        date: '14-Feb-26',
        shipper: 'SKY ARIANA LOGISTICS',
        consignee: 'MIDA ENTERPRISES DUBAI',
        commodityInvoice: '3000 CTNS FIG & POMEGRANATE (INV: ME-801)',
        blContainer: 'ONEY9823104 (2X40 HC) / BL-ME-991',
        isSurrenderedBL: true,
        quantity: 2,
        creditUSD: 92400.00,
        debitUSD: 0,
        balanceUSD: 92400.00,
        type: 'shipment',
        notes: '2 Containers Delivered'
      },
      {
        id: 302,
        sn: 2,
        date: '28-Feb-26',
        shipper: 'MIDA TREASURY',
        consignee: 'SKY ARIANA DUBAI',
        commodityInvoice: 'FULL SETTLEMENT PAYMENT IN DUBAI',
        blContainer: 'REF: DXB-CHQ-77102',
        isSurrenderedBL: false,
        quantity: 0,
        creditUSD: 0,
        debitUSD: 92400.00,
        balanceUSD: 0.00,
        type: 'payment',
        notes: 'Settled in Full'
      }
    ]
  }
];
