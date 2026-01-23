# PowerShell script to start a single service
# Usage: .\start.ps1 [mcp|backend|frontend]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("mcp", "backend", "frontend")]
    [string]$Service
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

switch ($Service) {
    "mcp" {
        Write-Host "🚀 Starting MCP Servers..." -ForegroundColor Blue
        $proc = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$rootDir\mcp_servers" -PassThru -NoNewWindow
        $proc.Id | Out-File "$scriptDir\.mcp.pid"
        Write-Host "✅ MCP Servers started (PID: $($proc.Id))" -ForegroundColor Green
    }
    "backend" {
        Write-Host "🚀 Starting Backend..." -ForegroundColor Green
        $proc = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$rootDir\backend" -PassThru -NoNewWindow
        $proc.Id | Out-File "$scriptDir\.backend.pid"
        Write-Host "✅ Backend started (PID: $($proc.Id))" -ForegroundColor Green
    }
    "frontend" {
        Write-Host "🚀 Starting Frontend..." -ForegroundColor Magenta
        $proc = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$rootDir\frontend" -PassThru -NoNewWindow
        $proc.Id | Out-File "$scriptDir\.frontend.pid"
        Write-Host "✅ Frontend started (PID: $($proc.Id))" -ForegroundColor Green
    }
}
