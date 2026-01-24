#!/bin/bash
# Stop all services

SCRIPT_DIR="$(dirname "$0")"

echo "🛑 Stopping all services..."

# Kill by PID files
for service in mcp backend frontend; do
    PID_FILE="$SCRIPT_DIR/.$service.pid"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo "Stopped $service (PID: $PID)"
        fi
        rm "$PID_FILE"
    fi
done

# Also kill by port (fallback)
echo "Cleaning up any remaining processes..."

# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Kill process on port 3001 (mcp)
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "✅ All services stopped!"
