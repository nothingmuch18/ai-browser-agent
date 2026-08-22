# AI Browser Agent - Team Integration & Branch Merge Automation (PowerShell)
# For Member D (Infra & Integration Lead) to run at sync checkpoints

$ErrorActionPreference = "Continue"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "AI Browser Agent - Automated Team Integration (Windows)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "[-] Git is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "`n[Step 1] Fetching latest branches from origin..." -ForegroundColor Yellow
git fetch --all --prune

Write-Host "`n[Step 2] Checking out 'develop' branch..." -ForegroundColor Yellow
$developExists = git branch --list develop
if ($developExists) {
    git checkout develop
    git pull origin develop
} else {
    git checkout -b develop
}

Write-Host "`n[Step 3] Merging Member D (Infrastructure & Docker)..." -ForegroundColor Yellow
git merge origin/member-d/infra -m "merge: integrate Member D infrastructure" --no-edit
if ($LASTEXITCODE -ne 0) { git merge member-d/infra -m "merge: integrate Member D infrastructure" --no-edit }
Write-Host "[+] Member D merged" -ForegroundColor Green

Write-Host "`n[Step 4] Merging Member A (Backend & AI Agent)..." -ForegroundColor Yellow
git merge origin/member-a/backend-ai -m "merge: integrate Member A backend & AI" --no-edit
if ($LASTEXITCODE -ne 0) { git merge member-a/backend-ai -m "merge: integrate Member A backend & AI" --no-edit }
Write-Host "[+] Member A merged" -ForegroundColor Green

Write-Host "`n[Step 5] Merging Member B (Browser Automation Engine)..." -ForegroundColor Yellow
git merge origin/member-b/browser-engine -m "merge: integrate Member B Playwright engine" --no-edit
if ($LASTEXITCODE -ne 0) { git merge member-b/browser-engine -m "merge: integrate Member B Playwright engine" --no-edit }
Write-Host "[+] Member B merged" -ForegroundColor Green

Write-Host "`n[Step 6] Merging Member C (Frontend Dashboard)..." -ForegroundColor Yellow
git merge origin/member-c/frontend -m "merge: integrate Member C frontend dashboard" --no-edit
if ($LASTEXITCODE -ne 0) { git merge member-c/frontend -m "merge: integrate Member C frontend dashboard" --no-edit }
Write-Host "[+] Member C merged" -ForegroundColor Green

# Clean up requirements.txt if needed
if (Test-Path "backend\requirements.txt") {
    Write-Host "`n[Step 7] Deduplicating backend/requirements.txt..." -ForegroundColor Yellow
    $lines = Get-Content "backend\requirements.txt" | Where-Object { 
        $_ -and (-not $_.StartsWith("<")) -and (-not $_.StartsWith("=")) -and (-not $_.StartsWith(">")) 
    } | Select-Object -Unique
    $lines | Set-Content "backend\requirements.txt"
    Write-Host "[+] Cleaned backend/requirements.txt" -ForegroundColor Green
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "All member branches integrated into 'develop'!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test full stack:  docker compose up --build" -ForegroundColor Yellow
Write-Host "2. Push develop:     git push origin develop" -ForegroundColor Yellow
Write-Host "3. Inform team:      'Everyone please run git checkout develop && git pull'" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
