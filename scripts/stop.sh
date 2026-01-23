#!/bin/bash
# Stop a single service
# Usage: ./stop.sh [mcp|backend|frontend]

SERVICE=$1
SCRIPT_DIR="$(dirname "$0")"

if [ -z "$SERVICE" ]; then
    echo "Usage: ./stop.sh [mcp|backend|frontend]"
    exit 1
fi

stop_by_pid() {
    local name=$1
    local pid_file="$SCRIPT_DIR/.$name.pid"
    
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo "✅ Stopped $name (PID: $PID)"
        else
            echo "⚠️ Process $name (PID: $PID) not running"
        fi
        rm "$pid_file"
    else
        echo "⚠️ No PID file for $name"
    fi
}

stop_by_port() {
    local port=$1
    local name=$2
    lsof -ti:$port | xargs kill -9 2>/dev/null && echo "✅ Killed process on port $port ($name)"
}

case $SERVICE in
    mcp)
        echo "🛑 Stopping MCP Servers..."
        stop_by_pid "mcp"
        stop_by_port 3001 "mcp"
        ;;
    backend)
        echo "🛑 Stopping Backend..."
        stop_by_pid "backend"
        stop_by_port 3000 "backend"
        ;;
    frontend)
        echo "🛑 Stopping Frontend..."
        stop_by_pid "frontend"
        stop_by_port 5173 "frontend"
        ;;
    *)
        echo "❌ Unknown service: $SERVICE"
        echo "Available services: mcp, backend, frontend"
        exit 1
        ;;
esac
