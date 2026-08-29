#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  ThreatNexus — Stop Script
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.threatnexus.pid"

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║         THREATNEXUS — Stopping Application          ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

if [ ! -f "$PID_FILE" ]; then
  echo "  ⚠  No PID file found. ThreatNexus may not be running."
  # Try to find and kill by process name anyway
  PIDS=$(pgrep -f "python.*app.py" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "  Found running processes: $PIDS"
    echo "$PIDS" | xargs kill -TERM 2>/dev/null || true
    echo "  ✓ Processes terminated"
  fi
  exit 0
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
  echo "  Stopping PID $PID..."
  kill -TERM "$PID"
  # Wait up to 10 seconds
  for i in {1..10}; do
    if ! kill -0 "$PID" 2>/dev/null; then
      break
    fi
    sleep 1
  done
  if kill -0 "$PID" 2>/dev/null; then
    echo "  Force killing PID $PID..."
    kill -KILL "$PID" 2>/dev/null || true
  fi
  echo "  ✓ ThreatNexus stopped"
else
  echo "  ⚠  Process $PID not found (may have already stopped)"
fi

rm -f "$PID_FILE"
echo "  ✓ PID file removed"
echo ""
echo "  ThreatNexus has been shut down."
echo ""
