#!/usr/bin/env pwsh
<#
.SYNOPSIS
    One-command setup for Risk Assistant development environment
.DESCRIPTION
    Installs all dependencies for both frontend and backend:
    - uv (Python package manager)
    - Bun (JavaScript runtime)
    - Python virtual environment with all dependencies
    - Frontend Node modules
#>

$ErrorActionPreference = "Stop"

Write-Host "🚀 Risk Assistant - Setup Script" -ForegroundColor Cyan
Write-Host ""

# Get script directory (repo root)
$RepoRoot = $PSScriptRoot
Set-Location $RepoRoot

# ============================================================================
# 1. Install uv (Python package manager)
# ============================================================================
Write-Host "📦 Checking uv (Python package manager)..." -ForegroundColor Yellow

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "   Installing uv..." -ForegroundColor Gray
    Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    
    # Add to PATH for current session
    $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
} else {
    Write-Host "   ✓ uv already installed" -ForegroundColor Green
}

# ============================================================================
# 2. Install Bun (JavaScript runtime)
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
# 3. Python virtual environment + dependencies
# ============================================================================
Write-Host "🐍 Setting up Python environment..." -ForegroundColor Yellow

if (-not (Test-Path ".venv")) {
    Write-Host "   Creating virtual environment..." -ForegroundColor Gray
    python -m venv .venv
}

# Activate venv
& "$RepoRoot\.venv\Scripts\Activate.ps1"

Write-Host "   Installing Python dependencies..." -ForegroundColor Gray
uv pip install -r requirements.txt
uv pip install -r requirements-dev.txt

Write-Host "   ✓ Python environment ready" -ForegroundColor Green

# ============================================================================
# 4. Frontend dependencies
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
Write-Host "  1. Activate Python venv:  .\.venv\Scripts\Activate.ps1"
Write-Host "  2. Run backend:           python tools\riskctl.py evaluate examples\system.example.yaml"
Write-Host "  3. Run frontend:          cd web; bun run dev"
Write-Host ""
Write-Host "Code quality:" -ForegroundColor Cyan
Write-Host "  Python:     ruff check . --fix && ruff format ."
Write-Host "  Frontend:   cd web; bun run check"
Write-Host ""
