from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Telemetry Pydantic Schemas
# ---------------------------------------------------------------------------
class TelemetryPingCreate(BaseModel):
    machine_code: str = Field("IMM-250T", example="IMM-250T")
    status: str = Field("RUNNING", example="RUNNING")  # RUNNING, PURGING, FAULT, IDLE
    temperature_c: float = Field(215.0, example=215.0)
    pressure_bar: float = Field(140.0, example=140.0)
    cycle_time_sec: float = Field(14.5, example=14.5)
    shots_count: int = Field(1, example=1)
    rejected_shots: int = Field(0, example=0)
    power_kw: float = Field(45.0, example=45.0)
    operator_role: str = Field("OPERATOR", example="OPERATOR")


class TelemetryPingResponse(BaseModel):
    id: int
    machine_id: int
    machine_code: str
    timestamp: datetime
    status: str
    temperature_c: float
    cycle_time_sec: float
    power_kw: float
    incremental_kwh: float
    energy_cost_usd: float

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# 2. Production Run & COGM Calculation Schemas
# ---------------------------------------------------------------------------
class ProductionRunCreate(BaseModel):
    branch_code: str = Field("PLANT-KND", example="PLANT-KND")
    machine_code: str = Field("IMM-250T", example="IMM-250T")
    sku: str = Field("PET-BTL-120ML", example="PET-BTL-120ML")
    bom_code: str = Field("BOM-120ML-STD", example="BOM-120ML-STD")
    target_quantity: int = Field(10000, example=10000)
    good_produced_quantity: int = Field(9600, example=9600)
    scrap_quantity_units: int = Field(400, example=400)
    machine_hours_logged: float = Field(40.0, example=40.0)


class ProductionRunCOGMResponse(BaseModel):
    run_number: str
    sku: str
    finished_good_name: str
    target_quantity: int
    good_produced_quantity: int
    scrap_quantity_units: int
    total_raw_material_used_kg: float
    direct_material_cost_usd: float
    direct_labor_cost_usd: float
    factory_overhead_cost_usd: float
    scrap_salvage_credit_usd: float
    total_cogm_usd: float
    unit_cogm_usd: float
    currency: str = "USD"
    status: str
    journal_ref: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# 3. Scrap Recovery Schemas
# ---------------------------------------------------------------------------
class ScrapLogCreate(BaseModel):
    production_run_number: Optional[str] = Field(None, example="PR-20260725-001")
    machine_code: str = Field("IMM-250T", example="IMM-250T")
    regrind_material_code: str = Field("RM-PP-REGRIND", example="RM-PP-REGRIND")
    scrap_weight_kg: float = Field(50.0, example=50.0)
    regrind_valuation_per_kg: float = Field(0.90, example=0.90)
    logged_by: str = Field("Operator", example="Operator")
    notes: str = Field("Granulated sprues and defective moldings", example="Defective moldings")


class ScrapLogResponse(BaseModel):
    id: int
    machine_code: str
    regrind_material_name: str
    scrap_weight_kg: float
    regrind_valuation_per_kg: float
    total_salvage_value_usd: float
    journal_ref: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# 4. BOM Recipe Sandbox Calculation Request & Response
# ---------------------------------------------------------------------------
class BOMCalculateRequest(BaseModel):
    sku: str = Field("PET-BTL-120ML", example="PET-BTL-120ML")
    unit_weight_g: float = Field(45.0, example=45.0)
    regrind_percentage: float = Field(15.0, example=15.0)
    virgin_resin_price_per_kg: float = Field(1.80, example=1.80)
    regrind_price_per_kg: float = Field(0.90, example=0.90)
    cycle_time_sec: float = Field(15.0, example=15.0)
    expected_scrap_percent: float = Field(4.0, example=4.0)
    power_kw: float = Field(45.0, example=45.0)
    cost_per_kwh: float = Field(0.12, example=0.12)
    hourly_overhead_rate: float = Field(18.50, example=18.50)
    operator_hourly_wage: float = Field(15.00, example=15.00)


class BOMCalculateResponse(BaseModel):
    sku: str
    unit_weight_g: float
    parts_per_hour: float
    material_cost_per_unit_usd: float
    machine_cost_per_unit_usd: float
    labor_cost_per_unit_usd: float
    overhead_cost_per_unit_usd: float
    scrap_salvage_credit_per_unit_usd: float
    calculated_unit_cogm_usd: float
    hourly_cost_burn_rate_usd: float
    suggested_retail_price_usd: float
    estimated_gross_margin_percent: float


# ---------------------------------------------------------------------------
# 5. Predictive Procurement & Runway Schemas
# ---------------------------------------------------------------------------
class MaterialRunwayItem(BaseModel):
    material_code: str
    name: str
    category: str
    polymer_type: str
    stock_qty_kg: float
    daily_burn_rate_kg: float
    days_until_stockout: float
    reorder_point_kg: float
    safety_stock_kg: float
    economic_order_quantity_kg: float
    unit_cost_usd: float
    reorder_status: str  # OK, REORDER_NOW, CRITICAL_STOCKOUT

    class Config:
        from_attributes = True


class DispatchPOCreate(BaseModel):
    material_code: str = Field("RM-PP-VIRGIN", example="RM-PP-VIRGIN")
    branch_code: str = Field("PLANT-KND", example="PLANT-KND")
    supplier_name: str = Field("Borouge Plastics Supply", example="Borouge Plastics Supply")
    order_qty_kg: float = Field(5000.0, example=5000.0)


# ---------------------------------------------------------------------------
# 6. Financial Reports Schemas
# ---------------------------------------------------------------------------
class FinancialStatementSummary(BaseModel):
    branch_name: str
    period_start: str
    period_end: str
    gross_revenue_usd: float
    cost_of_goods_manufactured_usd: float
    cost_of_goods_sold_usd: float
    gross_profit_usd: float
    gross_margin_percent: float
    factory_overhead_usd: float
    operating_expenses_usd: float
    scrap_recovery_credit_usd: float
    net_operating_profit_usd: float
    raw_material_asset_usd: float
    finished_goods_asset_usd: float
    total_inventory_valuation_usd: float


# ---------------------------------------------------------------------------
# 7. Audit Log Schemas
# ---------------------------------------------------------------------------
class ResinPurchaseInput(BaseModel):
    material_id: str = Field("RM-PP-VIRGIN", example="RM-PP-VIRGIN")
    branch_id: str = Field("PLANT-KND", example="PLANT-KND")
    purchase_price_afn: float = Field(2000.0, example=2000.0)
    bag_weight_kg: float = Field(25.0, example=25.0)
    standard_scrap_rate: float = Field(0.04, example=0.04)


class AuditLogResponse(BaseModel):

    id: int
    timestamp: datetime
    username: str
    role: str
    ip_address: str
    action_type: str
    severity: str
    details: str

    class Config:
        from_attributes = True
