# PowerShell script to stop all services
# Usage: .\stop-all.ps1

Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Stop by PID files
foreach ($service in @("mcp", "backend", "frontend")) {
    $pidFile = "$scriptDir\.$service.pid"
    if (Test-Path $pidFile) {
        $processId = Get-Content $pidFile
        try {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                Stop-Process -Id $processId -Force
                Write-Host "Stopped $service (PID: $processId)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "Process $service (PID: $processId) not found" -ForegroundColor Yellow
        }
        Remove-Item $pidFile -Force
    }
}

# Kill by port (fallback)
Write-Host "Cleaning up any remaining processes..." -ForegroundColor Gray

$ports = @{
    3000 = "backend"
    3001 = "mcp"
    5173 = "frontend"
}

foreach ($port in $ports.Keys) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Killed process on port $port ($($ports[$port]))" -ForegroundColor Green
        }
        catch {}
    }
}

Write-Host "✅ All services stopped!" -ForegroundColor Green
