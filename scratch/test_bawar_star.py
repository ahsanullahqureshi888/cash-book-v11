from backend.app.database import SessionLocal, Base, engine
from backend.app import models, schemas
from backend.app.routes.bawar_star import (
    create_bawar_star_transaction,
    get_bawar_star_ledger_summary,
    get_bawar_star_partner_transactions
)
from datetime import date

Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    # 1. Ensure test partner account exists
    partner = db.query(models.Account).filter(models.Account.name == "Test Bawar Customer").first()
    if not partner:
        partner = models.Account(
            name="Test Bawar Customer",
            account_type="customer",
            company_id="bawar-star"
        )
        db.add(partner)
        db.commit()
        db.refresh(partner)

    print(f"Partner Account Created/Found ID: {partner.id}")

    # Clean existing test transactions for this partner
    db.query(models.BawarStarTransaction).filter(models.BawarStarTransaction.partner_company_id == partner.id).delete()
    db.commit()

    # 2. Add Product Sale Transaction (50,000 bottles @ 2.5 AFN with COGS 1.8 AFN)
    tx1 = create_bawar_star_transaction(
        schemas.BawarStarTransactionCreate(
            partner_company_id=partner.id,
            transaction_date=date.today(),
            transaction_type="SELL_PRODUCT",
            description_en="50,000 Small Neck Bottles",
            description_ps="۵۰،۰۰۰ د وړو غاړو پلاستیکي بوتلونه",
            quantity=50000.0,
            unit_price=2.5,
            unit_manufacturing_cost=1.8,
            total_amount=125000.0
        ),
        db=db
    )

    # 3. Add Pass-Through Freight Charge (10,000 AFN)
    tx2 = create_bawar_star_transaction(
        schemas.BawarStarTransactionCreate(
            partner_company_id=partner.id,
            transaction_date=date.today(),
            transaction_type="PASS_THROUGH_FREIGHT",
            description_en="Kabul to Kandahar Freight",
            description_ps="د کابل تر کندهار کرایه",
            quantity=1.0,
            unit_price=10000.0,
            total_amount=10000.0
        ),
        db=db
    )

    # 4. Add Pass-Through Packaging Charge (5,000 AFN)
    tx3 = create_bawar_star_transaction(
        schemas.BawarStarTransactionCreate(
            partner_company_id=partner.id,
            transaction_date=date.today(),
            transaction_type="PASS_THROUGH_PKG",
            description_en="80 Packaging Cartons",
            description_ps="۸۰ د بسته بندۍ کارټنونه",
            quantity=80.0,
            unit_price=62.5,
            total_amount=5000.0
        ),
        db=db
    )

    # 5. Record Payment Received (50,000 AFN)
    tx4 = create_bawar_star_transaction(
        schemas.BawarStarTransactionCreate(
            partner_company_id=partner.id,
            transaction_date=date.today(),
            transaction_type="PAYMENT_RECEIVED",
            description_en="Installment Payment via Mohammad Sadiq",
            description_ps="د نغدو پیسو قسط",
            quantity=1.0,
            unit_price=50000.0,
            total_amount=50000.0
        ),
        db=db
    )

    # 6. Fetch summary & test mathematical accuracy
    summary = get_bawar_star_ledger_summary(partner.id, db=db)
    print("--- Summary Results ---")
    print(f"Total Billed: {summary.total_billed_amount} (Expected: 140000.0)")
    print(f"Total Payments Received: {summary.total_payments_received} (Expected: 50000.0)")
    print(f"Net Outstanding Balance: {summary.net_outstanding_balance} (Expected: 90000.0)")
    print(f"Product Revenue: {summary.revenue_split.product_revenue} (Expected: 125000.0)")
    print(f"Freight Billed: {summary.revenue_split.freight_billed} (Expected: 10000.0)")
    print(f"Packaging Billed: {summary.revenue_split.packaging_billed} (Expected: 5000.0)")
    print(f"Total Pass-Through: {summary.revenue_split.total_pass_through} (Expected: 15000.0)")
    print(f"Estimated Gross Profit: {summary.estimated_gross_profit} (Expected: 35000.0)")
    print(f"Profit Margin %: {summary.profit_margin_percentage}% (Expected: 28.0%)")

    assert summary.total_billed_amount == 140000.0
    assert summary.total_payments_received == 50000.0
    assert summary.net_outstanding_balance == 90000.0
    assert summary.revenue_split.product_revenue == 125000.0
    assert summary.revenue_split.total_pass_through == 15000.0
    assert summary.estimated_gross_profit == 35000.0
    assert summary.profit_margin_percentage == 28.0

    # 7. Check running balance calculation
    tx_history = get_bawar_star_partner_transactions(partner.id, db=db)
    print("\n--- Transaction History Running Balance ---")
    for item in tx_history:
        print(f"{item.transaction_type}: Billed={item.billed_amount}, Paid={item.paid_amount}, RunningBal={item.running_balance}")

    assert tx_history[-1].running_balance == 90000.0
    print("\n✅ ALL BACKEND LOGIC VERIFIED SUCCESSFULLY!")

finally:
    db.close()
