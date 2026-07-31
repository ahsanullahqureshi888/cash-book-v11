import requests, json, sys

BASE = "http://localhost:8000"

def login():
    resp = requests.post(f"{BASE}/api/auth/login", json={"username":"admin","password":"Admin@123","remember_user":False})
    resp.raise_for_status()
    data = resp.json()
    print("Login successful, token:", data["token"])
    return data["token"]

def list_users(token):
    resp = requests.get(f"{BASE}/api/auth/users", headers={{"Authorization": f"Bearer {token}"}})
    resp.raise_for_status()
    print("Users:", json.dumps(resp.json(), indent=2))

def main():
    token = login()
    list_users(token)

if __name__ == "__main__":
    main()
