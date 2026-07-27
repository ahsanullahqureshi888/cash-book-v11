from datetime import date, datetime, timedelta
import math
from typing import List
from sqlalchemy.orm import Session

from ..models_plastic import (
    PlasticBranch,
    PlasticRawMaterial,
    PlasticPurchaseOrder,
    PlasticCashbookLedger,
    PlasticAuditLog
)


def calculate_predictive_material_runway(
    db: Session,
    branch_code: str = None
) -> List[dict]:
    """
    Calculates material Reorder Points: ROP = Daily Burn Rate * Lead Time + Safety Stock
    and Economic Order Quantities (EOQ) targeting 45 days of supply.
    """
    query = db.query(PlasticRawMaterial)
    if branch_code:
        branch = db.query(PlasticBranch).filter(PlasticBranch.code == branch_code).first()
        if branch:
            query = query.filter(PlasticRawMaterial.branch_id == branch.id)

    materials = query.all()
    results = []

    for mat in materials:
        # Estimate daily burn rate based on category
        daily_burn = 350.0 if "VIRGIN" in mat.material_code else 120.0
        days_until_stockout = (mat.stock_qty_kg / daily_burn) if daily_burn > 0 else 999.0

        # ROP Formula: (Daily Burn Rate * Lead Time Days) + Safety Stock
        rop = (daily_burn * mat.lead_time_days) + mat.safety_stock_kg

        # EOQ targeting 45 days of supply
        eoq = max(5000.0, daily_burn * 45.0)

        # Status
        if mat.stock_qty_kg <= mat.safety_stock_kg:
            status = "CRITICAL_STOCKOUT"
        elif mat.stock_qty_kg <= rop:
            status = "REORDER_NOW"
        else:
            status = "OK"

        results.append({
            "material_code": mat.material_code,
            "name": mat.name,
            "category": mat.category,
            "polymer_type": mat.polymer_type,
            "stock_qty_kg": round(mat.stock_qty_kg, 2),
            "daily_burn_rate_kg": round(daily_burn, 2),
            "days_until_stockout": round(days_until_stockout, 1),
            "reorder_point_kg": round(rop, 2),
            "safety_stock_kg": round(mat.safety_stock_kg, 2),
            "economic_order_quantity_kg": round(eoq, 2),
            "unit_cost_usd": round(mat.unit_cost_usd, 4),
            "reorder_status": status
        })

    return results


def dispatch_purchase_order(
    db: Session,
    material_code: str,
    branch_code: str,
    supplier_name: str,
    order_qty_kg: float,
    logged_by: str = "Procurement System"
) -> PlasticPurchaseOrder:
    """
    Generates and dispatches a supplier purchase order, logging payables liabilities into cashbook ledger.
    """
    branch = db.query(PlasticBranch).filter(PlasticBranch.code == branch_code).first()
    if not branch:
        raise ValueError(f"Branch '{branch_code}' not found.")

    mat = db.query(PlasticRawMaterial).filter(PlasticRawMaterial.material_code == material_code).first()
    if not mat:
        raise ValueError(f"Material '{material_code}' not found.")

    po_number = f"PO-{datetime.utcnow().strftime('%Y%m%d')}-{db.query(PlasticPurchaseOrder).count() + 1:03d}"
    total_cost = round(order_qty_kg * mat.unit_cost_usd, 2)
    expected_deliv = date.today() + timedelta(days=mat.lead_time_days)

    po = PlasticPurchaseOrder(
        po_number=po_number,
        branch_id=branch.id,
        raw_material_id=mat.id,
        supplier_name=supplier_name,
        order_qty_kg=order_qty_kg,
        unit_cost_usd=mat.unit_cost_usd,
        total_cost_usd=total_cost,
        status="DISPATCHED",
        expected_delivery_date=expected_deliv
    )
    db.add(po)
    db.flush()

    # Log Payables Ledger Entry
    journal_ref = f"JRN-{po_number}"
    db.add(PlasticCashbookLedger(
        company_id=branch.company_id,
        branch_id=branch.id,
        journal_ref=journal_ref,
        posting_date=date.today(),
        account_type="PAYABLES",
        account_name=f"Accounts Payable - {supplier_name}",
        debit_usd=0.0,
        credit_usd=total_cost,
        description=f"Purchase order dispatched for {order_qty_kg} kg {mat.name} ({po_number})"
    ))

    # Record Audit Log
    db.add(PlasticAuditLog(
        username=logged_by,
        role="MANAGER",
        ip_address="127.0.0.1",
        action_type="PO_DISPATCHED",
        severity="INFO",
        details=f"Dispatched PO {po_number} to {supplier_name} for {order_qty_kg} kg {mat.name} (${total_cost})"
    ))

    db.commit()
    db.refresh(po)
    return po
