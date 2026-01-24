#!/bin/bash
# Start a single service
# Usage: ./start.sh [mcp|backend|frontend]

SERVICE=$1
SCRIPT_DIR="$(dirname "$0")"

if [ -z "$SERVICE" ]; then
    echo "Usage: ./start.sh [mcp|backend|frontend]"
    exit 1
fi

case $SERVICE in
    mcp)
        echo "🚀 Starting MCP Servers..."
        cd "$SCRIPT_DIR/../mcp_servers"
        npm run dev &
        echo $! > "$SCRIPT_DIR/.mcp.pid"
        echo "✅ MCP Servers started (PID: $!)"
        ;;
    backend)
        echo "🚀 Starting Backend..."
        cd "$SCRIPT_DIR/../backend"
        npm start &
        echo $! > "$SCRIPT_DIR/.backend.pid"
        echo "✅ Backend started (PID: $!)"
        ;;
    frontend)
        echo "🚀 Starting Frontend..."
        cd "$SCRIPT_DIR/../frontend"
        npm run dev &
        echo $! > "$SCRIPT_DIR/.frontend.pid"
        echo "✅ Frontend started (PID: $!)"
        ;;
    *)
        echo "❌ Unknown service: $SERVICE"
        echo "Available services: mcp, backend, frontend"
        exit 1
        ;;
esac
