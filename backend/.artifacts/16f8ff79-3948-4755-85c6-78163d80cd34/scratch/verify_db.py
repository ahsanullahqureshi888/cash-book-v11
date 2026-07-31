import os
import sys

# Script is at backend/.artifacts/id/scratch/verify_db.py
# 1: scratch, 2: id, 3: .artifacts, 4: backend, 5: root? NO
# Current dir: .../backend/.artifacts/16f8ff79-3948-4755-85c6-78163d80cd34/scratch/
# .. -> .../backend/.artifacts/16f8ff79-3948-4755-85c6-78163d80cd34/
# .. -> .../backend/.artifacts/
# .. -> .../backend/
# .. -> .../ (root)
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
print(f"Root dir: {root_dir}")
sys.path.append(root_dir)

try:
    from backend.app.database import engine, Base
    from sqlalchemy import inspect
    print("Imported backend.app.database successfully")
except ImportError as e:
    print(f"ImportError: {e}")
    # Try another way if root_dir is wrong
    alternative_root = "C:/Users/HomePC/StudioProjects/cash-book-v11"
    print(f"Trying alternative root: {alternative_root}")
    sys.path.append(alternative_root)
    try:
        from backend.app.database import engine, Base
        print("Imported successfully with alternative root")
    except ImportError as e2:
        print(f"Final ImportError: {e2}")
        sys.exit(1)

def check_db():
    print(f"Connecting to: {engine.url}")
    try:
        # This will create the database file and tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created (if not existed).")

        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables found: {tables}")

        if len(tables) > 0:
            print("Backend database check: SUCCESS")
        else:
            print("Backend database check: FAILED (No tables created)")

    except Exception as e:
        print(f"Backend database check: ERROR - {e}")

if __name__ == "__main__":
    check_db()
