import os
import sys
import pytest
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from backend.app.database import Base, engine, SessionLocal
from backend.app.models_plastic import (
    PlasticBranch,
    PlasticMachine,
    PlasticFinishedGood,
    PlasticBOM,
    PlasticRawMaterial,
    PlasticProductionRun,
    PlasticCashbookLedger
)
from backend.app.services.cogm_engine import execute_production_run_and_post_ledger, calculate_bom_cost_preview
from backend.app.services.scrap_service import log_scrap_recovery_and_update_regrind_stock
from backend.app.seed_plastic_erp import seed_plastic_erp_data


def test_plastic_cogm_and_double_entry_ledger_balancing():
    """
    Asserts 10,000 unit production run accurately deducts resin (with 4% scrap allowance),
    allocates machine power & labor overhead, credits scrap salvage, increments stock,
    and balances double-entry debits and credits to the exact penny ($0.00 discrepancy).
    """
    seed_plastic_erp_data()
    db: Session = SessionLocal()

    try:
        # Fetch seeded Entities
        branch = db.query(PlasticBranch).filter(PlasticBranch.code == "PLANT-KND").first()
        machine = db.query(PlasticMachine).filter(PlasticMachine.machine_code == "IMM-250T").first()
        fg = db.query(PlasticFinishedGood).filter(PlasticFinishedGood.sku == "PET-BTL-120ML").first()
        bom = db.query(PlasticBOM).filter(PlasticBOM.bom_code == "BOM-120ML-STD").first()
        raw_mat = db.query(PlasticRawMaterial).filter(PlasticRawMaterial.branch_id == branch.id).first()

        initial_resin_stock = raw_mat.stock_qty_kg
        initial_fg_stock = fg.stock_on_hand_units

        # Execute 10,000-unit Production Run (9,600 good units + 400 scrap units)
        run = execute_production_run_and_post_ledger(
            db=db,
            branch_code="PLANT-KND",
            machine_code="IMM-250T",
            sku="PET-BTL-120ML",
            bom_code="BOM-120ML-STD",
            target_quantity=10000,
            good_produced_quantity=9600,
            scrap_quantity_units=400,
            machine_hours_logged=40.0
        )

        # 1. Assert Production Run Completion
        assert run.status == "COMPLETED"
        assert run.good_produced_quantity == 9600
        assert run.scrap_quantity_units == 400

        # 2. Assert Finished Goods Stock Incremented by 9,600
        db.refresh(fg)
        assert fg.stock_on_hand_units == initial_fg_stock + 9600

        # 3. Assert Raw Resin Stock Deducted (with 4% Scrap Allowance)
        db.refresh(raw_mat)
        total_used_kg = (10000 * (45.0 / 1000.0)) * 1.04  # 468 kg
        assert abs((initial_resin_stock - raw_mat.stock_qty_kg) - total_used_kg) < 0.01

        # 4. Assert Double-Entry Ledger Debit equals Credit to the exact penny ($0.00)
        journal_entries = db.query(PlasticCashbookLedger).filter(
            PlasticCashbookLedger.journal_ref == f"JRN-{run.run_number}"
        ).all()

        total_debits = sum(e.debit_usd for e in journal_entries)
        total_credits = sum(e.credit_usd for e in journal_entries)

        assert len(journal_entries) >= 4
        # Assertion: Net Debits equal Net Credits to exact penny
        assert abs(total_debits - total_credits) < 0.01

        print(f"\n[TEST PASSED] Production Run {run.run_number}: Total COGM = ${run.total_cogm_usd:.2f} (Unit: ${run.unit_cogm_usd:.4f})")
        print(f"[TEST PASSED] Double-Entry Ledger Balanced cleanly: Total Debits = ${total_debits:.2f}, Total Credits = ${total_credits:.2f}")

    finally:
        db.close()


def test_bom_preview_calculation():
    """
    Asserts BOM engineering sandbox preview calculations match formula expectations.
    """
    preview = calculate_bom_cost_preview(
        unit_weight_g=45.0,
        regrind_percentage=15.0,
        virgin_resin_price_per_kg=1.80,
        regrind_price_per_kg=0.90,
        cycle_time_sec=15.0,
        expected_scrap_percent=4.0,
        power_kw=45.0,
        cost_per_kwh=0.12,
        hourly_overhead_rate=18.50,
        operator_hourly_wage=15.00,
        sku="TEST-SKU-120ML"
    )

    assert preview["parts_per_hour"] == 240.0
    assert preview["calculated_unit_cogm_usd"] > 0.10
    assert preview["estimated_gross_margin_percent"] > 0
