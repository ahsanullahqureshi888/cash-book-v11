from datetime import datetime
from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from .database import Base


# ---------------------------------------------------------------------------
# 1. Multi-Company & Branch Organizational Scope
# ---------------------------------------------------------------------------
class PlasticCompany(Base):
    __tablename__ = "plastic_companies"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    tax_id = Column(String(100), default="", nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    branches = relationship("PlasticBranch", back_populates="company", cascade="all, delete-orphan")


class PlasticBranch(Base):
    __tablename__ = "plastic_branches"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("plastic_companies.id"), nullable=False, index=True)
    code = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), default="", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("PlasticCompany", back_populates="branches")
    machines = relationship("PlasticMachine", back_populates="branch")
    raw_materials = relationship("PlasticRawMaterial", back_populates="branch")
    finished_goods = relationship("PlasticFinishedGood", back_populates="branch")


# ---------------------------------------------------------------------------
# 2. Three-Stage Inventory Ledgers (Raw, WIP, Finished Goods)
# ---------------------------------------------------------------------------
class PlasticRawMaterial(Base):
    __tablename__ = "plastic_raw_materials"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("plastic_branches.id"), nullable=False, index=True)
    material_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # VIRGIN_RESIN, REGRIND, COLORANT, ADDITIVE
    polymer_type = Column(String(50), default="PP", nullable=False)  # PP, HDPE, PVC, PET, LDPE
    unit_cost_usd = Column(Float, default=1.80, nullable=False)  # e.g. $1.80/kg
    stock_qty_kg = Column(Float, default=10000.0, nullable=False)
    reorder_point_kg = Column(Float, default=2500.0, nullable=False)
    safety_stock_kg = Column(Float, default=1000.0, nullable=False)
    lead_time_days = Column(Integer, default=7, nullable=False)
    is_regrind = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    branch = relationship("PlasticBranch", back_populates="raw_materials")


