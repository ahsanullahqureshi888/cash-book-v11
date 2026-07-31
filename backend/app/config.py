import os

APP_NAME = "BAWAR STAR Cash Book API"

DEFAULT_FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "https://localhost",
    "http://localhost",
    "capacitor://localhost",
]

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS", ",".join(DEFAULT_FRONTEND_ORIGINS)
    ).split(",")
    if origin.strip()
]
FRONTEND_ORIGIN_REGEX = os.getenv(
    "FRONTEND_ORIGIN_REGEX",
    r"^(https://[a-z0-9-]+\.vercel\.app|https?://(localhost|127\.0\.0\.1)(:\d{1,5})?|capacitor://localhost)$",
)
