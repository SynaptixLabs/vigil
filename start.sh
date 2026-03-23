#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# Vigil — Start Script (Linux / macOS / CI)
# Bug Discovery & Resolution Platform
# ─────────────────────────────────────────────────────
#
# Usage:
#   ./start.sh              # Dev mode: extension watch + server
#   ./start.sh server       # Only vigil-server (port 7474)
#   ./start.sh ext          # Only extension watch build
#   ./start.sh all          # Extension + server + dashboard + demo app
#   ./start.sh production   # Build all + start server in production mode
#   ./start.sh test         # Run full test suite
#   ./start.sh stop         # Kill processes on all Vigil ports
#   ./start.sh status       # Check health of all services
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Port map (from CLAUDE.md §4) ---
SERVER_PORT=7474
QA_PORT=3847
DEMO_PORT=3900
VITE_PORT=5173

# --- Helpers ---

log() { echo "[vigil] $*"; }

kill_port() {
  local port=$1
  local pid
  pid=$(lsof -ti ":$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    log "Port $port in use by PID $pid — killing..."
    kill -9 $pid 2>/dev/null || true
    sleep 0.5
  fi
}

check_port() {
  lsof -ti ":$1" >/dev/null 2>&1
}

cleanup() {
  log "Shutting down..."
  jobs -p 2>/dev/null | xargs -r kill 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT

# --- STOP ---

cmd_stop() {
  log "Stopping all Vigil services..."
  kill_port $SERVER_PORT
  kill_port $VITE_PORT
  kill_port $QA_PORT
  kill_port $DEMO_PORT
  log "All services stopped."
}

# --- STATUS ---

cmd_status() {
  log "Service Status:"
  echo ""

  if check_port $SERVER_PORT; then
    echo "  vigil-server (:$SERVER_PORT):  UP"
    local health
    health=$(curl -sf "http://localhost:$SERVER_PORT/health" 2>/dev/null || echo "unreachable")
    echo "    Health: $health"
  else
    echo "  vigil-server (:$SERVER_PORT):  DOWN"
  fi

  if check_port $VITE_PORT; then
    echo "  Extension HMR (:$VITE_PORT):   UP"
  else
    echo "  Extension HMR (:$VITE_PORT):   DOWN"
  fi

  if check_port $QA_PORT; then
    echo "  QA target app (:$QA_PORT):    UP"
  else
    echo "  QA target app (:$QA_PORT):    DOWN"
  fi

  if check_port $DEMO_PORT; then
    echo "  Demo app (:$DEMO_PORT):       UP"
  else
    echo "  Demo app (:$DEMO_PORT):       DOWN"
  fi

  echo ""
}

# --- TEST ---

cmd_test() {
  log "Running full test suite..."
  cd "$SCRIPT_DIR"
  log "Type check..."
  npx tsc --noEmit
  log "Unit + integration tests..."
  npx vitest run
  log "Lint..."
  npx eslint src/
  log "All tests passed."
}

# --- BUILD ---

cmd_build() {
  log "Building all packages..."
  cd "$SCRIPT_DIR"
  log "  Building shared types..."
  npm run build:shared
  log "  Building extension..."
  npm run build
  log "  Building server..."
  npm run build:server
  log "  Building dashboard..."
  npm run build:dashboard
  log "Build complete."
}

# --- PRODUCTION ---

cmd_production() {
  cmd_build
  log "Starting vigil-server in production mode on :$SERVER_PORT..."
  cd "$SCRIPT_DIR"
  NODE_ENV=production npm run start:server
}

# --- DEV (default) ---

cmd_dev() {
  local start_server=true
  local start_ext=true
  local start_qa=false
  local start_demo=false

  case "${1:-dev}" in
    server) start_ext=false ;;
    ext)    start_server=false ;;
    all)    start_qa=true; start_demo=true ;;
  esac

  # Kill stale processes
  log "Clearing stale processes..."
  $start_server && kill_port $SERVER_PORT
  $start_ext && kill_port $VITE_PORT
  $start_qa && kill_port $QA_PORT
  $start_demo && kill_port $DEMO_PORT
  sleep 1

  local build_stamp
  build_stamp=$(date "+%Y-%m-%d_%H:%M:%S")

  # Banner
  echo ""
  echo "  ============================================"
  echo "   Vigil - Bug Discovery & Resolution Platform"
  echo "  --------------------------------------------"
  echo "   Build:      $build_stamp"
  $start_server && echo "   Server:     http://localhost:$SERVER_PORT"
  $start_server && echo "   Health:     http://localhost:$SERVER_PORT/health"
  $start_server && echo "   Dashboard:  http://localhost:$SERVER_PORT/dashboard"
  $start_ext && echo "   Extension:  Vite HMR on :$VITE_PORT -> load dist/ in Chrome"
  $start_qa && echo "   QA App:     http://localhost:$QA_PORT"
  $start_demo && echo "   Demo App:   http://localhost:$DEMO_PORT"
  echo "   Mode:       Development (hot-reload)"
  echo "   Press Ctrl+C to stop"
  echo "  ============================================"
  echo ""

  cd "$SCRIPT_DIR"

  # Background: vigil-server
  if $start_server; then
    log "Starting vigil-server on :$SERVER_PORT..."
    npm run dev:server &
    sleep 2
  fi

  # Background: QA target app
  if $start_qa; then
    local qa_path="$SCRIPT_DIR/tests/fixtures/target-app"
    if [ -d "$qa_path" ]; then
      log "Starting QA target app on :$QA_PORT..."
      (cd "$qa_path" && npm start) &
    fi
  fi

  # Background: Demo app
  if $start_demo; then
    local demo_path="$SCRIPT_DIR/demos/refine-demo-app"
    if [ -d "$demo_path" ]; then
      log "Starting demo app on :$DEMO_PORT..."
      (cd "$demo_path" && npm run dev) &
    fi
  fi

  # Foreground: Extension watch (blocks terminal — last)
  if $start_ext; then
    log "Starting extension dev build (Vite + CRXJS)..."
    npm run dev
  else
    log "Server running. Press Ctrl+C to stop."
    wait
  fi
}

# --- Main ---

case "${1:-dev}" in
  stop)       cmd_stop ;;
  status)     cmd_status ;;
  test)       cmd_test ;;
  production) cmd_production ;;
  build)      cmd_build ;;
  server|ext|all|dev)
              cmd_dev "$@" ;;
  *)
    echo "Usage: $0 {dev|server|ext|all|production|build|test|stop|status}"
    exit 1
    ;;
esac
