import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import bcrypt

load_dotenv(".env.production")

db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("POSTGRES_URL_NON_POOLING")
if not db_url:
    print("ERROR: No DATABASE_URL found in .env.production")
    sys.exit(1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
if "?" in db_url and "pg8000" in db_url:
    db_url = db_url.split("?")[0]

print("Connecting to:", db_url.split("@")[-1] if "@" in db_url else db_url)

import ssl
engine = create_engine(db_url, connect_args={"ssl_context": ssl.create_default_context()})

pw_hash1 = bcrypt.hashpw(b"Admin@123", bcrypt.gensalt()).decode("utf-8")
pw_hash2 = bcrypt.hashpw(b"Qur78Ahs@@", bcrypt.gensalt()).decode("utf-8")

# 1. Synchronize 'admin' with autocommit transaction
with engine.begin() as conn:
    res = conn.execute(text("SELECT id, username, full_name, role, is_active FROM users"))
    users = list(res)
    print("\n--- Current Users in Neon DB ---")
    for r in users:
        print(f"ID: {r[0]}, Username: '{r[1]}', FullName: '{r[2]}', Role: '{r[3]}', Active: {r[4]}")

    admin_exists = any(r[1].lower() == 'admin' for r in users)
    if admin_exists:
        conn.execute(text("UPDATE users SET password_hash = :pw, is_active = true, failed_attempts = 0, locked_until = NULL, must_change_password = false WHERE LOWER(username) = 'admin'"), {"pw": pw_hash1})
        print("Updated existing 'admin' password to: Admin@123")
    else:
        conn.execute(text("INSERT INTO users (username, full_name, role, password_hash, avatar_path, is_active, failed_attempts, must_change_password, created_at, created_date, updated_at) VALUES ('admin', 'Ahsanullah Qureshi', 'Administrator', :pw, '', true, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"), {"pw": pw_hash1})
        print("Created new 'admin' user with password: Admin@123")

# 2. Synchronize 'ahsanullahqur888' in a separate autocommit transaction
with engine.begin() as conn:
    res = conn.execute(text("SELECT id, username FROM users WHERE LOWER(username) = 'ahsanullahqur888'"))
    user2_exists = res.fetchone() is not None
    if user2_exists:
        conn.execute(text("UPDATE users SET password_hash = :pw, is_active = true, failed_attempts = 0, locked_until = NULL, must_change_password = false WHERE LOWER(username) = 'ahsanullahqur888'"), {"pw": pw_hash2})
        print("Updated existing 'ahsanullahqur888' password to: Qur78Ahs@@")
    else:
        conn.execute(text("INSERT INTO users (username, full_name, role, password_hash, avatar_path, is_active, failed_attempts, must_change_password, created_at, created_date, updated_at) VALUES ('ahsanullahqur888', 'Ahsanullah Qureshi', 'Administrator', :pw, '', true, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"), {"pw": pw_hash2})
        print("Created new 'ahsanullahqur888' user with password: Qur78Ahs@@")

print("\nAll credentials synchronized in Neon PostgreSQL DB successfully!")
