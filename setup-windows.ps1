<# 
    Sentinel - Windows One-Click Setup and Launch Script
    Compatible with Windows PowerShell 5.1 (ships with Windows 7/10/11)
#>

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $ProjectRoot) { $ProjectRoot = Get-Location }

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Sentinel - One-Click Setup and Launch" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# -- Step 1: Check Node.js --
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = $null
try { $nodeVersion = (& node -v 2>$null) } catch {}
if (-not $nodeVersion) {
    Write-Host "  ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Download it from: https://nodejs.org/en/download" -ForegroundColor Red
    Write-Host "  Install it, then run this script again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  Found Node.js $nodeVersion" -ForegroundColor Green

# -- Step 2: Check and Start MongoDB --
Write-Host "[2/6] Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = $false

# Check if MongoDB is already listening on port 27017
try {
    $mongoPort = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
    if ($mongoPort) {
        Write-Host "  MongoDB is already running on port 27017" -ForegroundColor Green
        $mongoRunning = $true
    }
} catch {}

if (-not $mongoRunning) {
    # Try Docker first
    $dockerAvailable = $null
    try { $dockerAvailable = (& docker --version 2>$null) } catch {}
    
    if ($dockerAvailable) {
        Write-Host "  Starting MongoDB via Docker..." -ForegroundColor Yellow
        $existing = & docker ps -a --filter "name=mongodb" --format "{{.Names}}" 2>$null
        if ($existing -eq "mongodb") {
            & docker start mongodb 2>$null | Out-Null
        } else {
            & docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo 2>$null | Out-Null
        }
        Start-Sleep -Seconds 3
        Write-Host "  MongoDB started via Docker" -ForegroundColor Green
        $mongoRunning = $true
    }
    
    if (-not $mongoRunning) {
        # Try Windows Service
        $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if (-not $mongoService) {
            $mongoService = Get-Service -Name "mongod" -ErrorAction SilentlyContinue
        }
        if ($mongoService) {
            if ($mongoService.Status -ne "Running") {
                Write-Host "  Starting MongoDB service..." -ForegroundColor Yellow
                Start-Service $mongoService.Name -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 3
            }
            Write-Host "  MongoDB service is running" -ForegroundColor Green
            $mongoRunning = $true
        }
    }

    if (-not $mongoRunning) {
        Write-Host "  WARNING: MongoDB is not running!" -ForegroundColor Red
        Write-Host "  Option 1: Install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Red
        Write-Host "  Option 2: Install Docker Desktop and run:" -ForegroundColor Red
        Write-Host "    docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# -- Step 3: Create .env if missing --
Write-Host "[3/6] Checking environment config..." -ForegroundColor Yellow
$envPath = Join-Path $ProjectRoot "server\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "  Creating .env from template..." -ForegroundColor Yellow
    
    # Generate random secrets
    $chars = [char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9')
    $jwtSecret = -join ($chars | Get-Random -Count 64)
    $refreshSecret = -join ($chars | Get-Random -Count 64)
    
    $envLines = @(
        "PORT=3000",
        "DATABASE_URL=mongodb://localhost:27017/sentinel",
        "NODE_ENV=development",
        "AUTH_STRATEGY=email",
        "JWT_SECRET=$jwtSecret",
        "REFRESH_TOKEN_SECRET=$refreshSecret",
        "CLIENT_URL=http://localhost:5173"
    )
    $envLines | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "  Created .env with auto-generated secrets" -ForegroundColor Green
} else {
    Write-Host "  .env already exists" -ForegroundColor Green
}

# -- Step 4: Install dependencies --
Write-Host "[4/6] Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
Set-Location $ProjectRoot
& npm install 2>&1 | Out-Null
$pkgPath = Join-Path $ProjectRoot "package.json"
if (Test-Path $pkgPath) {
    $pkgContent = Get-Content $pkgPath -Raw | ConvertFrom-Json
    if ($pkgContent.scripts.postinstall) {
        & npm run postinstall 2>&1 | Out-Null
    }
}
Write-Host "  Dependencies installed" -ForegroundColor Green

# -- Step 5: Start the dev server --
Write-Host "[5/6] Starting Sentinel..." -ForegroundColor Yellow

# Start in a new window so this script can continue
Start-Process "cmd.exe" -ArgumentList ("/c", "cd /d `"$ProjectRoot`"", "& npm run dev") -WindowStyle Normal

# Wait for the server to be ready
Write-Host "  Waiting for server to start..." -ForegroundColor Yellow
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            break
        }
    } catch {}
    Write-Host "  Still waiting... ($waited seconds)" -ForegroundColor DarkGray
}

# -- Step 6: Open browser --
Write-Host "[6/6] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "   Sentinel is running!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  First time? Register at http://localhost:5173/register" -ForegroundColor Yellow
Write-Host ""
Write-Host "  To stop: close the terminal window running the server." -ForegroundColor DarkGray
Write-Host ""
