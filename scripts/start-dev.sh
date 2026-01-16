#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

echo "========================================"
echo "  Stopping Previous Servers"
echo "========================================"
echo ""
echo "Killing existing Node processes..."
pkill -f "node.*backend" 2>/dev/null
pkill -f "node.*frontend" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
sleep 1
echo "Done."
echo ""

echo "========================================"
echo "  Starting All Servers (DEV MODE)"
echo "========================================"
echo ""

echo "[1] Starting Backend API Server (with auto-reload)..."
cd "$SCRIPT_DIR/../backend"
npm run dev > /tmp/backend-api.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 2

echo "[2] Starting Frontend Static Server (with auto-reload)..."
cd "$SCRIPT_DIR/.."
npm run dev > /tmp/frontend-static.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "========================================"
echo "  All Servers Started! (DEV MODE)"
echo "========================================"
echo ""
echo "Backend API:  http://localhost:3939"
echo "Frontend:     http://localhost:8888"
echo ""
echo "Auto-reload: Enabled"
echo "- Backend: Changes in backend/ will auto-restart"
echo "- Frontend: Refresh browser to see changes"
echo ""
echo "Logs:"
echo "- Backend:  tail -f /tmp/backend-api.log"
echo "- Frontend: tail -f /tmp/frontend-static.log"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Trap SIGINT (Ctrl+C) to cleanup
trap cleanup SIGINT SIGTERM

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "node.*backend" 2>/dev/null
    pkill -f "node.*frontend" 2>/dev/null
    pkill -f "nodemon" 2>/dev/null
    echo "All servers stopped."
    exit 0
}

# Wait for user interrupt
wait
