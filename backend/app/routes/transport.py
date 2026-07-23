import io
import math
import pandas as pd
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, File, UploadFile, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth_dependencies import (
    require_authenticated_request,
    require_administrator_request,
)

router = APIRouter(prefix="/api", tags=["transport-ledger"])


def _parse_float_val(val) -> float:
    if val is None or pd.isna(val):
        return 0.0
    if isinstance(val, (int, float)):
        return float(val) if not math.isnan(val) else 0.0
    s = str(val).replace(',', '').replace('$', '').strip()
    try:
        return float(s)
    except ValueError:
        return 0.0


def _parse_int_val(val) -> int:
    if val is None or pd.isna(val):
        return 1
    if isinstance(val, (int, float)):
        return int(val) if not math.isnan(val) else 1
    s = str(val).replace(',', '').strip()
    try:
        return int(float(s))
    except ValueError:
        return 1


@router.post("/import-master-excel")
async def import_master_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(require_administrator_request)
):
    """
    POST /api/import-master-excel
    Bulk imports historical transport ledger data from a multi-sheet Master Excel file (.xlsx).
    Handles dynamic header detection and Persian/English column mapping across 40+ client sheets.
    Admin-only.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are supported.")

    contents = await file.read()
    file_bytes = io.BytesIO(contents)

    try:
        xls = pd.ExcelFile(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse Excel file: {str(e)}")

    sheets_processed = 0
    total_records_imported = 0
    clients_created = 0
    imported_clients_list = []

    for sheet_name in xls.sheet_names:
        clean_sheet_name = str(sheet_name).strip()
        if not clean_sheet_name or clean_sheet_name.lower().startswith(('sheet', 'summary', 'template')):
            continue

        try:
            file_bytes.seek(0)
            df_raw = pd.read_excel(file_bytes, sheet_name=sheet_name, header=None)
        except Exception:
            continue

        if df_raw.empty:
            continue

        # 1. Find actual header row (varies between row 2 and 5)
        header_idx = -1
        for idx, row in df_raw.iterrows():
            row_str = " ".join([str(x).upper() for x in row.values if pd.notna(x)])
            if any(kw in row_str for kw in ['S.N', 'SN', 'DATE', 'تاریخ', 'DEBIT', 'CREDIT', 'BALANCE', 'مانده', 'واریزی', 'B/L', 'CONTAINER']):
                header_idx = idx
                break

        if header_idx == -1:
            continue

        # 2. Re-read dataframe with header row
        file_bytes.seek(0)
        df = pd.read_excel(file_bytes, sheet_name=sheet_name, header=header_idx)
        if df.empty:
            continue

        # 3. Dynamic Column Mapping (Persian & English)
        col_map = {}
        for col in df.columns:
            col_up = str(col).upper().replace('\n', ' ').strip()
            if 'S.NO' in col_up or 'S.N' in col_up or 'نمبر' in col_up or 'SN' in col_up:
                col_map[col] = 'serial_number'
            elif 'DATE' in col_up or 'تاریخ' in col_up:
                col_map[col] = 'date'
            elif 'SHIPPER' in col_up or 'DESCRIPTION' in col_up or 'فرستنده' in col_up or 'تفصیلات' in col_up:
                col_map[col] = 'shipper_description'
            elif 'INVOICE' in col_up or 'فاکتور' in col_up:
                col_map[col] = 'invoice_no'
            elif 'B/L' in col_up or 'بی ال' in col_up or 'LANDING' in col_up or 'LADING' in col_up:
                col_map[col] = 'bill_of_lading'
            elif 'CONTIANER' in col_up or 'CONTAINER' in col_up or 'کانتینر' in col_up:
                col_map[col] = 'container_no'
            elif 'CONSIGNEE' in col_up or 'گیرنده' in col_up:
                col_map[col] = 'consignee'
            elif 'QUANTITY' in col_up or 'تعداد' in col_up or 'QTY' in col_up:
                col_map[col] = 'quantity'
            elif 'DEBIT' in col_up or 'بسته' in col_up or 'رسید' in col_up:
                col_map[col] = 'debit'
            elif 'CREDIT' in col_up or 'واریزی' in col_up or 'پرداخت' in col_up:
                col_map[col] = 'credit'
            elif 'BALANCE' in col_up or 'مانده' in col_up or 'باقی' in col_up:
                col_map[col] = 'balance'

        df = df.rename(columns=col_map)

        # Check or create ExportClient
        client = db.query(models.ExportClient).filter(models.ExportClient.name == clean_sheet_name).first()
        if not client:
            client = models.ExportClient(
                name=clean_sheet_name,
                contact_info=f"Imported sheet: {clean_sheet_name}",
                currency="USD"
            )
            db.add(client)
            db.flush()
            clients_created += 1

        new_ledgers = []
        for _, row in df.iterrows():
            debit_val = _parse_float_val(row.get('debit'))
            credit_val = _parse_float_val(row.get('credit'))
            shipper_desc = str(row.get('shipper_description', '')).strip() if pd.notna(row.get('shipper_description')) else ''
            bl_no = str(row.get('bill_of_lading', '')).strip() if pd.notna(row.get('bill_of_lading')) else ''
            inv_no = str(row.get('invoice_no', '')).strip() if pd.notna(row.get('invoice_no')) else ''
            cont_no = str(row.get('container_no', '')).strip() if pd.notna(row.get('container_no')) else ''

            if debit_val == 0.0 and credit_val == 0.0 and not shipper_desc and not bl_no and not cont_no:
                continue

            raw_date = row.get('date')
            if pd.notna(raw_date):
                if isinstance(raw_date, datetime):
                    date_str = raw_date.strftime('%Y-%m-%d')
                else:
                    date_str = str(raw_date).split('T')[0].strip()
            else:
                date_str = datetime.utcnow().strftime('%Y-%m-%d')

            tx_type = "payment" if debit_val > 0 and credit_val == 0 else "shipment"

            ledger = models.TransportLedger(
                client_id=client.id,
                transaction_type=tx_type,
                date=date_str,
                shipper=shipper_desc or client.name,
                consignee=str(row.get('consignee', '')).strip() if pd.notna(row.get('consignee')) else '',
                commodity_description=shipper_desc,
                invoice_no=inv_no,
                bill_of_lading=bl_no,
                container_no=cont_no,
                container_size="1X40_HC",
                quantity=_parse_int_val(row.get('quantity')),
                price_per_container=credit_val if credit_val > 0 else 0.0,
                credit_usd=credit_val,
                debit_usd=debit_val,
                is_surrendered_bl=False,
                notes=f"Imported from {clean_sheet_name}"
            )
            new_ledgers.append(ledger)

        if new_ledgers:
            db.add_all(new_ledgers)
            sheets_processed += 1
            total_records_imported += len(new_ledgers)
            imported_clients_list.append(clean_sheet_name)

    db.commit()

    return {
        "status": "success",
        "message": f"Successfully imported {total_records_imported} records across {sheets_processed} client sheets.",
        "sheets_processed": sheets_processed,
        "total_records_imported": total_records_imported,
        "clients_created": clients_created,
        "imported_clients": imported_clients_list
    }


@router.get("/clients", response_model=List[schemas.ExportClientResponse])
def list_export_clients(
    request: Request, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authenticated_request)
):
    """
    GET /api/clients
    Returns a list of all export clients for the sidebar.
    Accessible to all authenticated users (Admin & Data Entry Clerk).
    """
    clients = db.query(models.ExportClient).all()
    if not clients:
        default_client = models.ExportClient(
            name="NAJEB-AMIN LTD",
            contact_info="Kandahar, AF | Lic: 89432-AF",
            currency="USD"
        )
        db.add(default_client)
        db.commit()
        db.refresh(default_client)
        clients = [default_client]

    result = []
    for client in clients:
        ledgers = db.query(models.TransportLedger).filter(models.TransportLedger.client_id == client.id).all()
        total_credit = sum(l.credit_usd for l in ledgers)
        total_debit = sum(l.debit_usd for l in ledgers)
        net_balance = total_credit - total_debit
        result.append(schemas.ExportClientResponse(
            id=client.id,
            name=client.name,
            contact_info=client.contact_info,
            currency=client.currency,
            total_credit_usd=total_credit,
            total_debit_usd=total_debit,
            net_balance_usd=net_balance
        ))
    return result


@router.post("/clients", response_model=schemas.ExportClientResponse)
def create_export_client(
    payload: schemas.ExportClientCreate, 
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(require_administrator_request)
):
    """
    POST /api/clients
    Creates a new export client profile. Admin-only.
    """
    existing = db.query(models.ExportClient).filter(models.ExportClient.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client with this name already exists")
    
    client = models.ExportClient(
        name=payload.name,
        contact_info=payload.contact_info or "",
        currency=payload.currency or "USD"
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    return schemas.ExportClientResponse(
        id=client.id,
        name=client.name,
        contact_info=client.contact_info,
        currency=client.currency,
        total_credit_usd=0.0,
        total_debit_usd=0.0,
        net_balance_usd=0.0
    )


@router.get("/clients/{client_id}/ledger", response_model=List[schemas.TransportLedgerResponse])
def get_client_ledger(
    client_id: int, 
    request: Request, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authenticated_request)
):
    """
    GET /api/clients/{client_id}/ledger
    Returns full ledger history for a specific client, calculating running balance.
    Accessible to all authenticated users (Admin & Data Entry Clerk).
    """
    client = db.query(models.ExportClient).filter(models.ExportClient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    ledgers = (
        db.query(models.TransportLedger)
        .filter(models.TransportLedger.client_id == client_id)
        .order_by(models.TransportLedger.id.asc())
        .all()
    )

@router.get("/clients/{client_id}/ledger-paginated")
def get_client_ledger_paginated(
    client_id: int, 
    page: int = 1,
    page_size: int = 50,
    search: str = None,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authenticated_request)
):
    """
    GET /api/clients/{client_id}/ledger-paginated
    Server-side paginated ledger endpoint with Limit & Offset database queries.
    Returns slice items, total count, page info, and client summary.
    """
    client = db.query(models.ExportClient).filter(models.ExportClient.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    query = db.query(models.TransportLedger).filter(models.TransportLedger.client_id == client_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            models.or_(
                models.TransportLedger.container_no.ilike(s),
                models.TransportLedger.bill_of_lading.ilike(s),
                models.TransportLedger.invoice_no.ilike(s),
                models.TransportLedger.shipper_description.ilike(s),
                models.TransportLedger.consignee.ilike(s)
            )
        )

    total_records = query.count()
    total_pages = max(1, math.ceil(total_records / page_size))
    offset = (page - 1) * page_size

    ledgers = query.order_by(models.TransportLedger.id.asc()).offset(offset).limit(page_size).all()

    items = []
    for idx, l in enumerate(ledgers):
        items.append({
            "id": l.id,
            "client_id": l.client_id,
            "sn": offset + idx + 1,
            "transaction_type": l.transaction_type,
            "date": l.date,
            "shipper": l.shipper,
            "consignee": l.consignee,
            "commodity_description": l.commodity_description,
            "invoice_no": l.invoice_no,
            "bill_of_lading": l.bill_of_lading,
            "container_no": l.container_no,
            "container_size": l.container_size,
            "quantity": l.quantity,
            "price_per_container": l.price_per_container,
            "credit_usd": l.credit,
            "debit_usd": l.debit,
            "is_surrendered_bl": l.is_surrendered_bl,
            "notes": l.notes
        })

    return {
        "items": items,
        "total_records": total_records,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "client_id": client.id,
        "client_name": client.name
    }


@router.post("/transactions", response_model=schemas.TransportLedgerResponse)
def create_transport_transaction(
    payload: schemas.TransportLedgerCreate, 
    request: Request, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authenticated_request)
):
    """
    POST /api/transactions
    Inserts a new shipment (Credit) or Hawala payment (Debit).
    Accessible to all authenticated users (Admin & Data Entry Clerk).
    """
    client = None
    if payload.client_id:
        client = db.query(models.ExportClient).filter(models.ExportClient.id == payload.client_id).first()
    
    if not client and payload.client_name:
        client = db.query(models.ExportClient).filter(models.ExportClient.name == payload.client_name).first()
        if not client:
            client = models.ExportClient(name=payload.client_name, contact_info="Transport Client", currency="USD")
            db.add(client)
            db.commit()
            db.refresh(client)

    if not client:
        client = db.query(models.ExportClient).first()
        if not client:
            client = models.ExportClient(name="NAJEB-AMIN LTD", contact_info="Kandahar, AF", currency="USD")
            db.add(client)
            db.commit()
            db.refresh(client)

    tx_type = "payment" if payload.transaction_type == "payment" else "shipment"
    credit = float(payload.credit_usd or 0.0) if tx_type == "shipment" else 0.0
    debit = float(payload.debit_usd or 0.0) if tx_type == "payment" else 0.0

    ledger = models.TransportLedger(
        client_id=client.id,
        transaction_type=tx_type,
        date=payload.date,
        shipper=payload.shipper or client.name,
        consignee=payload.consignee or "",
        commodity_description=payload.commodity_description or "",
        invoice_no=payload.invoice_no or "",
        bill_of_lading=payload.bill_of_lading or "",
        container_no=payload.container_no or "",
        container_size=payload.container_size or "1X40_HC",
        quantity=int(payload.quantity or 1),
        price_per_container=float(payload.price_per_container or 0.0),
        credit_usd=credit,
        debit_usd=debit,
        is_surrendered_bl=bool(payload.is_surrendered_bl),
        notes=payload.notes or ""
    )
    db.add(ledger)
    db.commit()
    db.refresh(ledger)

    # Calculate row-by-row running balance
    all_ledgers = (
        db.query(models.TransportLedger)
        .filter(models.TransportLedger.client_id == client.id)
        .order_by(models.TransportLedger.id.asc())
        .all()
    )
    running_bal = sum((l.credit_usd - l.debit_usd) for l in all_ledgers)
    sn = len(all_ledgers)

    return schemas.TransportLedgerResponse(
        id=ledger.id,
        client_id=ledger.client_id,
        sn=sn,
        transaction_type=ledger.transaction_type,
        date=ledger.date,
        shipper=ledger.shipper,
        consignee=ledger.consignee,
        commodity_description=ledger.commodity_description,
        invoice_no=ledger.invoice_no,
        bill_of_lading=ledger.bill_of_lading,
        container_no=ledger.container_no,
        container_size=ledger.container_size,
        quantity=ledger.quantity,
        price_per_container=ledger.price_per_container,
        credit_usd=ledger.credit_usd,
        debit_usd=ledger.debit_usd,
        running_balance_usd=running_bal,
        is_surrendered_bl=ledger.is_surrendered_bl,
        notes=ledger.notes
    )


@router.delete("/transactions/{transaction_id}")
def delete_transport_transaction(
    transaction_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authenticated_request),
    current_admin: models.User = Depends(require_administrator_request)
):
    """
    DELETE /api/transactions/{transaction_id}
    Deletes a ledger record. Admin-only.
    """
    ledger = db.query(models.TransportLedger).filter(models.TransportLedger.id == transaction_id).first()
    if not ledger:
        raise HTTPException(status_code=404, detail="Transaction record not found")

    db.delete(ledger)
    db.commit()
    return {"message": "Transaction record deleted successfully", "id": transaction_id}


@router.get("/summary", response_model=schemas.GrandSummaryResponse)
def get_grand_summary(
    request: Request, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authenticated_request),
    current_admin: models.User = Depends(require_administrator_request)
):
    """
    GET /api/summary
    Returns aggregated Grand Totals for the summary dashboard.
    Admin-only (Data Entry Clerks receive 403 Forbidden).
    """
    clients = db.query(models.ExportClient).all()
    all_ledgers = db.query(models.TransportLedger).all()

    grand_total_credits = sum(l.credit_usd for l in all_ledgers)
    grand_total_debits = sum(l.debit_usd for l in all_ledgers)
    net_outstanding = grand_total_credits - grand_total_debits
    total_containers = sum(l.quantity for l in all_ledgers if l.transaction_type == "shipment")
    surrendered_count = sum(1 for l in all_ledgers if l.is_surrendered_bl)

    client_responses = []
    for client in clients:
        c_ledgers = [l for l in all_ledgers if l.client_id == client.id]
        c_credit = sum(l.credit_usd for l in c_ledgers)
        c_debit = sum(l.debit_usd for l in c_ledgers)
        client_responses.append(schemas.ExportClientResponse(
            id=client.id,
            name=client.name,
            contact_info=client.contact_info,
            currency=client.currency,
            total_credit_usd=c_credit,
            total_debit_usd=c_debit,
            net_balance_usd=c_credit - c_debit
        ))

    return schemas.GrandSummaryResponse(
        grand_total_credits_usd=grand_total_credits,
        grand_total_debits_usd=grand_total_debits,
        net_outstanding_balance_usd=net_outstanding,
        total_containers=total_containers,
        surrendered_bl_count=surrendered_count,
        clients=client_responses
    )

