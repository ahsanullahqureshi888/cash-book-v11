import sqlite3
import bcrypt

pw_hash = bcrypt.hashpw(b'Qur78Ahs@@', bcrypt.gensalt()).decode('utf-8')

conn = sqlite3.connect('cashbook.db')
cur = conn.cursor()

# Update admin
cur.execute('''
    UPDATE users 
    SET password_hash = ?, failed_attempts = 0, locked_until = NULL, must_change_password = 0 
    WHERE username = 'admin'
''', (pw_hash,))

# Ensure ahsanullahqur888 exists with Administrator role
existing = cur.execute("SELECT id FROM users WHERE username = 'ahsanullahqur888'").fetchone()
if existing:
    cur.execute('''
        UPDATE users 
        SET password_hash = ?, role = 'Administrator', is_active = 1, failed_attempts = 0, locked_until = NULL, must_change_password = 0 
        WHERE username = 'ahsanullahqur888'
    ''', (pw_hash,))
else:
    cur.execute('''
        INSERT INTO users (username, full_name, role, password_hash, is_active, failed_attempts, locked_until, must_change_password)
        VALUES ('ahsanullahqur888', 'Ahsanullah Qureshi', 'Administrator', ?, 1, 0, NULL, 0)
    ''', (pw_hash,))

conn.commit()
conn.close()
print("Successfully updated passwords for admin and ahsanullahqur888 to Qur78Ahs@@")
