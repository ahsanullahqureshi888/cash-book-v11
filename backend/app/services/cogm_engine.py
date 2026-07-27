from datetime import date, datetime
import math
from sqlalchemy.orm import Session

from ..models_plastic import (
    PlasticBranch,
    PlasticMachine,
    PlasticFinishedGood,
    PlasticBOM,
    PlasticProductionRun,
    PlasticCashbookLedger,
    PlasticRawMaterial,
    PlasticScrapLog,
    PlasticAuditLog
)


def calculate_bom_cost_preview(
    unit_weight_g: float,
    regrind_percentage: float,
    virgin_resin_price_per_kg: float,
    regrind_price_per_kg: float,
    cycle_time_sec: float,
    expected_scrap_percent: float,
    power_kw: float,
    cost_per_kwh: float,
    hourly_overhead_rate: float,
    operator_hourly_wage: float,
    sku: str = "CUSTOM-SKU"
) -> dict:
    """
    Simulates BOM engineering sandbox cost burn rates ($/hr) and per-unit COGM.
    """
    # 1. Output Rate
    parts_per_hour = (3600.0 / cycle_time_sec) if cycle_time_sec > 0 else 240.0

    # 2. Material Weight & Blended Resin Cost per Unit
    weight_kg = unit_weight_g / 1000.0
    scrap_multiplier = 1.0 + (expected_scrap_percent / 100.0)
    effective_weight_kg = weight_kg * scrap_multiplier

    regrind_ratio = regrind_percentage / 100.0
    virgin_ratio = 1.0 - regrind_ratio
    blended_resin_cost_per_kg = (virgin_ratio * virgin_resin_price_per_kg) + (regrind_ratio * regrind_price_per_kg)

    material_cost_per_unit = effective_weight_kg * blended_resin_cost_per_kg

    # 3. Scrap Salvage Recovery Credit per Unit ($0.90/kg value on scrapped portion)
    scrapped_weight_kg = weight_kg * (expected_scrap_percent / 100.0)
    scrap_salvage_credit_per_unit = scrapped_weight_kg * regrind_price_per_kg

    # 4. Machine Power & Hourly Costs
    power_cost_per_hour = power_kw * cost_per_kwh
    total_hourly_machine_burn = power_cost_per_hour + hourly_overhead_rate + operator_hourly_wage

    machine_cost_per_unit = power_cost_per_hour / parts_per_hour
    overhead_cost_per_unit = hourly_overhead_rate / parts_per_hour
    labor_cost_per_unit = operator_hourly_wage / parts_per_hour

    # 5. Total Unit COGM Calculation
    total_unit_cogm = (
        material_cost_per_unit +
        machine_cost_per_unit +
        overhead_cost_per_unit +
        labor_cost_per_unit -
        scrap_salvage_credit_per_unit
    )

    suggested_price = total_unit_cogm * 2.0  # 100% markup benchmark
    gross_margin = ((suggested_price - total_unit_cogm) / suggested_price * 100.0) if suggested_price > 0 else 50.0

    return {
        "sku": sku,
        "unit_weight_g": unit_weight_g,
        "parts_per_hour": round(parts_per_hour, 2),
        "material_cost_per_unit_usd": round(material_cost_per_unit, 4),
        "machine_cost_per_unit_usd": round(machine_cost_per_unit, 4),
        "labor_cost_per_unit_usd": round(labor_cost_per_unit, 4),
        "overhead_cost_per_unit_usd": round(overhead_cost_per_unit, 4),
        "scrap_salvage_credit_per_unit_usd": round(scrap_salvage_credit_per_unit, 4),
        "calculated_unit_cogm_usd": round(total_unit_cogm, 4),
        "hourly_cost_burn_rate_usd": round(total_hourly_machine_burn, 2),
        "suggested_retail_price_usd": round(suggested_price, 4),
        "estimated_gross_margin_percent": round(gross_margin, 2)
    }


