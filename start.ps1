<#
.SYNOPSIS
    Vigil - Start Script (Windows PowerShell)
    Bug Discovery & Resolution Platform — Chrome Extension + vigil-server + Dashboard

.DESCRIPTION
    .\start.ps1                # Dev mode (extension watch + server)
    .\start.ps1 -ServerOnly    # Only vigil-server (port 7474)
    .\start.ps1 -ExtOnly       # Only extension watch build
    .\start.ps1 -All           # Extension + server + dashboard + demo app
    .\start.ps1 -Production    # Build all + start server in production mode
    .\start.ps1 -Stop          # Kill processes on all Vigil ports
    .\start.ps1 -Status        # Check health of all services
    .\start.ps1 -Test          # Run full test suite

    Based on Papyrus start.ps1 patterns, adapted for Vigil multi-service arch.
#>
param(
    [switch]$Stop,
    [switch]$Production,
    [switch]$Test,
    [switch]$Status,
    [switch]$ServerOnly,
    [switch]$ExtOnly,
    [switch]$All,
    [switch]$Build
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Port map (from CLAUDE.md §4) ---
$ServerPort    = 7474   # vigil-server (MCP + REST + dashboard)
$QAPort        = 3847   # QA target app
$DemoPort      = 3900   # Demo app (TaskPilot)
$VitePort      = 5173   # Vite HMR (extension dev)
$AgentsPort    = 8000   # AGENTS FastAPI (external)
$HealthPath    = "/health"

# --- Helpers ---
function Clear-Port([int]$PortNum) {
    $conn = Get-NetTCPConnection -LocalPort $PortNum -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $procId = $conn[0].OwningProcess
        Write-Host "[vigil] Port $PortNum in use by PID $procId - killing..." -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}

function Test-Port([int]$PortNum) {
    return $null -ne (Get-NetTCPConnection -LocalPort $PortNum -State Listen -ErrorAction SilentlyContinue)
}

# --- STOP ---
if ($Stop) {
    Write-Host "[vigil] Stopping all Vigil services..." -ForegroundColor Yellow
    Clear-Port $ServerPort
    Clear-Port $VitePort
    Clear-Port $QAPort
    Clear-Port $DemoPort
    Write-Host "[vigil] All services stopped." -ForegroundColor Green
    return
}

# --- STATUS ---
if ($Status) {
    Write-Host "[vigil] Service Status:" -ForegroundColor Cyan
    Write-Host ""

    $srvUp = Test-Port $ServerPort
    Write-Host "  vigil-server (:$ServerPort):  $(if ($srvUp) { 'UP' } else { 'DOWN' })" -ForegroundColor $(if ($srvUp) { 'Green' } else { 'Red' })
    if ($srvUp) {
        try {
            $h = Invoke-RestMethod "http://localhost:$ServerPort$HealthPath" -TimeoutSec 3
            Write-Host "    Health: $($h.status)" -ForegroundColor Green
        } catch {
            Write-Host "    Health: endpoint unreachable" -ForegroundColor Yellow
        }
    }

    $extUp = Test-Port $VitePort
    Write-Host "  Extension HMR (:$VitePort):   $(if ($extUp) { 'UP' } else { 'DOWN' })" -ForegroundColor $(if ($extUp) { 'Green' } else { 'DarkGray' })

    $qaUp = Test-Port $QAPort
    Write-Host "  QA target app (:$QAPort):    $(if ($qaUp) { 'UP' } else { 'DOWN' })" -ForegroundColor $(if ($qaUp) { 'Green' } else { 'DarkGray' })

    $demoUp = Test-Port $DemoPort
    Write-Host "  Demo app (:$DemoPort):       $(if ($demoUp) { 'UP' } else { 'DOWN' })" -ForegroundColor $(if ($demoUp) { 'Green' } else { 'DarkGray' })

    $agentsUp = Test-Port $AgentsPort
    Write-Host "  AGENTS API (:$AgentsPort):     $(if ($agentsUp) { 'UP (external)' } else { 'DOWN' })" -ForegroundColor $(if ($agentsUp) { 'Green' } else { 'DarkGray' })

    Write-Host ""
    return
}

# --- TEST ---
if ($Test) {
    Write-Host "[vigil] Running full test suite..." -ForegroundColor Green
    Push-Location $ScriptDir
    try {
        Write-Host "[vigil] Type check..." -ForegroundColor Cyan
        & npx tsc --noEmit
        Write-Host "[vigil] Unit + integration tests..." -ForegroundColor Cyan
        & npx vitest run
        Write-Host "[vigil] Lint..." -ForegroundColor Cyan
        & npx eslint src/
        Write-Host "[vigil] All tests passed." -ForegroundColor Green
    } catch {
        Write-Host "[vigil] Tests FAILED: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
    return
}

# --- Pre-flight ---
$npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCmd) { $npmCmd = Get-Command npm -ErrorAction SilentlyContinue }
if (-not $npmCmd) {
    Write-Host "[vigil] ERROR: npm not found. Install Node.js." -ForegroundColor Red
    exit 1
}
$nodeVer = & node --version 2>$null
Write-Host "[vigil] Node: $nodeVer" -ForegroundColor Cyan

# Prevent stale .pyc (Windows mandate from CLAUDE.md)
$env:PYTHONDONTWRITEBYTECODE = "1"

# --- BUILD (production or explicit) ---
if ($Production -or $Build) {
    Write-Host "[vigil] Building all packages..." -ForegroundColor Yellow
    Push-Location $ScriptDir
    try {
        Write-Host "[vigil]   Building shared types..." -ForegroundColor Cyan
        & npm.cmd run build:shared
        Write-Host "[vigil]   Building extension..." -ForegroundColor Cyan
        & npm.cmd run build
        Write-Host "[vigil]   Building server..." -ForegroundColor Cyan
        & npm.cmd run build:server
        Write-Host "[vigil]   Building dashboard..." -ForegroundColor Cyan
        & npm.cmd run build:dashboard
        Write-Host "[vigil] Build complete." -ForegroundColor Green
    } catch {
        Write-Host "[vigil] Build FAILED: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
    if ($Build -and -not $Production) { return }
}

# --- Determine what to start ---
$startServer    = $true
$startExtension = $true
$startQA        = $false
$startDemo      = $false

if ($ServerOnly) { $startExtension = $false }
if ($ExtOnly)    { $startServer = $false }
if ($All) {
    $startQA   = $true
    $startDemo = $true
}

# --- Kill stale processes ---
Write-Host "[vigil] Clearing stale processes..." -ForegroundColor Yellow
if ($startServer)    { Clear-Port $ServerPort }
if ($startExtension) { Clear-Port $VitePort }
if ($startQA)        { Clear-Port $QAPort }
if ($startDemo)      { Clear-Port $DemoPort }
Start-Sleep -Seconds 1

# --- Build stamp ---
$buildStamp = (Get-Date).ToString("yyyy-MM-dd_HH:mm:ss")

# --- Banner ---
Write-Host ""
Write-Host "  ============================================" -ForegroundColor DarkCyan
Write-Host "   Vigil - Bug Discovery & Resolution Platform" -ForegroundColor DarkCyan
Write-Host "  --------------------------------------------" -ForegroundColor DarkCyan
Write-Host "   Build:      $buildStamp" -ForegroundColor DarkCyan
if ($startServer) {
    Write-Host "   Server:     http://localhost:$ServerPort" -ForegroundColor DarkCyan
    Write-Host "   Health:     http://localhost:$ServerPort$HealthPath" -ForegroundColor DarkCyan
    Write-Host "   Dashboard:  http://localhost:$ServerPort/dashboard" -ForegroundColor DarkCyan
}
if ($startExtension) {
    Write-Host "   Extension:  Vite HMR on :$VitePort → load dist/ in Chrome" -ForegroundColor DarkCyan
}
if ($startQA)   { Write-Host "   QA App:     http://localhost:$QAPort" -ForegroundColor DarkCyan }
if ($startDemo) { Write-Host "   Demo App:   http://localhost:$DemoPort" -ForegroundColor DarkCyan }
if ($Production) {
    Write-Host "   Mode:       Production" -ForegroundColor DarkCyan
} else {
    Write-Host "   Mode:       Development (hot-reload)" -ForegroundColor DarkCyan
}
Write-Host "   Press Ctrl+C to stop" -ForegroundColor DarkCyan
Write-Host "  ============================================" -ForegroundColor DarkCyan
Write-Host ""

# --- Start background services ---
Push-Location $ScriptDir

# Background: vigil-server
if ($startServer) {
    Write-Host "[vigil] Starting vigil-server on :$ServerPort..." -ForegroundColor Green
    $serverCmd = if ($Production) { "run build:server" } else { "run dev:server" }
    Start-Process powershell.exe -ArgumentList "-NoProfile -Command `"cd '$ScriptDir'; npm.cmd $serverCmd`"" -NoNewWindow
    Start-Sleep -Seconds 2
}

# Background: QA target app
if ($startQA) {
    $qaPath = Join-Path $ScriptDir "tests\fixtures\target-app"
    if (Test-Path $qaPath) {
        Write-Host "[vigil] Starting QA target app on :$QAPort..." -ForegroundColor Green
        Start-Process powershell.exe -ArgumentList "-NoProfile -Command `"cd '$qaPath'; npm.cmd start`"" -NoNewWindow
    }
}

# Background: Demo app
if ($startDemo) {
    $demoPath = Join-Path $ScriptDir "demos\refine-demo-app"
    if (Test-Path $demoPath) {
        Write-Host "[vigil] Starting demo app on :$DemoPort..." -ForegroundColor Green
        Start-Process powershell.exe -ArgumentList "-NoProfile -Command `"cd '$demoPath'; npm.cmd run dev`"" -NoNewWindow
    }
}

# Background: Health check
$healthScript = Join-Path (Join-Path $ScriptDir "scripts") "health_check.ps1"
if ($startServer -and (Test-Path $healthScript)) {
    $hcArgs = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Port {1} -BuildStamp "{2}"' -f $healthScript, $ServerPort, $buildStamp
    Start-Process powershell.exe -ArgumentList $hcArgs -NoNewWindow
}

# Foreground: Extension watch (blocks terminal — last)
if ($startExtension) {
    Write-Host "[vigil] Starting extension dev build (Vite + CRXJS)..." -ForegroundColor Green
    try {
        & npm.cmd run dev
    } finally {
        Pop-Location
    }
} else {
    Write-Host "[vigil] Server running. Press Ctrl+C to stop." -ForegroundColor Green
    Pop-Location
    # Keep alive
    try { while ($true) { Start-Sleep -Seconds 60 } }
    catch { }
}
