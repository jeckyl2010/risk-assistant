<#
.SYNOPSIS
    Podman Compose management script for Risk Assistant

.DESCRIPTION
    Wrapper script for common Podman Compose operations

.PARAMETER Command
    The operation to perform: build, up, down, dev, logs, shell, clean

.EXAMPLE
    .\infrastructure\podman.ps1 build
    .\infrastructure\podman.ps1 up
    .\infrastructure\podman.ps1 dev
    .\infrastructure\podman.ps1 logs frontend
    .\infrastructure\podman.ps1 shell frontend
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet('build', 'up', 'down', 'dev', 'logs', 'shell', 'clean', 'restart')]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$Target = ""
)

$ErrorActionPreference = "Stop"

# Ensure we're running from project root
$scriptDir = Split-Path -Parent $PSCommandPath
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

function Write-Step {
    param([string]$Message)
    Write-Host "`n→ $Message" -ForegroundColor Cyan
}

function Invoke-PodmanCheck {
    if (-not (Get-Command podman -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Podman not found. Install with: winget install RedHat.Podman" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Get-Command podman-compose -ErrorAction SilentlyContinue)) {
        Write-Host "❌ podman-compose not found. Install with: pip install podman-compose" -ForegroundColor Red
        exit 1
    }
}

Invoke-PodmanCheck

$composeFile = "infrastructure/compose.yaml"
$composeDevFile = "infrastructure/compose.dev.yaml"

switch ($Command) {
    'build' {
        Write-Step "Building containers..."
        if ($Target) {
            podman-compose -f $composeFile build $Target
        } else {
            podman-compose -f $composeFile build
        }
    }
    
    'up' {
        Write-Step "Starting containers in production mode..."
        podman-compose -f $composeFile up -d
        Write-Host "`n✓ Containers started!" -ForegroundColor Green
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Yellow
    }
    
    'down' {
        Write-Step "Stopping containers..."
        podman-compose -f $composeFile down
        Write-Host "✓ Containers stopped" -ForegroundColor Green
    }
    
    'dev' {
        Write-Step "Starting containers in development mode (hot reload)..."
        podman-compose -f $composeFile -f $composeDevFile up
    }
    
    'logs' {
        if ($Target) {
            Write-Step "Showing logs for: $Target"
            podman-compose -f $composeFile logs -f $Target
        } else {
            Write-Step "Showing all logs..."
            podman-compose -f $composeFile logs -f
        }
    }
    
    'shell' {
        if (-not $Target) {
            $Target = 'frontend'
        }
        
        $containerMap = @{
            'frontend' = 'risk-assistant-frontend'
        }
        
        $container = $containerMap[$Target]
        if (-not $container) {
            Write-Host "❌ Invalid target. Use 'frontend'" -ForegroundColor Red
            exit 1
        }
        
        Write-Step "Opening shell in: $container"
        
        podman exec -it $container sh
    }
    
    'restart' {
        Write-Step "Restarting containers..."
        podman-compose -f $composeFile restart $Target
        Write-Host "✓ Containers restarted" -ForegroundColor Green
    }
    
    'clean' {
        Write-Step "Cleaning up containers, volumes, and images..."
        podman-compose -f $composeFile down -v
        podman image prune -f
        podman volume prune -f
        Write-Host "✓ Cleanup complete" -ForegroundColor Green
    }
}
