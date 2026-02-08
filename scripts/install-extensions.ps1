#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Install recommended VS Code extensions for Risk Assistant
.DESCRIPTION
    Installs all recommended VS Code extensions needed for development
#>

$ErrorActionPreference = "Stop"

Write-Host "📦 Installing VS Code Extensions" -ForegroundColor Cyan
Write-Host ""

# Check if 'code' command is available
if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Host "❌ VS Code CLI ('code') not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix this:" -ForegroundColor Yellow
    Write-Host "  1. Open VS Code"
    Write-Host "  2. Press Ctrl+Shift+P"
    Write-Host "  3. Type 'Shell Command: Install code command in PATH'"
    Write-Host "  4. Run this script again"
    Write-Host ""
    exit 1
}

# List of recommended extensions
$extensions = @(
    "biomejs.biome",              # Biome - Linting/Formatting
    "bradlc.vscode-tailwindcss",   # Tailwind CSS IntelliSense
    "oven.bun-vscode"              # Bun Runtime Support
)

$installed = 0
$skipped = 0

foreach ($ext in $extensions) {
    Write-Host "Installing $ext..." -ForegroundColor Gray
    
    # Check if already installed
    $existing = code --list-extensions | Where-Object { $_ -eq $ext }
    
    if ($existing) {
        Write-Host "  ✓ Already installed" -ForegroundColor Green
        $skipped++
    } else {
        code --install-extension $ext --force
        Write-Host "  ✓ Installed" -ForegroundColor Green
        $installed++
    }
}

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host "   Installed: $installed" -ForegroundColor Cyan
Write-Host "   Skipped: $skipped" -ForegroundColor Gray
Write-Host ""
