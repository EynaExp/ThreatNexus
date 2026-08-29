#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  ThreatNexus — Restart Script
#  Usage: ./restart.sh [PORT] [DATA_FILE] [DEBUG]
# ═══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "  Restarting ThreatNexus..."
echo ""

"$SCRIPT_DIR/stop.sh"
sleep 1
"$SCRIPT_DIR/start.sh" "$@"
