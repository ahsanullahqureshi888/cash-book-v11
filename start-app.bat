@echo off
cd /d "%~dp0"

echo Starting SKY Cash Book Backend...
start "SKY Cash Book Backend" cmd /k "cd /d ""%~dp0backend"" && set ""PYTHONPATH=%~dp0backend"" && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8010"

ping 127.0.0.1 -n 6 > nul

echo Starting SKY Cash Book Frontend...
start "SKY Cash Book Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"
