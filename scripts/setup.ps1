# AI Browser Agent - Developer Environment Setup (Windows PowerShell)

$ErrorActionPreference = "Continue"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Setting up AI Browser Agent Environment (Windows)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check Prerequisites
Write-Host "`n[1/7] Checking Prerequisites..." -ForegroundColor Yellow

$pythonPath = ""
$pythonCmd = Get-Command py, python, python3 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($pythonCmd) {
    $pythonPath = $pythonCmd.Source
} elseif (Test-Path "$env:LOCALAPPDATA\Python\bin\python.exe") {
    $pythonPath = "$env:LOCALAPPDATA\Python\bin\python.exe"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe") {
    $pythonPath = "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
}

if ($pythonPath) {
    Write-Host "[+] Python found: $pythonPath" -ForegroundColor Green
} else {
    Write-Host "[-] Python is required. Please install Python 3.11+." -ForegroundColor Red
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    Write-Host "[+] Node.js found: $($nodeCmd.Source)" -ForegroundColor Green
} else {
    Write-Host "[-] Node.js is required. Please install Node 18+." -ForegroundColor Red
}

$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCmd) {
    Write-Host "[+] npm found: $($npmCmd.Source)" -ForegroundColor Green
} else {
    Write-Host "[-] npm is required." -ForegroundColor Red
}

$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerCmd) {
    Write-Host "[+] Docker found: $($dockerCmd.Source)" -ForegroundColor Green
} else {
    Write-Host "[*] Docker not detected in PATH (Optional for local dev mode)" -ForegroundColor Yellow
}

# 2. Configure Environment File (.env)
Write-Host "`n[2/7] Checking Environment Configuration (.env)..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[+] Created .env from .env.example" -ForegroundColor Green
        Write-Host "[*] Remember to set GEMINI_API_KEY in .env" -ForegroundColor Yellow
    } else {
        $defaultEnv = "GEMINI_API_KEY=`nDATABASE_URL=sqlite:///./agent.db`nCORS_ORIGINS=http://localhost:3000`nNEXT_PUBLIC_API_URL=http://localhost:8000`nNEXT_PUBLIC_WS_URL=ws://localhost:8000`n"
        [System.IO.File]::WriteAllText((Join-Path (Get-Location) ".env"), $defaultEnv)
        Write-Host "[+] Created default .env file" -ForegroundColor Green
    }
} else {
    Write-Host "[+] .env file already exists" -ForegroundColor Green
}

# 3. Setup Backend Python Virtual Environment
Write-Host "`n[3/7] Setting up Backend Python Virtual Environment..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Push-Location backend
    if (-not (Test-Path "venv")) {
        if ($pythonPath) {
            & $pythonPath -m venv venv
            Write-Host "[+] Created virtualenv in backend\venv" -ForegroundColor Green
        }
    }

    if (Test-Path "venv\Scripts\activate.ps1") {
        & .\venv\Scripts\Activate.ps1
        pip install --upgrade pip
        if (Test-Path "requirements.txt") {
            pip install -r requirements.txt
            Write-Host "[+] Backend Python dependencies installed" -ForegroundColor Green
        }

        # 4. Install Playwright Browsers
        Write-Host "`n[4/7] Installing Playwright Chromium Browser..." -ForegroundColor Yellow
        playwright install chromium
        Write-Host "[+] Playwright setup complete" -ForegroundColor Green
    }
    Pop-Location
}

# 5. Setup Frontend Node Dependencies
Write-Host "`n[5/7] Setting up Frontend Dependencies..." -ForegroundColor Yellow
if ((Test-Path "frontend") -and (Test-Path "frontend\package.json")) {
    Push-Location frontend
    npm install
    Write-Host "[+] Frontend dependencies installed" -ForegroundColor Green
    Pop-Location
} else {
    Write-Host "[*] frontend/package.json not present yet (Will install upon branch merge)" -ForegroundColor Yellow
}

# 6. Create Screenshots & Data Directory
Write-Host "`n[6/7] Initializing Storage Directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "backend\screenshots" | Out-Null
New-Item -ItemType Directory -Force -Path "screenshots" | Out-Null
Write-Host "[+] Created screenshots directory" -ForegroundColor Green

# 7. Seed Initial Demo Database
Write-Host "`n[7/7] Populating Demo Seed Data..." -ForegroundColor Yellow
if (Test-Path "scripts\seed_data.py") {
    if ($pythonPath) {
        & $pythonPath scripts\seed_data.py
        Write-Host "[+] Demo seed data generated successfully" -ForegroundColor Green
    }
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "Setup Completed Successfully!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "You can start the system with:"
Write-Host "  Docker:   docker compose up --build" -ForegroundColor Yellow
Write-Host "  Backend:  cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload" -ForegroundColor Yellow
Write-Host "  Frontend: cd frontend; npm run dev" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
