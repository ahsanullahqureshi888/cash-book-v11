import os
import sys

# Add backend root to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, SessionLocal, Base, ensure_sqlite_schema, ensure_payroll_schema
from app import models

def seed_groups_and_branches():
    # Make sure SQLite schema alters have run
    ensure_sqlite_schema()
    ensure_payroll_schema()
    
    # Make sure all tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if groups already exist
        if db.query(models.Group).count() > 0:
            print("Groups and branches already exist. Checking transaction branch assignments...")
            unlinked_txs = db.query(models.Transaction).filter(models.Transaction.branch_id == None).all()
            if unlinked_txs:
                print(f"Linking {len(unlinked_txs)} unlinked transactions to branches...")
                kabul = db.query(models.Branch).filter(models.Branch.name == "Kabul").first()
                kandahar_a = db.query(models.Branch).filter(models.Branch.name == "Kandahar").first()
                herat = db.query(models.Branch).filter(models.Branch.name == "Herat").first()
                branch_ids = [kabul.id, kandahar_a.id, herat.id] if (kabul and kandahar_a and herat) else []
                if branch_ids:
                    for idx, tx in enumerate(unlinked_txs):
                        tx.branch_id = branch_ids[idx % len(branch_ids)]
                    db.commit()
                    print("Linked unlinked transactions successfully!")
            else:
                print("All transactions are already linked.")
            return

        print("Seeding groups and branches...")
        
        # 1. Create Groups
        group_a = models.Group(name="Group A")
        group_b = models.Group(name="Group B")
        db.add_all([group_a, group_b])
        db.commit()

        # 2. Create Branches
        kabul = models.Branch(name="Kabul", group_id=group_a.id)
        kandahar_a = models.Branch(name="Kandahar", group_id=group_a.id)
        
        herat = models.Branch(name="Herat", group_id=group_b.id)
        kandahar_b = models.Branch(name="Kandahar", group_id=group_b.id)
        consolidated_b = models.Branch(name="All Branches (Consolidated)", group_id=group_b.id)
        
        db.add_all([kabul, kandahar_a, herat, kandahar_b, consolidated_b])
        db.commit()

        print(f"Created Group A: Branch {kabul.name} (ID: {kabul.id}), Branch {kandahar_a.name} (ID: {kandahar_a.id})")
        print(f"Created Group B: Branch {herat.name} (ID: {herat.id}), Branch {kandahar_b.name} (ID: {kandahar_b.id}), Branch {consolidated_b.name} (ID: {consolidated_b.id})")

        # 3. Deterministically link existing transactions to branches for preview purposes
        transactions = db.query(models.Transaction).all()
        if transactions:
            print(f"Linking {len(transactions)} existing transactions to branches...")
            branch_ids = [kabul.id, kandahar_a.id, herat.id, kandahar_b.id]
            for idx, tx in enumerate(transactions):
                tx.branch_id = branch_ids[idx % len(branch_ids)]
            db.commit()
            print("Linked successfully!")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_groups_and_branches()
