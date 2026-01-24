#!/bin/bash
# Start all services

echo "🚀 Starting all services..."

# Start MCP Servers in background
echo "Starting MCP Servers..."
cd "$(dirname "$0")/../mcp_servers"
npm run dev &
MCP_PID=$!
echo "MCP Servers PID: $MCP_PID"

# Start Backend in background
echo "Starting Backend..."
cd "$(dirname "$0")/../backend"
npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Start Frontend in background
echo "Starting Frontend..."
cd "$(dirname "$0")/../frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Save PIDs to file
echo "$MCP_PID" > "$(dirname "$0")/.mcp.pid"
echo "$BACKEND_PID" > "$(dirname "$0")/.backend.pid"
echo "$FRONTEND_PID" > "$(dirname "$0")/.frontend.pid"

echo ""
echo "✅ All services started!"
echo "   MCP:      http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "To stop all services, run: ./scripts/stop-all.sh"

wait
