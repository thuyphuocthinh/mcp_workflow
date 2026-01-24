# PowerShell script to start all services
# Usage: .\start-all.ps1

Write-Host "🚀 Starting all services..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

# Start MCP Servers
Write-Host "Starting MCP Servers..." -ForegroundColor Blue
$mcp = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$rootDir\mcp_servers" -PassThru -NoNewWindow
$mcp.Id | Out-File "$scriptDir\.mcp.pid"

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
$backend = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$rootDir\backend" -PassThru -NoNewWindow
$backend.Id | Out-File "$scriptDir\.backend.pid"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Magenta
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$rootDir\frontend" -PassThru -NoNewWindow
$frontend.Id | Out-File "$scriptDir\.frontend.pid"

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "   MCP:      http://localhost:3001" -ForegroundColor Blue
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "To stop all services, run: .\scripts\stop-all.ps1" -ForegroundColor Yellow
