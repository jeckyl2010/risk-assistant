#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Update all dependencies for Risk Assistant
.DESCRIPTION
    Updates Python and frontend dependencies to latest versions
#>

$ErrorActionPreference = "Stop"

Write-Host "🔄 Risk Assistant - Update Dependencies" -ForegroundColor Cyan
Write-Host ""

# Get script directory (repo root)
$RepoRoot = $PSScriptRoot
Set-Location $RepoRoot

# ============================================================================
# 1. Update Python dependencies
# ============================================================================
Write-Host "🐍 Updating Python dependencies..." -ForegroundColor Yellow

# Activate venv
& "$RepoRoot\.venv\Scripts\Activate.ps1"

uv pip install --upgrade -r requirements.txt
uv pip install --upgrade -r requirements-dev.txt

Write-Host "   ✓ Python dependencies updated" -ForegroundColor Green

# ============================================================================
# 2. Update frontend dependencies
# ============================================================================
Write-Host "⚡ Updating frontend dependencies..." -ForegroundColor Yellow

Set-Location "$RepoRoot\web"
bun update

Write-Host "   ✓ Frontend dependencies updated" -ForegroundColor Green

# ============================================================================
# Done
# ============================================================================
Set-Location $RepoRoot

Write-Host ""
Write-Host "✅ All dependencies updated!" -ForegroundColor Green
Write-Host ""
