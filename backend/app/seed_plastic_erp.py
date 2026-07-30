import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database import Base, engine, SessionLocal
from backend.app.models_plastic import (
    PlasticCompany,
    PlasticBranch,
    PlasticRawMaterial,
    PlasticFinishedGood,
    PlasticMachine,
    PlasticBOM,
    PlasticBOMItem,
    PlasticProductionRun,
    PlasticCashbookLedger,
    PlasticAuditLog,
)


def seed_plastic_erp_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Company
        company = (
            db.query(PlasticCompany).filter(PlasticCompany.code == "PLASTICORP").first()
        )
        if not company:
            company = PlasticCompany(
                code="PLASTICORP",
                name="PlastiCorp International Plastics Ltd",
                tax_id="AF-9948102-X",
                currency="USD",
            )
            db.add(company)
            db.flush()

        # 2. Branches
        b_knd = (
            db.query(PlasticBranch).filter(PlasticBranch.code == "PLANT-KND").first()
        )
        if not b_knd:
            b_knd = PlasticBranch(
                company_id=company.id,
                code="PLANT-KND",
                name="Kandahar Injection Molding Plant",
                location="Industrial Park Phase II, Kandahar, AF",
            )
            db.add(b_knd)
            db.flush()

        b_hrt = (
            db.query(PlasticBranch).filter(PlasticBranch.code == "PLANT-HRT").first()
        )
        if not b_hrt:
            b_hrt = PlasticBranch(
                company_id=company.id,
                code="PLANT-HRT",
                name="Herat Extrusion & Blow Molding Facility",
                location="Customs Road Zone 4, Herat, AF",
            )
            db.add(b_hrt)
            db.flush()

        # 3. Raw Polymer Resins
        resins_data = [
            (
                "RM-PP-VIRGIN",
                "Polypropylene (PP) Virgin Resin",
                "VIRGIN_RESIN",
                "PP",
                1.80,
                18500.0,
                3000.0,
                1000.0,
                7,
                False,
            ),
            (
                "RM-HDPE",
                "High-Density Polyethylene (HDPE)",
                "VIRGIN_RESIN",
                "HDPE",
                1.95,
                12000.0,
                2500.0,
                800.0,
                10,
                False,
            ),
            (
                "RM-PVC",
                "Polyvinyl Chloride Compound",
                "VIRGIN_RESIN",
                "PVC",
                2.10,
                8500.0,
                2000.0,
                500.0,
                14,
                False,
            ),
            (
                "RM-COLOR-RED",
                "Masterbatch Red Colorant",
                "COLORANT",
                "PP",
                4.50,
                650.0,
                150.0,
                50.0,
                5,
                False,
            ),
            (
                "RM-PP-REGRIND",
                "Polypropylene Regrind Granules",
                "REGRIND",
                "PP",
                0.90,
                4200.0,
                1000.0,
                300.0,
                1,
                True,
            ),
        ]

        for (
            code,
            name,
            cat,
            p_type,
            cost,
            stock,
            rop,
            safety,
            lead,
            is_re,
        ) in resins_data:
            mat = (
                db.query(PlasticRawMaterial)
                .filter(PlasticRawMaterial.material_code == code)
                .first()
            )
            if not mat:
                db.add(
                    PlasticRawMaterial(
                        branch_id=b_knd.id,
                        material_code=code,
                        name=name,
                        category=cat,
                        polymer_type=p_type,
                        unit_cost_usd=cost,
                        stock_qty_kg=stock,
                        reorder_point_kg=rop,
                        safety_stock_kg=safety,
                        lead_time_days=lead,
                        is_regrind=is_re,
                    )
                )
        db.flush()

        # 4. Injection & Blow Molding Machines
        machines_data = [
            (
                "IMM-250T",
                "Sumitomo SH250 Injection Molding Press",
                "INJECTION_MOLDING",
                250,
                45.0,
                0.12,
                18.50,
                15.00,
                "RUNNING",
                215.0,
                14.5,
                185000,
            ),
            (
                "IMM-350T",
                "KraussMaffei CX350 Heavy Molding Machine",
                "INJECTION_MOLDING",
                350,
                62.0,
                0.12,
                24.00,
                16.50,
                "RUNNING",
                220.0,
                18.0,
                142000,
            ),
            (
                "IMM-500T",
                "Engel duo 500T High-Precision Machine",
                "INJECTION_MOLDING",
                500,
                85.0,
                0.12,
                32.00,
                18.00,
                "PURGING",
                230.0,
                22.5,
                98000,
            ),
            (
                "SBM-HUSKY",
                "Husky HyPET Blow Molding Station",
                "BLOW_MOLDING",
                300,
                55.0,
                0.12,
                22.50,
                15.00,
                "RUNNING",
                205.0,
                12.0,
                260000,
            ),
        ]

        for (
            m_code,
            name,
            m_type,
            ton,
            p_kw,
            c_kwh,
            h_rate,
            w_rate,
            status,
            temp,
            cycle,
            shots,
        ) in machines_data:
            mac = (
                db.query(PlasticMachine)
                .filter(PlasticMachine.machine_code == m_code)
                .first()
            )
            if not mac:
                db.add(
                    PlasticMachine(
                        branch_id=b_knd.id,
                        machine_code=m_code,
                        name=name,
                        machine_type=m_type,
                        tonnage=ton,
                        power_kw=p_kw,
                        cost_per_kwh=c_kwh,
                        hourly_overhead_rate_usd=h_rate,
                        operator_hourly_wage_usd=w_rate,
                        status=status,
                        current_temperature_c=temp,
                        current_cycle_time_sec=cycle,
                        total_shots=shots,
                    )
                )
        db.flush()

        # 5. Finished Goods & BOM Recipes
        fg_120 = (
            db.query(PlasticFinishedGood)
            .filter(PlasticFinishedGood.sku == "PET-BTL-120ML")
            .first()
        )
        if not fg_120:
            fg_120 = PlasticFinishedGood(
                branch_id=b_knd.id,
                sku="PET-BTL-120ML",
                name="120ml Clear Cosmetic Bottle SKU",
                category="Cosmetics Packaging",
                unit_weight_g=45.0,
                stock_on_hand_units=24000,
                unit_sale_price_usd=0.45,
                unit_target_cogm_usd=0.215,
            )
            db.add(fg_120)
            db.flush()

            bom_120 = PlasticBOM(
                finished_good_id=fg_120.id,
                bom_code="BOM-120ML-STD",
                description="120ml Bottle Standard Injection Recipe (85% Virgin + 15% Regrind)",
                cycle_time_sec=14.5,
                expected_scrap_percent=4.0,
                version="v1.2",
            )
            db.add(bom_120)
            db.flush()

        # 6. Audit Log
        db.add(
            PlasticAuditLog(
                username="System Architect",
                role="AUDITOR",
                ip_address="127.0.0.1",
                action_type="SYSTEM_INITIALIZED",
                severity="INFO",
                details="PlastiCorp Enterprise ERP initial seed completed cleanly.",
            )
        )

        db.commit()
        print("[SUCCESS] PlastiCorp Enterprise Seed Data Successfully Initialized!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding PlastiCorp data: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print(
        "[START] Seeding PlastiCorp Enterprise Plastics Manufacturing ERP Sample Data..."
    )
    seed_plastic_erp_data()
