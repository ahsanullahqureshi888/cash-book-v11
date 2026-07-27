from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth_dependencies import require_authenticated_request
from ..database import get_db

router = APIRouter(prefix="/api/tenants/bawar-star", tags=["bawar-star-ledger"], dependencies=[Depends(require_authenticated_request)])


@router.get("/ledger-summary/{partner_id}", response_model=schemas.BawarStarLedgerSummary)
def get_bawar_star_ledger_summary(
    partner_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve categorized summary, net balance, and gross profit for a partner company."""
    partner = db.query(models.Account).filter(models.Account.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner account not found.")

    txs = (
        db.query(models.BawarStarTransaction)
        .filter(models.BawarStarTransaction.partner_company_id == partner_id)
        .all()
    )

    product_rev = 0.0
    freight_billed = 0.0
    pkg_billed = 0.0
    total_paid = 0.0
    gross_profit = 0.0

    for tx in txs:
        amt = float(tx.total_amount or 0.0)
        ttype = tx.transaction_type

        if ttype == "SELL_PRODUCT":
            product_rev += amt
            unit_price = float(tx.unit_price or 0.0)
            cogs = float(tx.unit_manufacturing_cost) if tx.unit_manufacturing_cost is not None else 0.0
            qty = float(tx.quantity or 0.0)
            gross_profit += (unit_price - cogs) * qty
        elif ttype == "PASS_THROUGH_FREIGHT":
            freight_billed += amt
        elif ttype == "PASS_THROUGH_PKG":
            pkg_billed += amt
        elif ttype == "PAYMENT_RECEIVED":
            total_paid += amt

    total_pass_through = freight_billed + pkg_billed
    total_billed = product_rev + total_pass_through
    net_outstanding = total_billed - total_paid

    profit_margin = round((gross_profit / product_rev * 100.0), 2) if product_rev > 0 else 0.0

    return schemas.BawarStarLedgerSummary(
        partner_company_id=partner.id,
        partner_company_name=partner.name,
        total_billed_amount=total_billed,
        total_payments_received=total_paid,
        net_outstanding_balance=net_outstanding,
        revenue_split=schemas.BawarStarRevenueSplit(
            product_revenue=product_rev,
            freight_billed=freight_billed,
            packaging_billed=pkg_billed,
            total_pass_through=total_pass_through
        ),
        estimated_gross_profit=gross_profit,
        profit_margin_percentage=profit_margin,
        total_transactions=len(txs)
    )


@router.get("/transactions/{partner_id}", response_model=List[schemas.BawarStarTransactionRead])
def get_bawar_star_partner_transactions(
    partner_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve transaction history with running balance for a partner account."""
    partner = db.query(models.Account).filter(models.Account.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner account not found.")

    txs = (
        db.query(models.BawarStarTransaction)
        .filter(models.BawarStarTransaction.partner_company_id == partner_id)
        .order_by(models.BawarStarTransaction.transaction_date.asc(), models.BawarStarTransaction.id.asc())
        .all()
    )

    running_bal = 0.0
    result = []

    for tx in txs:
        amt = float(tx.total_amount or 0.0)
        ttype = tx.transaction_type

        billed_amt = 0.0
        paid_amt = 0.0

        if ttype in ("SELL_PRODUCT", "PASS_THROUGH_FREIGHT", "PASS_THROUGH_PKG"):
            billed_amt = amt
            running_bal += amt
        elif ttype == "PAYMENT_RECEIVED":
            paid_amt = amt
            running_bal -= amt
        elif ttype in ("BUY_RAW_MATERIAL", "OPERATIONAL_EXPENSE"):
            billed_amt = amt

        item = schemas.BawarStarTransactionRead(
            id=tx.id,
            tenant_id=tx.tenant_id,
            partner_company_id=tx.partner_company_id,
            partner_company_name=partner.name,
            transaction_date=tx.transaction_date,
            transaction_type=tx.transaction_type,
            description_en=tx.description_en or "",
            description_ps=tx.description_ps or "",
            quantity=float(tx.quantity or 0.0),
            unit_price=float(tx.unit_price or 0.0),
            unit_manufacturing_cost=float(tx.unit_manufacturing_cost) if tx.unit_manufacturing_cost is not None else None,
            total_amount=amt,
            currency=tx.currency or "AFN",
            exchange_rate=float(tx.exchange_rate or 1.0),
            billed_amount=billed_amt,
            paid_amount=paid_amt,
            running_balance=running_bal,
            created_at=tx.created_at,
            updated_at=tx.updated_at
        )
        result.append(item)

    return result


@router.post("/transactions", response_model=schemas.BawarStarTransactionRead)
def create_bawar_star_transaction(
    payload: schemas.BawarStarTransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new Bawar Star manufacturing / pass-through transaction or payment."""
    partner = db.query(models.Account).filter(models.Account.id == payload.partner_company_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner account not found.")

    # Calculate total amount if not explicitly set
    calculated_total = payload.total_amount
    if calculated_total is None or calculated_total <= 0:
        if payload.quantity > 0 and payload.unit_price > 0:
            calculated_total = payload.quantity * payload.unit_price
        else:
            calculated_total = 0.0

    new_tx = models.BawarStarTransaction(
        tenant_id="bawar-star",
        partner_company_id=payload.partner_company_id,
        transaction_date=payload.transaction_date,
        transaction_type=payload.transaction_type,
        description_en=payload.description_en,
        description_ps=payload.description_ps,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        unit_manufacturing_cost=payload.unit_manufacturing_cost,
        total_amount=calculated_total,
        currency=payload.currency,
        exchange_rate=payload.exchange_rate
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    billed_amt = calculated_total if new_tx.transaction_type in ("SELL_PRODUCT", "PASS_THROUGH_FREIGHT", "PASS_THROUGH_PKG") else 0.0
    paid_amt = calculated_total if new_tx.transaction_type == "PAYMENT_RECEIVED" else 0.0

    return schemas.BawarStarTransactionRead(
        id=new_tx.id,
        tenant_id=new_tx.tenant_id,
        partner_company_id=new_tx.partner_company_id,
        partner_company_name=partner.name,
        transaction_date=new_tx.transaction_date,
        transaction_type=new_tx.transaction_type,
        description_en=new_tx.description_en or "",
        description_ps=new_tx.description_ps or "",
        quantity=float(new_tx.quantity or 0.0),
        unit_price=float(new_tx.unit_price or 0.0),
        unit_manufacturing_cost=float(new_tx.unit_manufacturing_cost) if new_tx.unit_manufacturing_cost is not None else None,
        total_amount=float(new_tx.total_amount or 0.0),
        currency=new_tx.currency or "AFN",
        exchange_rate=float(new_tx.exchange_rate or 1.0),
        billed_amount=billed_amt,
        paid_amount=paid_amt,
        running_balance=0.0,
        created_at=new_tx.created_at,
        updated_at=new_tx.updated_at
    )


@router.delete("/transactions/{transaction_id}")
def delete_bawar_star_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Delete a Bawar Star transaction."""
    tx = db.query(models.BawarStarTransaction).filter(models.BawarStarTransaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    db.delete(tx)
    db.commit()
    return {"status": "success", "message": "Transaction deleted successfully"}
