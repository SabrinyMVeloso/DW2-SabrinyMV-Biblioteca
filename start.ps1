# Start script for Biblioteca (PowerShell)
# Usage: from project root in PowerShell: .\start.ps1

$ErrorActionPreference = 'Stop'

Write-Host "Starting Biblioteca: backend (uvicorn) and frontend (static server)"

# Ensure we're in the repository root
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Start backend in a new PowerShell window (assumes Python env is active or python is in PATH)
$backendDir = Join-Path $root 'backend'
$uvicornCmd = "cd `"$backendDir`"; uvicorn app:app --reload --host 127.0.0.1 --port 8000"

Write-Host "Launching backend: uvicorn at http://127.0.0.1:8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $uvicornCmd

# Start frontend static server (uses Python http.server) on port 5500
$frontendDir = Join-Path $root 'frontend'
$httpCmd = "cd `"$frontendDir`"; python -m http.server 5500"

Write-Host "Launching frontend static server at http://127.0.0.1:5500"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $httpCmd

Write-Host "Both servers started. Open http://127.0.0.1:5500 in your browser."
try {
	# Open default browser to the frontend URL
	Start-Process 'explorer' 'http://127.0.0.1:5500'
} catch {
	Write-Host "Could not open browser automatically. Open http://127.0.0.1:5500 manually."
}
