#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  ThreatNexus — Start Script
#  Usage: ./start.sh [PORT] [DATA_FILE] [DEBUG]
#  Example: ./start.sh 8080 /opt/data/threat_intel.json false
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Defaults ──────────────────────────────────────────
DEFAULT_PORT=5000
DEFAULT_DATA_FILE="$SCRIPT_DIR/data/threat_intel.json"
DEFAULT_DEBUG="false"
PID_FILE="$SCRIPT_DIR/.threatnexus.pid"
LOG_FILE="$SCRIPT_DIR/threatnexus.log"
VENV_DIR="$SCRIPT_DIR/.venv"

# ── Parse Arguments ───────────────────────────────────
PORT="${1:-$DEFAULT_PORT}"
DATA_FILE="${2:-$DEFAULT_DATA_FILE}"
DEBUG_MODE="${3:-$DEFAULT_DEBUG}"

# ── Validate Port ──────────────────────────────────────
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
  echo "❌ Invalid port: $PORT (must be 1-65535)"
  exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║         THREATNEXUS — Threat Intelligence           ║"
echo "╠════════════════════════════════════════════════════╣"
echo "║  Starting application...                            ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "  Port      : $PORT"
echo "  Data File : $DATA_FILE"
echo "  Debug     : $DEBUG_MODE"
echo "  Log File  : $LOG_FILE"
echo ""

# ── Check Python ───────────────────────────────────────
if command -v python3 &>/dev/null; then
  PYTHON="python3"
elif command -v python &>/dev/null; then
  PYTHON="python"
else
  echo "❌ Python 3 is not installed. Please install Python 3.8+"
  exit 1
fi

PY_VERSION=$($PYTHON --version 2>&1 | grep -oP '\d+\.\d+')
echo "  Python    : $($PYTHON --version)"

# ── Check if Already Running ───────────────────────────
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "⚠  ThreatNexus is already running (PID: $OLD_PID)"
    echo "   Run ./stop.sh first, or ./restart.sh"
    exit 1
  else
    rm -f "$PID_FILE"
  fi
fi

# ── Create Virtual Environment ─────────────────────────
if [ ! -d "$VENV_DIR" ]; then
  echo "  [1/3] Creating virtual environment..."
  $PYTHON -m venv "$VENV_DIR"
  echo "  ✓ Virtual environment created"
else
  echo "  [1/3] Virtual environment: exists"
fi

# ── Activate Venv ──────────────────────────────────────
source "$VENV_DIR/bin/activate"

# ── Install Dependencies ───────────────────────────────
echo "  [2/3] Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r "$SCRIPT_DIR/requirements.txt"
echo "  ✓ Dependencies installed"

# ── Create Data Directory ──────────────────────────────
DATA_DIR="$(dirname "$DATA_FILE")"
mkdir -p "$DATA_DIR"

# ── Generate Secret Key ────────────────────────────────
SECRET_KEY_FILE="$SCRIPT_DIR/.secret_key"
if [ ! -f "$SECRET_KEY_FILE" ]; then
  SECRET_KEY=$($PYTHON -c "import secrets; print(secrets.token_hex(32))")
  echo "$SECRET_KEY" > "$SECRET_KEY_FILE"
  chmod 600 "$SECRET_KEY_FILE"
  echo "  ✓ Secret key generated"
fi
SECRET_KEY=$(cat "$SECRET_KEY_FILE")

# ── Start Application ──────────────────────────────────
echo "  [3/3] Starting ThreatNexus..."
echo ""

export PORT="$PORT"
export DATA_FILE="$DATA_FILE"
export SECRET_KEY="$SECRET_KEY"
export DEBUG="$DEBUG_MODE"
export PYTHONDONTWRITEBYTECODE=1

# Start in background
nohup $PYTHON "$SCRIPT_DIR/app.py" \
  >> "$LOG_FILE" 2>&1 &

APP_PID=$!
echo "$APP_PID" > "$PID_FILE"

# Wait for startup
sleep 2

if kill -0 "$APP_PID" 2>/dev/null; then
  echo "╔════════════════════════════════════════════════════╗"
  echo "║  ✓ ThreatNexus started successfully!               ║"
  echo "╠════════════════════════════════════════════════════╣"
  echo "║  URL     : http://localhost:$PORT"
  echo "║  PID     : $APP_PID"
  echo "║  Logs    : tail -f $LOG_FILE"
  echo "╚════════════════════════════════════════════════════╝"
  echo ""
else
  echo "❌ Failed to start ThreatNexus. Check logs:"
  echo "   tail -f $LOG_FILE"
  cat "$LOG_FILE" | tail -20
  rm -f "$PID_FILE"
  exit 1
fi
