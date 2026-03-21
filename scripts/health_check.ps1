<#
.SYNOPSIS
    Vigil health check (background, called by start.ps1)
#>
param(
    [int]$Port = 7474,
    [string]$BuildStamp = "",
    [string]$HealthPath = "/health"
)

Start-Sleep -Seconds 8

for ($i = 1; $i -le 5; $i++) {
    try {
        $r = Invoke-RestMethod "http://localhost:$Port$HealthPath" -TimeoutSec 3
        if ($r.status -eq "ok" -or $r.status -eq "healthy") {
            Write-Host ""
            Write-Host "  [HEALTH] vigil-server OK - Status=$($r.status), Build=$BuildStamp" -ForegroundColor Green
            Write-Host ""
            return
        }
    } catch {}
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "  [HEALTH] WARNING - vigil-server health check did not pass within 23s" -ForegroundColor Yellow
Write-Host "           Check: http://localhost:$Port$HealthPath" -ForegroundColor Yellow
Write-Host ""