class PlasticFinishedGood(Base):
    __tablename__ = "plastic_finished_goods"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("plastic_branches.id"), nullable=False, index=True)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Plastic Container", nullable=False)
    unit_weight_g = Column(Float, default=45.0, nullable=False)  # weight per part in grams
    stock_on_hand_units = Column(Integer, default=5000, nullable=False)
    unit_sale_price_usd = Column(Float, default=0.45, nullable=False)
    unit_target_cogm_usd = Column(Float, default=0.22, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    branch = relationship("PlasticBranch", back_populates="finished_goods")
    boms = relationship("PlasticBOM", back_populates="finished_good")


# ---------------------------------------------------------------------------
# 3. Factory Machines & Telemetry Metrics
# ---------------------------------------------------------------------------
class PlasticMachine(Base):
    __tablename__ = "plastic_machines"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("plastic_branches.id"), nullable=False, index=True)
    machine_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    machine_type = Column(String(100), default="INJECTION_MOLDING", nullable=False) # INJECTION_MOLDING, BLOW_MOLDING, EXTRUSION
    tonnage = Column(Integer, default=250, nullable=False)
    power_kw = Column(Float, default=45.0, nullable=False)  # Electric power draw in kW
    cost_per_kwh = Column(Float, default=0.12, nullable=False)  # $0.12 / kWh
    hourly_overhead_rate_usd = Column(Float, default=18.50, nullable=False)  # Machine depreciation/overhead rate ($/hr)
    operator_hourly_wage_usd = Column(Float, default=15.00, nullable=False)  # Operator wage ($/hr)
    status = Column(String(30), default="RUNNING", nullable=False, index=True)  # RUNNING, PURGING, FAULT, IDLE
    current_temperature_c = Column(Float, default=215.0, nullable=False)
    current_cycle_time_sec = Column(Float, default=14.5, nullable=False)
    total_shots = Column(Integer, default=125000, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    branch = relationship("PlasticBranch", back_populates="machines")


# ---------------------------------------------------------------------------
# 4. Bill of Materials (BOM) & Production Runs
# ---------------------------------------------------------------------------
class PlasticBOM(Base):
    __tablename__ = "plastic_boms"

    id = Column(Integer, primary_key=True, index=True)
    finished_good_id = Column(Integer, ForeignKey("plastic_finished_goods.id"), nullable=False, index=True)
    bom_code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), default="Standard Injection Recipe", nullable=False)
    cycle_time_sec = Column(Float, default=15.0, nullable=False)
    expected_scrap_percent = Column(Float, default=4.0, nullable=False)  # e.g., 4.0%
    version = Column(String(20), default="v1.0", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    finished_good = relationship("PlasticFinishedGood", back_populates="boms")
    items = relationship("PlasticBOMItem", back_populates="bom", cascade="all, delete-orphan")


class PlasticBOMItem(Base):
    __tablename__ = "plastic_bom_items"

    id = Column(Integer, primary_key=True, index=True)
    bom_id = Column(Integer, ForeignKey("plastic_boms.id"), nullable=False, index=True)
    raw_material_id = Column(Integer, ForeignKey("plastic_raw_materials.id"), nullable=False, index=True)
    quantity_g_per_unit = Column(Float, nullable=False)  # Grams of material per unit
    percentage_ratio = Column(Float, default=100.0, nullable=False)  # Percentage ratio in blend

    bom = relationship("PlasticBOM", back_populates="items")
    raw_material = relationship("PlasticRawMaterial")


class PlasticProductionRun(Base):
    __tablename__ = "plastic_production_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_number = Column(String(50), unique=True, nullable=False, index=True)
    branch_id = Column(Integer, ForeignKey("plastic_branches.id"), nullable=False, index=True)
    machine_id = Column(Integer, ForeignKey("plastic_machines.id"), nullable=False, index=True)
    finished_good_id = Column(Integer, ForeignKey("plastic_finished_goods.id"), nullable=False, index=True)
    bom_id = Column(Integer, ForeignKey("plastic_boms.id"), nullable=False, index=True)

    target_quantity = Column(Integer, nullable=False)
    good_produced_quantity = Column(Integer, default=0, nullable=False)
    scrap_quantity_units = Column(Integer, default=0, nullable=False)
    scrap_weight_kg = Column(Float, default=0.0, nullable=False)
    machine_hours_logged = Column(Float, default=0.0, nullable=False)
    power_kwh_consumed = Column(Float, default=0.0, nullable=False)

    # Calculated Financial Breakdown
    direct_material_cost_usd = Column(Float, default=0.0, nullable=False)
    direct_labor_cost_usd = Column(Float, default=0.0, nullable=False)
    factory_overhead_cost_usd = Column(Float, default=0.0, nullable=False)
    scrap_salvage_credit_usd = Column(Float, default=0.0, nullable=False)
    total_cogm_usd = Column(Float, default=0.0, nullable=False)
    unit_cogm_usd = Column(Float, default=0.0, nullable=False)

    status = Column(String(30), default="COMPLETED", nullable=False, index=True)  # SCHEDULED, RUNNING, COMPLETED, CANCELLED
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    machine = relationship("PlasticMachine")
    finished_good = relationship("PlasticFinishedGood")
    bom = relationship("PlasticBOM")


# ---------------------------------------------------------------------------
# 5. Closed-Loop Scrap Recovery Ledger
# ---------------------------------------------------------------------------
class PlasticScrapLog(Base):
    __tablename__ = "plastic_scrap_logs"

    id = Column(Integer, primary_key=True, index=True)
    production_run_id = Column(Integer, ForeignKey("plastic_production_runs.id"), nullable=True, index=True)
    machine_id = Column(Integer, ForeignKey("plastic_machines.id"), nullable=False, index=True)
    regrind_material_id = Column(Integer, ForeignKey("plastic_raw_materials.id"), nullable=False, index=True)
    
    scrap_weight_kg = Column(Float, nullable=False)
    regrind_valuation_per_kg = Column(Float, default=0.90, nullable=False)  # Regrind valued at $0.90/kg vs $1.80/kg virgin
    total_salvage_value_usd = Column(Float, nullable=False)
    logged_by = Column(String(100), default="Operator", nullable=False)
    notes = Column(Text, default="", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


# ---------------------------------------------------------------------------
# 6. Double-Entry General Ledger Postings
# ---------------------------------------------------------------------------
class PlasticCashbookLedger(Base):
    __tablename__ = "plastic_cashbook_ledger"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("plastic_companies.id"), nullable=False, index=True)
    branch_id = Column(Integer, ForeignKey("plastic_branches.id"), nullable=False, index=True)
    journal_ref = Column(String(50), nullable=False, index=True)
    posting_date = Column(Date, nullable=False, index=True)
    account_type = Column(String(50), nullable=False, index=True)  # REVENUE, COGM, COGS, OPERATING_EXPENSE, INVENTORY_ASSET, PAYABLES, COGM_SCRAP_RECOVERY
    account_name = Column(String(150), nullable=False)
    debit_usd = Column(Float, default=0.0, nullable=False)
    credit_usd = Column(Float, default=0.0, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# ---------------------------------------------------------------------------
# 7. Predictive Procurement & Purchase Orders
# ---------------------------------------------------------------------------
class PlasticPurchaseOrder(Base):
    __tablename__ = "plastic_purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, nullable=False, index=True)
    branch_id = Column(Integer, ForeignKey("plastic_branches.id"), nullable=False, index=True)
    raw_material_id = Column(Integer, ForeignKey("plastic_raw_materials.id"), nullable=False, index=True)
    supplier_name = Column(String(255), nullable=False)
    order_qty_kg = Column(Float, nullable=False)
    unit_cost_usd = Column(Float, nullable=False)
    total_cost_usd = Column(Float, nullable=False)
    status = Column(String(30), default="PENDING", nullable=False, index=True)  # AUTO_GENERATED, PENDING, DISPATCHED, RECEIVED, CANCELLED
    expected_delivery_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# ---------------------------------------------------------------------------
# 8. High-Frequency IoT Machine Telemetry
# ---------------------------------------------------------------------------
class PlasticTelemetryPing(Base):
    __tablename__ = "plastic_telemetry_pings"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("plastic_machines.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    status = Column(String(30), default="RUNNING", nullable=False)
    temperature_c = Column(Float, nullable=False)
    pressure_bar = Column(Float, default=140.0, nullable=False)
    cycle_time_sec = Column(Float, nullable=False)
    incremental_shots = Column(Integer, default=1, nullable=False)
    power_kw = Column(Float, nullable=False)
    incremental_kwh = Column(Float, nullable=False)
    operator_role = Column(String(50), default="OPERATOR", nullable=False)


# ---------------------------------------------------------------------------
# 9. Immutable Security Audit Log
# ---------------------------------------------------------------------------
class PlasticAuditLog(Base):
    __tablename__ = "plastic_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    username = Column(String(100), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # OPERATOR, ACCOUNTANT, MANAGER, AUDITOR
    ip_address = Column(String(50), default="127.0.0.1", nullable=False)
    action_type = Column(String(100), nullable=False, index=True)  # CRITICAL_OVERRIDE, BOM_ALTERATION, SCRAP_ADJUSTMENT, PO_DISPATCH
    severity = Column(String(20), default="INFO", nullable=False)  # INFO, WARNING, CRITICAL_OVERRIDE
    details = Column(Text, nullable=False)
