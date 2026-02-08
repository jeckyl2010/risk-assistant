#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Update all dependencies for Risk Assistant
.DESCRIPTION
    Updates frontend dependencies to latest versions
#>

$ErrorActionPreference = "Stop"

Write-Host "🔄 Risk Assistant - Update Dependencies" -ForegroundColor Cyan
Write-Host ""

# Get script directory (repo root)
$RepoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $RepoRoot

# ============================================================================
# 1. Update frontend dependencies
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
