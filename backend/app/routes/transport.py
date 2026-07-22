from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth_dependencies import (
    require_authenticated_request,
    require_administrator_request,
)

router = APIRouter(prefix="/api", tags=["transport-ledger"])


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

    running_bal = 0.0
    response_list = []
    for idx, l in enumerate(ledgers):
        running_bal += (l.credit_usd - l.debit_usd)
        response_list.append(schemas.TransportLedgerResponse(
            id=l.id,
            client_id=l.client_id,
            sn=idx + 1,
            transaction_type=l.transaction_type,
            date=l.date,
            shipper=l.shipper,
            consignee=l.consignee,
            commodity_description=l.commodity_description,
            invoice_no=l.invoice_no,
            bill_of_lading=l.bill_of_lading,
            container_no=l.container_no,
            container_size=l.container_size,
            quantity=l.quantity,
            price_per_container=l.price_per_container,
            credit_usd=l.credit_usd,
            debit_usd=l.debit_usd,
            running_balance_usd=running_bal,
            is_surrendered_bl=l.is_surrendered_bl,
            notes=l.notes
        ))
    return response_list


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
