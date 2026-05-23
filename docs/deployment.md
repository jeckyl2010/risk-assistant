# Deployment

Container orchestration via Podman Compose. Podman is Docker-compatible, rootless by default, and fully open source (Apache 2.0).

## Prerequisites

**Windows:**
```powershell
winget install RedHat.Podman
```

**macOS:**
```bash
brew install podman podman-compose
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install podman podman-compose
```

## Quick commands

Run from project root using the PowerShell helper:

```powershell
./infrastructure/podman.ps1 build    # build containers
./infrastructure/podman.ps1 up       # start production
./infrastructure/podman.ps1 dev      # start with hot reload
./infrastructure/podman.ps1 logs frontend
./infrastructure/podman.ps1 shell frontend
./infrastructure/podman.ps1 down
./infrastructure/podman.ps1 clean
```

## Production

```powershell
podman-compose -f infrastructure/compose.yaml up -d
```

Access: http://localhost:3000

## Development (hot reload)

```powershell
podman-compose -f infrastructure/compose.yaml -f infrastructure/compose.dev.yaml up
```

Mounts source directories for live editing. Next.js hot reload enabled.

## After dependency changes

```powershell
podman-compose -f infrastructure/compose.yaml build
podman-compose -f infrastructure/compose.yaml up -d
```

Force rebuild without cache:

```powershell
podman-compose -f infrastructure/compose.yaml build --no-cache
```

## Container structure

**`risk-assistant-frontend`**
- Base: `oven/bun:1.3.8-slim`
- Framework: Next.js 16 (standalone output)
- Build: multi-stage (deps → builder → runner)
- Port: 3000
- User: non-root (`nextjs:nodejs`)

## Troubleshooting

**Port conflict:** edit `infrastructure/compose.yaml` and change the host port, e.g. `3001:3000`.

**View logs:**
```powershell
podman-compose -f infrastructure/compose.yaml logs -f frontend
```

**Shell into container:**
```powershell
podman exec -it risk-assistant-frontend sh
```

**Volume permission issues (Linux):**
```powershell
podman-compose -f infrastructure/compose.yaml up --security-opt label=disable
```
