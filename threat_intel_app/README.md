# ThreatNexus — Threat Intelligence Platform

A compact, secure Python/Flask web application for threat intelligence and CVE management.

## Quick Start

```bash
# Make scripts executable
chmod +x start.sh stop.sh restart.sh

# Start on default port 5000
./start.sh

# Start on custom port with custom data file
./start.sh 8080 /opt/data/intel.json

# Stop
./stop.sh

# Restart with new settings
./restart.sh 9000
```

## First Boot

On first launch, open `http://localhost:<PORT>` and you'll be prompted to create the admin account.
This is the **only time** setup can be done. After creation, normal login applies.

## Script Arguments

| Script | Arg 1 | Arg 2 | Arg 3 |
|--------|-------|-------|-------|
| start.sh | PORT (default: 5000) | DATA_FILE (default: ./data/threat_intel.json) | DEBUG (default: false) |
| restart.sh | same as start.sh | | |

## Features

- **CVE Records**: Track CVEs with severity, type (RCE/LPE/SQLi/...), PoC code, references, country
- **Access Map**: Hosts/IPs with associated CVEs, services, notes, country
- **3D Globe**: Interactive rotating globe showing country heatmap, click to filter
- **Credential Manager**: SSH/RDP/FortiGate and custom service credentials
- **Users & Groups**: Admin creates users with multiple group assignments
- **Group-based Access Control**: Users only see data assigned to their groups
- **Password Management**: Users can change their own passwords

## Security

- PBKDF2-SHA256 password hashing (600,000 rounds)
- Secure session cookies (HttpOnly, SameSite)
- Content Security Policy headers
- Input sanitization
- No sensitive data leakage
- One-time admin setup

## Requirements

- Python 3.8+
- bash (for scripts)
- Internet connection on first run (for globe GeoJSON data)
