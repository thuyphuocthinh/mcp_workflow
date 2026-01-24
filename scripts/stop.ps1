# PowerShell script to stop a single service
# Usage: .\stop.ps1 [mcp|backend|frontend]

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("mcp", "backend", "frontend")]
    [string]$Service
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$portMap = @{
    "mcp"      = 3001
    "backend"  = 3000
    "frontend" = 5173
}

function Stop-ServiceByPid {
    param($name)
    $pidFile = "$scriptDir\.$name.pid"
    if (Test-Path $pidFile) {
        $processId = Get-Content $pidFile
        try {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                Stop-Process -Id $processId -Force
                Write-Host "✅ Stopped $name (PID: $processId)" -ForegroundColor Green
            }
            else {
                Write-Host "⚠️ Process $name (PID: $processId) not running" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "⚠️ Error stopping $name" -ForegroundColor Yellow
        }
        Remove-Item $pidFile -Force
    }
    else {
        Write-Host "⚠️ No PID file for $name" -ForegroundColor Yellow
    }
}

function Stop-ServiceByPort {
    param($port, $name)
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Killed process on port $port ($name)" -ForegroundColor Green
        }
        catch {}
    }
}

Write-Host "🛑 Stopping $Service..." -ForegroundColor Yellow
Stop-ServiceByPid $Service
Stop-ServiceByPort $portMap[$Service] $Service
