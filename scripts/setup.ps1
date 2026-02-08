#!/usr/bin/env pwsh
<#
.SYNOPSIS
    One-command setup for Risk Assistant development environment
.DESCRIPTION
    Installs all dependencies:
    - Bun (JavaScript runtime and package manager)
    - Frontend dependencies
#>

$ErrorActionPreference = "Stop"

Write-Host "🚀 Risk Assistant - Setup Script" -ForegroundColor Cyan
Write-Host ""

# Get script directory (repo root)
$RepoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $RepoRoot

# ============================================================================
# 1. Install Bun (JavaScript runtime)
# ============================================================================
Write-Host "📦 Checking Bun (JavaScript runtime)..." -ForegroundColor Yellow

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "   Installing Bun..." -ForegroundColor Gray
    Invoke-RestMethod https://bun.sh/install.ps1 | Invoke-Expression
    
    # Add to PATH for current session
    $env:Path = "$env:USERPROFILE\.bun\bin;$env:Path"
} else {
    Write-Host "   ✓ Bun already installed" -ForegroundColor Green
}

# ============================================================================
# 2. Frontend dependencies
# ============================================================================
Write-Host "⚡ Installing frontend dependencies..." -ForegroundColor Yellow

Set-Location "$RepoRoot\web"
bun install

Write-Host "   ✓ Frontend dependencies installed" -ForegroundColor Green

# ============================================================================
# Done
# ============================================================================
Set-Location $RepoRoot

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run CLI:          bun riskctl evaluate systems/TestMe.yaml"
Write-Host "  2. Run frontend:     cd web; bun run dev"
Write-Host ""
Write-Host "Code quality:" -ForegroundColor Cyan
Write-Host "  Check:      cd web; bun run check"
Write-Host ""
