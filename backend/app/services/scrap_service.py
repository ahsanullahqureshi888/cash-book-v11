from datetime import date, datetime
from sqlalchemy.orm import Session

from ..models_plastic import (
    PlasticMachine,
    PlasticRawMaterial,
    PlasticScrapLog,
    PlasticCashbookLedger,
    PlasticAuditLog
)


def log_scrap_recovery_and_update_regrind_stock(
    db: Session,
    machine_code: str,
    regrind_material_code: str,
    scrap_weight_kg: float,
    regrind_valuation_per_kg: float = 0.90,
    production_run_number: str = None,
    logged_by: str = "Operator",
    notes: str = "Granulator closed-loop recovery"
) -> PlasticScrapLog:
    """
    Logs granulated scrap sprues/defects into warehouse regrind inventory,
    credits the COGM_Scrap_Recovery ledger, and updates stock.
    """
    machine = db.query(PlasticMachine).filter(PlasticMachine.machine_code == machine_code).first()
    if not machine:
        raise ValueError(f"Machine '{machine_code}' not found.")

    regrind_mat = db.query(PlasticRawMaterial).filter(PlasticRawMaterial.material_code == regrind_material_code).first()
    if not regrind_mat:
        raise ValueError(f"Regrind material '{regrind_material_code}' not found.")

    # 1. Total Salvage Financial Value ($0.90/kg vs $1.80/kg virgin)
    total_salvage_usd = round(scrap_weight_kg * regrind_valuation_per_kg, 2)

    # 2. Add Regrind Weight to Warehouse Inventory
    regrind_mat.stock_qty_kg += scrap_weight_kg
    regrind_mat.unit_cost_usd = regrind_valuation_per_kg

    # 3. Create Scrap Log Entry
    scrap_log = PlasticScrapLog(
        machine_id=machine.id,
        regrind_material_id=regrind_mat.id,
        scrap_weight_kg=scrap_weight_kg,
        regrind_valuation_per_kg=regrind_valuation_per_kg,
        total_salvage_value_usd=total_salvage_usd,
        logged_by=logged_by,
        notes=notes
    )
    db.add(scrap_log)
    db.flush()

    # 4. Post Cashbook Journal Entry
    journal_ref = f"SCRAP-{scrap_log.id:04d}"
    today_date = date.today()

    # Debit Regrind Raw Material Asset
    db.add(PlasticCashbookLedger(
        company_id=machine.branch.company_id,
        branch_id=machine.branch_id,
        journal_ref=journal_ref,
        posting_date=today_date,
        account_type="INVENTORY_ASSET",
        account_name="Regrind Raw Material Inventory",
        debit_usd=total_salvage_usd,
        credit_usd=0.0,
        description=f"Granulated regrind inventory asset addition: {scrap_weight_kg} kg from {machine_code}"
    ))

    # Credit Scrap Recovery Expense Reduction
    db.add(PlasticCashbookLedger(
        company_id=machine.branch.company_id,
        branch_id=machine.branch_id,
        journal_ref=journal_ref,
        posting_date=today_date,
        account_type="COGM_SCRAP_RECOVERY",
        account_name="COGM Scrap Recovery Salvage",
        debit_usd=0.0,
        credit_usd=total_salvage_usd,
        description=f"Closed-loop scrap recovery salvage credit: {scrap_weight_kg} kg @ ${regrind_valuation_per_kg}/kg"
    ))

    # Record Audit Log
    db.add(PlasticAuditLog(
        username=logged_by,
        role="OPERATOR",
        ip_address="127.0.0.1",
        action_type="SCRAP_RECOVERY_LOGGED",
        severity="INFO",
        details=f"Granulated {scrap_weight_kg} kg of scrap into {regrind_material_code} (Valuation: ${total_salvage_usd})"
    ))

    db.commit()
    db.refresh(scrap_log)
    return scrap_log
