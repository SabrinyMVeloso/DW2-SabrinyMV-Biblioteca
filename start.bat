@echo off
REM Start script for Biblioteca (Windows CMD)
REM Usage: run from project root: start.bat

set ROOT=%~dp0
cd /d %ROOT%\backend
echo Starting backend (uvicorn) at http://127.0.0.1:8000
start "Backend" cmd /k "cd /d %ROOT%backend && uvicorn app:app --reload --host 127.0.0.1 --port 8000"

echo Starting frontend static server at http://127.0.0.1:5500
start "Frontend" cmd /k "cd /d %ROOT%frontend && python -m http.server 5500"
echo Opening frontend at http://127.0.0.1:5500
start "" "http://127.0.0.1:5500"
pause
