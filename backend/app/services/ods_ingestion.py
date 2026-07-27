import pandas as pd
from sqlalchemy import create_engine
import datetime
import os

# Connect to PostgreSQL Enterprise Database
DB_URI = os.getenv("DATABASE_URL", "sqlite:///./app.db")
engine = create_engine(DB_URI)

def migrate_ods_to_cashbook(ods_file_path: str, branch_id: str = "KABUL-PLANT-01"):
    """
    Reads legacy OpenDocument Spreadsheets (.ods) and ingests individual 
    sales and payment rows into the double-entry cashbook ledger.
    """
    print(f"Reading spreadsheet: {ods_file_path}...")
    
    if not os.path.exists(ods_file_path):
        print(f"File {ods_file_path} not found. Skipping ODS batch read.")
        return
        
    # Load sheets from the OpenDocument Spreadsheet
    excel_data = pd.read_excel(ods_file_path, sheet_name=None, engine='odf')
    
    ledger_records = []
    
    for sheet_name, df in excel_data.items():
        # Determine customer account based on sheet title
        if "یوسف احمد" in sheet_name or "Bawar" in sheet_name:
            company_id = "CUST-BAWAR-01"
        elif "شهاب" in sheet_name or "Shahab" in sheet_name:
            company_id = "CUST-SHAHAB-01"
        else:
            company_id = "CUST-GENERAL-01"
            
        print(f"Processing sheet '{sheet_name}' for Account: {company_id}")
        
        # Clean and iterate through rows
        df = df.dropna(how='all')
        for idx, row in df.iterrows():
            # Extract basic fields (adjusting for column indexing in Pashto/English layouts)
            description = str(row.get('جنس', 'Plastic Goods Purchase'))
            order_date = str(row.get('تاریخ', str(datetime.date.today())))
            
            # 1. Process Sales Revenue (Jumla Qimat / جمله قیمت)
            sales_amount = pd.to_numeric(row.get('جمله قیمت', 0), errors='coerce')
            if pd.notnull(sales_amount) and sales_amount > 0:
                ledger_records.extend([
                    {
                        "company_id": company_id,
                        "branch_id": branch_id,
                        "account_type": "Revenue",
                        "amount": float(sales_amount),
                        "transaction_type": "CREDIT",
                        "description": f"ODS Row {idx}: {description}",
                        "reference_id": f"ODS-{company_id[:6]}-{idx}"
                    },
                    {
                        "company_id": company_id,
                        "branch_id": branch_id,
                        "account_type": "Accounts_Receivable",
                        "amount": float(sales_amount),
                        "transaction_type": "DEBIT",
                        "description": f"ODS Row {idx}: {description}",
                        "reference_id": f"ODS-{company_id[:6]}-{idx}"
                    }
                ])
                
            # 2. Process Cash Received (Rasidgi / رسیدګی)
            cash_received = pd.to_numeric(row.get('رسیدګی', 0), errors='coerce')
            if pd.notnull(cash_received) and cash_received > 0:
                ledger_records.extend([
                    {
                        "company_id": company_id,
                        "branch_id": branch_id,
                        "account_type": "Cash_Asset",
                        "amount": float(cash_received),
                        "transaction_type": "DEBIT",
                        "description": f"ODS Payment Row {idx}: Cash/Preform Settlement",
                        "reference_id": f"ODS-PAY-{company_id[:6]}-{idx}"
                    },
                    {
                        "company_id": company_id,
                        "branch_id": branch_id,
                        "account_type": "Accounts_Receivable",
                        "amount": float(cash_received),
                        "transaction_type": "CREDIT",
                        "description": f"ODS Payment Row {idx}: Receivables Offset",
                        "reference_id": f"ODS-PAY-{company_id[:6]}-{idx}"
                    }
                ])
                
    # Bulk insert all generated transactions into PostgreSQL
    if ledger_records:
        ingestion_df = pd.DataFrame(ledger_records)
        ingestion_df.to_sql('cashbook_ledger', engine, if_exists='append', index=False)
        print(f"Successfully migrated {len(ledger_records)} ledger entries into PlastiCorp Enterprise DB!")
    else:
        print("No valid transaction rows found to migrate.")

if __name__ == "__main__":
    migrate_ods_to_cashbook("Bawar_Star_And_Shahab_Ledgers.ods")
