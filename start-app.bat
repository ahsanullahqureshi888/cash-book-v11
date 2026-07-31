@echo off
rem cspell:ignore PYTHONPATH venv uvicorn
cd /d "%~dp0"

echo Starting SKY Cash Book Backend...
start "" cmd /k title SKY Cash Book Backend ^&^& cd /d "%~dp0backend" ^&^& set "PYTHONPATH=%~dp0backend" ^&^& ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

ping 127.0.0.1 -n 6 > nul

echo Starting SKY Cash Book Frontend...
start "" cmd /k title SKY Cash Book Frontend ^&^& cd /d "%~dp0frontend" ^&^& npm run dev
