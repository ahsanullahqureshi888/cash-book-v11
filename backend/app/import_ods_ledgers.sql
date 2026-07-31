-- ============================================================================
-- PlastiCorp Enterprise: ODS Migration Script (import_ods_ledgers.sql)
-- Ingests historical OpenDocument Spreadsheet (.ods) records from 
-- Bawar Star Industrial Company and Shahab Water Production Company
-- ============================================================================

-- 1. REGISTER CUSTOMER ACCOUNTS IN THE ENTERPRISE LEDGER
INSERT INTO companies (company_id, name, tax_id, account_type)
VALUES 
    ('CUST-BAWAR-01', 'Yusuf Ahmad & Aziz Ahmad (Bawar Star)', 'TAX-AFG-001', 'CUSTOMER_AR'),
    ('CUST-SHAHAB-01', 'Shahab Water Production Company', 'TAX-AFG-002', 'CUSTOMER_AR')
ON CONFLICT (company_id) DO NOTHING;

-- 2. IMPORT BAWAR STAR INDUSTRIAL LEDGER (YUSUF & AZIZ)
-- Total Sales: AFN 262,663 | Cash Received: AFN 151,363 | Outstanding Balance: AFN 111,300
INSERT INTO cashbook_ledger (company_id, branch_id, account_type, amount, transaction_type, description, reference_id)
VALUES 
    -- Log Historical Product Sales (Credit Revenue / Debit Accounts Receivable)
    ('CUST-BAWAR-01', 'KABUL-PLANT-01', 'Revenue', 262663.00, 'CREDIT', 'Historical ODS Import: Total Plastic Bottle & Jar Sales (65 Orders)', 'ODS-MIG-B01'),
    ('CUST-BAWAR-01', 'KABUL-PLANT-01', 'Accounts_Receivable', 262663.00, 'DEBIT', 'Historical ODS Import: Customer Liability for Orders #1 to #61', 'ODS-MIG-B01'),
    
    -- Log Payments Collected via Aziz Ahmad, Mohammad Shafiq & Preform Trade
    ('CUST-BAWAR-01', 'KABUL-PLANT-01', 'Cash_Asset', 151363.00, 'DEBIT', 'Historical ODS Import: Cumulative Cash & Preform Settlements Collected', 'ODS-MIG-B02'),
    ('CUST-BAWAR-01', 'KABUL-PLANT-01', 'Accounts_Receivable', 151363.00, 'CREDIT', 'Historical ODS Import: Receivables Offset from Cash Settlements', 'ODS-MIG-B02');

-- 3. IMPORT SHAHAB WATER PRODUCTION LEDGER
-- Total Sales: AFN 66,497 | Cash Received: AFN 66,297 | Outstanding Balance: AFN 200
INSERT INTO cashbook_ledger (company_id, branch_id, account_type, amount, transaction_type, description, reference_id)
VALUES 
    -- Log Historical 500ml & 1.5L Water Bottle Sales
    ('CUST-SHAHAB-01', 'KABUL-PLANT-01', 'Revenue', 66497.00, 'CREDIT', 'Historical ODS Import: Total Water Bottle Production Orders (25 Runs)', 'ODS-MIG-S01'),
    ('CUST-SHAHAB-01', 'KABUL-PLANT-01', 'Accounts_Receivable', 66497.00, 'DEBIT', 'Historical ODS Import: Customer Liability for Orders #1 to #25', 'ODS-MIG-S01'),
    
    -- Log Payments Collected via Abdul Wadood & Hikmatullah
    ('CUST-SHAHAB-01', 'KABUL-PLANT-01', 'Cash_Asset', 66297.00, 'DEBIT', 'Historical ODS Import: Cash Collected via Abdul Wadood & Hikmatullah', 'ODS-MIG-S02'),
    ('CUST-SHAHAB-01', 'KABUL-PLANT-01', 'Accounts_Receivable', 66297.00, 'CREDIT', 'Historical ODS Import: Receivables Offset from Cash Settlements', 'ODS-MIG-S02');