def execute_production_run_and_post_ledger(
    db: Session,
    branch_code: str,
    machine_code: str,
    sku: str,
    bom_code: str,
    target_quantity: int,
    good_produced_quantity: int,
    scrap_quantity_units: int,
    machine_hours_logged: float
) -> PlasticProductionRun:
    """
    Executes a production batch, deducts raw materials from stock (including scrap allowance),
    allocates power overhead & labor, credits scrap recovery, updates finished goods inventory,
    and posts double-entry journal entries.
    """
    branch = db.query(PlasticBranch).filter(PlasticBranch.code == branch_code).first()
    if not branch:
        raise ValueError(f"Branch code '{branch_code}' not found.")

    machine = db.query(PlasticMachine).filter(PlasticMachine.machine_code == machine_code).first()
    if not machine:
        raise ValueError(f"Machine '{machine_code}' not found.")

    finished_good = db.query(PlasticFinishedGood).filter(PlasticFinishedGood.sku == sku).first()
    if not finished_good:
        raise ValueError(f"Finished Good SKU '{sku}' not found.")

    bom = db.query(PlasticBOM).filter(PlasticBOM.bom_code == bom_code).first()
    if not bom:
        raise ValueError(f"BOM code '{bom_code}' not found.")

    # 1. Total Raw Material Weight Consumed (Good units + Scrap allowance)
    unit_weight_kg = finished_good.unit_weight_g / 1000.0
    total_good_weight_kg = good_produced_quantity * unit_weight_kg
    scrap_weight_kg = scrap_quantity_units * unit_weight_kg
    scrap_allowance_multiplier = 1.0 + (bom.expected_scrap_percent / 100.0)
    total_raw_material_used_kg = (good_produced_quantity + scrap_quantity_units) * unit_weight_kg * scrap_allowance_multiplier

    # 2. Material Cost Calculation
    # Fetch primary raw material for SKU
    raw_mat = db.query(PlasticRawMaterial).filter(PlasticRawMaterial.branch_id == branch.id).first()
    material_unit_cost = raw_mat.unit_cost_usd if raw_mat else 1.80
    direct_material_cost = total_raw_material_used_kg * material_unit_cost

    # Deduct raw material from stock
    if raw_mat:
        raw_mat.stock_qty_kg = max(0.0, raw_mat.stock_qty_kg - total_raw_material_used_kg)

    # 3. Direct Labor & Power Overhead Costs
    direct_labor_cost = machine_hours_logged * machine.operator_hourly_wage_usd
    power_kwh_consumed = machine_hours_logged * machine.power_kw
    power_cost = power_kwh_consumed * machine.cost_per_kwh
    overhead_cost = (machine_hours_logged * machine.hourly_overhead_rate_usd) + power_cost

    # 4. Scrap Salvage Recovery Credit ($0.90/kg value)
    regrind_valuation = 0.90
    scrap_salvage_credit = scrap_weight_kg * regrind_valuation

    # 5. Net Total COGM & Unit COGM
    total_cogm = direct_material_cost + direct_labor_cost + overhead_cost - scrap_salvage_credit
    unit_cogm = (total_cogm / good_produced_quantity) if good_produced_quantity > 0 else 0.0

    # 6. Update Finished Goods Inventory
    finished_good.stock_on_hand_units += good_produced_quantity
    finished_good.unit_target_cogm_usd = unit_cogm

    # 7. Create Production Run Record
    run_no = f"PR-{datetime.utcnow().strftime('%Y%m%d')}-{db.query(PlasticProductionRun).count() + 1:03d}"
    prod_run = PlasticProductionRun(
        run_number=run_no,
        branch_id=branch.id,
        machine_id=machine.id,
        finished_good_id=finished_good.id,
        bom_id=bom.id,
        target_quantity=target_quantity,
        good_produced_quantity=good_produced_quantity,
        scrap_quantity_units=scrap_quantity_units,
        scrap_weight_kg=round(scrap_weight_kg, 2),
        machine_hours_logged=round(machine_hours_logged, 2),
        power_kwh_consumed=round(power_kwh_consumed, 2),
        direct_material_cost_usd=round(direct_material_cost, 2),
        direct_labor_cost_usd=round(direct_labor_cost, 2),
        factory_overhead_cost_usd=round(overhead_cost, 2),
        scrap_salvage_credit_usd=round(scrap_salvage_credit, 2),
        total_cogm_usd=round(total_cogm, 2),
        unit_cogm_usd=round(unit_cogm, 4),
        status="COMPLETED",
        completed_at=datetime.utcnow()
    )
    db.add(prod_run)
    db.flush()

    # 8. Post Balanced Double-Entry Cashbook Ledger Postings
    journal_ref = f"JRN-{run_no}"
    today_date = date.today()

    # Debit Finished Goods Inventory Asset
    db.add(PlasticCashbookLedger(
        company_id=branch.company_id,
        branch_id=branch.id,
        journal_ref=journal_ref,
        posting_date=today_date,
        account_type="INVENTORY_ASSET",
        account_name="Finished Goods Inventory (COGM Batch)",
        debit_usd=round(total_cogm, 2),
        credit_usd=0.0,
        description=f"Batch COGM asset addition: {good_produced_quantity} units SKU {sku}"
    ))

    # Credit Raw Materials Asset
    db.add(PlasticCashbookLedger(
        company_id=branch.company_id,
        branch_id=branch.id,
        journal_ref=journal_ref,
        posting_date=today_date,
        account_type="INVENTORY_ASSET",
        account_name="Raw Materials Inventory Consumption",
        debit_usd=0.0,
        credit_usd=round(direct_material_cost, 2),
        description=f"Resin consumed for batch {run_no}: {round(total_raw_material_used_kg, 2)} kg"
    ))

    # Credit Direct Labor Cost / Payroll Expense
    db.add(PlasticCashbookLedger(
        company_id=branch.company_id,
        branch_id=branch.id,
        journal_ref=journal_ref,
        posting_date=today_date,
        account_type="COGM",
        account_name="Direct Machine Labor Allocation",
        debit_usd=0.0,
        credit_usd=round(direct_labor_cost, 2),
        description=f"Labor allocation for batch {run_no}: {machine_hours_logged} machine hours"
    ))

    # Credit Factory Overhead & Power
    db.add(PlasticCashbookLedger(
        company_id=branch.company_id,
        branch_id=branch.id,
        journal_ref=journal_ref,
        posting_date=today_date,
        account_type="COGM",
        account_name="Factory Machine & Power Overhead",
        debit_usd=0.0,
        credit_usd=round(overhead_cost, 2),
        description=f"Machine power & depreciation overhead for batch {run_no}"
    ))

    # Credit Scrap Salvage Recovery Expense Reduction
    if scrap_salvage_credit > 0:
        db.add(PlasticCashbookLedger(
            company_id=branch.company_id,
            branch_id=branch.id,
            journal_ref=journal_ref,
            posting_date=today_date,
            account_type="COGM_SCRAP_RECOVERY",
            account_name="COGM Scrap Recovery Credit",
            debit_usd=round(scrap_salvage_credit, 2),
            credit_usd=0.0,
            description=f"Regrind salvage recovery credit: {round(scrap_weight_kg, 2)} kg"
        ))

    # Record Audit Log
    db.add(PlasticAuditLog(
        username="System Production Engine",
        role="MANAGER",
        ip_address="127.0.0.1",
        action_type="PRODUCTION_BATCH_COMPLETED",
        severity="INFO",
        details=f"Completed run {run_no} for SKU {sku}. Total COGM: ${round(total_cogm, 2)} (Unit: ${round(unit_cogm, 4)})"
    ))

    db.commit()
    db.refresh(prod_run)
    return prod_run
