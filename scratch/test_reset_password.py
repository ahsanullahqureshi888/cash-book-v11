import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import SessionLocal
from app import models
from app.routes.auth import verify_password, hash_password

db = SessionLocal()

# 1. Reset admin user
admin = db.query(models.User).filter(models.User.username == "admin").first()
if admin:
    print("Found admin user.")
    print("Checking 'admin123':", verify_password("admin123", admin.password_hash))
    print("Checking 'Admin@123':", verify_password("Admin@123", admin.password_hash))
    admin.password_hash = hash_password("Admin@123")
    admin.must_change_password = False
    admin.is_active = True
    db.commit()
    print("Successfully reset admin password to 'Admin@123' and disabled must_change_password requirement.")
else:
    print("Admin user not found!")

# 2. Add / reset ahsanullahqur888 user
user2 = db.query(models.User).filter(models.User.username == "ahsanullahqur888").first()
if not user2:
    user2 = models.User(
        username="ahsanullahqur888",
        full_name="Ahsanullah Qureshi",
        role="Administrator",
        is_active=True,
        must_change_password=False,
    )
    db.add(user2)
    print("Creating default user ahsanullahqur888...")

user2.password_hash = hash_password("Qur78Ahs@@")
user2.must_change_password = False
user2.is_active = True
db.commit()
print("Successfully set password for 'ahsanullahqur888' to 'Qur78Ahs@@' and disabled must_change_password requirement.")

db.close()

