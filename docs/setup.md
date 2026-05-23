# Setup

## Prerequisites

### macOS

Install PowerShell (required for `.ps1` scripts):

```bash
brew install powershell/tap/powershell
```

Install Bun:

```bash
brew install oven-sh/bun/bun
```

### Windows

PowerShell is built-in. Install Bun:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

## One-command setup

From the project root:

```powershell
./scripts/setup.ps1
```

Installs Bun and all project dependencies.

## Manual setup

```bash
cd web
bun install
```

## VS Code extensions

```powershell
./scripts/install-extensions.ps1
```

Installs Biome (lint/format), Tailwind CSS IntelliSense, and Bun runtime support.

## Update dependencies

```powershell
./scripts/update.ps1
```
