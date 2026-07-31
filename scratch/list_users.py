import os
from sqlalchemy import create_engine, text

# Set PYTHONPATH to the backend directory
db_url = "sqlite:///./backend/cashbook.db"
engine = create_engine(db_url)

with engine.connect() as conn:
    print("Tables in database:")
    res = conn.execute(text("select name from sqlite_master where type='table'"))
    for row in res:
        print(" -", row[0])

    print("\nUsers in database:")
    try:
        res = conn.execute(text("select id, username, full_name, role, is_active, must_change_password from users"))
        for row in res:
            print(f"ID: {row[0]}, Username: {row[1]}, Full Name: {row[2]}, Role: {row[3]}, Active: {row[4]}, Must Change PW: {row[5]}")
    except Exception as e:
        print("Error reading users:", e)
