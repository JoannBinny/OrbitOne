#!/usr/bin/env bash
# Starts the OrbitOne backend (FastAPI) and frontend (Vite) together for local dev.
#
# Prerequisites (one-time):
#   python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
#   python backend/seed.py
#   cd frontend && npm install
#   Real credentials in agent/.env (see .claude/skills/orbitone-frontend-build/SKILL.md)
#
# Usage: ./start-dev.sh

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -d .venv ]; then
  echo "No .venv found — run: python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

cleanup() {
  echo "Stopping OrbitOne..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting backend on http://localhost:8000 ..."
(cd backend && source ../.venv/bin/activate && exec uvicorn main:app --port 8000) &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:5173 ..."
(cd frontend && exec npm run dev -- --port 5173) &
FRONTEND_PID=$!

echo "OrbitOne running — backend: http://localhost:8000/docs, frontend: http://localhost:5173"

sleep 2
if command -v open >/dev/null 2>&1 && [ -d "/Applications/Google Chrome.app" ]; then
  open -a "Google Chrome" "http://localhost:5173"
elif command -v open >/dev/null 2>&1; then
  open "http://localhost:5173"
fi

echo "Press Ctrl+C to stop both."
wait "$BACKEND_PID" "$FRONTEND_PID"
