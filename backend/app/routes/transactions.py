from __future__ import annotations

import csv
import io
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth_dependencies import require_authenticated_request
from ..database import SessionLocal

router = APIRouter(prefix="/api/transactions", tags=["transactions"], dependencies=[Depends(require_authenticated_request)])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=list[schemas.TransactionRead])
def read_transactions(
    group_id: int | None = Query(default=None),
    branch_id: int | None = Query(default=None),
    user: models.User = Depends(require_authenticated_request),
    db: Session = Depends(get_db),
):
    return crud.filtered_transactions(db, user=user, group_id=group_id, branch_id=branch_id)


@router.get("/summary", response_model=schemas.SummaryResponse)
def read_summary(
    group_id: int | None = Query(default=None),
    branch_id: int | None = Query(default=None),
    user: models.User = Depends(require_authenticated_request),
    db: Session = Depends(get_db),
):
    return crud.summary(db, user=user, group_id=group_id, branch_id=branch_id)


@router.get("/filter", response_model=list[schemas.TransactionRead])
def filter_transactions(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    type: str | None = Query(default=None),
    account: str | None = Query(default=None),
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    payment_method: str | None = Query(default=None),
    group_id: int | None = Query(default=None),
    branch_id: int | None = Query(default=None),
    user: models.User = Depends(require_authenticated_request),
    db: Session = Depends(get_db),
):
    return crud.filtered_transactions(
        db,
        user=user,
        start_date=start_date,
        end_date=end_date,
        type=type,
        account=account,
        search=search,
        category=category,
        payment_method=payment_method,
        group_id=group_id,
        branch_id=branch_id,
    )


@router.get("/today", response_model=list[schemas.TransactionRead])
def today_transactions(user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    today = date.today()
    return crud.filtered_transactions(db, user=user, start_date=today, end_date=today)


@router.get("/monthly", response_model=list[schemas.TransactionRead])
def monthly_transactions(user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    today = date.today()
    start = today.replace(day=1)
    return crud.filtered_transactions(db, user=user, start_date=start, end_date=today)


@router.get("/yearly", response_model=list[schemas.TransactionRead])
def yearly_transactions(user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    today = date.today()
    start = today.replace(month=1, day=1)
    return crud.filtered_transactions(db, user=user, start_date=start, end_date=today)


@router.get("/export")
def export_transactions(user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    txs = crud.filtered_transactions(db, user=user)

    def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Date", "Type", "Category", "Amount", "Remarks"])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for tx in txs:
            tx_type = "Cash In" if tx.transaction_type == "cash_in" else "Cash Out"
            if tx.transaction_type == "cash_in":
                amount_str = f"{tx.usd_in:,.2f} USD" if tx.usd_in > 0 else f"{tx.cash_in_afn:,.2f} AFN"
            else:
                amount_str = f"{tx.usd_out:,.2f} USD" if tx.usd_out > 0 else f"{tx.cash_out_afn:,.2f} AFN"

            remarks = tx.detail
            if tx.note:
                remarks += f" - {tx.note}"

            writer.writerow([
                tx.date.isoformat() if hasattr(tx.date, "isoformat") else str(tx.date),
                tx_type,
                tx.category.replace("_", " ").title(),
                amount_str,
                remarks
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cashbook_transactions.csv"}
    )


@router.get("/{transaction_id}", response_model=schemas.TransactionRead)
def read_transaction(transaction_id: int, user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    tx = crud.get_transaction(db, transaction_id, user=user)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.post("", response_model=schemas.TransactionRead, status_code=201)
def create_transaction(payload: schemas.TransactionCreate, user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    if user.role in ["Branch Manager", "Clerk"]:
        if payload.branch_id and payload.branch_id != user.assigned_branch_id:
            raise HTTPException(status_code=403, detail="Forbidden: Cannot create transaction for another branch")
        payload.branch_id = user.assigned_branch_id
    try:
        return crud.create_transaction(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.put("/{transaction_id}", response_model=schemas.TransactionRead)
def update_transaction(transaction_id: int, payload: schemas.TransactionUpdate, user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    if user.role == "Clerk":
        raise HTTPException(status_code=403, detail="Forbidden: Clerks cannot modify transactions")
    tx = crud.get_transaction(db, transaction_id, user=user)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if user.role == "Branch Manager":
        if payload.branch_id and payload.branch_id != user.assigned_branch_id:
            raise HTTPException(status_code=403, detail="Forbidden: Cannot change branch assignment")
        payload.branch_id = user.assigned_branch_id
    try:
        return crud.update_transaction(db, tx, payload)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, user: models.User = Depends(require_authenticated_request), db: Session = Depends(get_db)):
    if user.role == "Clerk":
        raise HTTPException(status_code=403, detail="Forbidden: Clerks cannot delete transactions")
    tx = crud.get_transaction(db, transaction_id, user=user)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    crud.delete_transaction(db, tx)
    return {"ok": True}
