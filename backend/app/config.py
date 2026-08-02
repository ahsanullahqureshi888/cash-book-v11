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
    "ionic://localhost",
    "null",
    "file://",
]

env_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]
FRONTEND_ORIGINS = list(dict.fromkeys(DEFAULT_FRONTEND_ORIGINS + env_origins))

FRONTEND_ORIGIN_REGEX = os.getenv(
    "FRONTEND_ORIGIN_REGEX",
    r".*",
)


