# Infrastructure

Container orchestration and deployment configuration for Risk Assistant.

## Prerequisites

### Podman Installation

**Windows:**
```powershell
winget install RedHat.Podman
pip install podman-compose
```

**macOS:**
```bash
brew install podman podman-compose
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install podman podman-compose

# Fedora/RHEL
sudo dnf install podman podman-compose
```

### Verify Installation
```powershell
podman --version
podman-compose --version
```

## Usage

### Quick Commands (PowerShell Helper)

Run from project root:
```powershell
# Build containers
.\infrastructure\podman.ps1 build

# Start production
.\infrastructure\podman.ps1 up

# Start development mode
.\infrastructure\podman.ps1 dev

# View logs
.\infrastructure\podman.ps1 logs frontend
.\infrastructure\podman.ps1 logs backend

# Open shell
.\infrastructure\podman.ps1 shell frontend
.\infrastructure\podman.ps1 shell backend

# Stop containers
.\infrastructure\podman.ps1 down

# Clean up everything
.\infrastructure\podman.ps1 clean
```

### Production Build

Build and run the containers:
```powershell
podman-compose -f infrastructure/compose.yaml up -d
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000 (if running standalone)

Stop containers:
```powershell
podman-compose -f infrastructure/compose.yaml down
```

### Development Mode

For hot-reload development with source code bind mounts:
```powershell
podman-compose -f infrastructure/compose.yaml -f infrastructure/compose.dev.yaml up
```

This will:
- Mount source code directories for live editing
- Use development mode for Next.js (hot reload)
- Preserve node_modules from container

### Rebuild Containers

After dependency changes:
```powershell
podman-compose -f infrastructure/compose.yaml build
podman-compose -f infrastructure/compose.yaml up -d
```

Force rebuild without cache:
```powershell
podman-compose -f infrastructure/compose.yaml build --no-cache
```

## Container Structure

### Backend (`risk-assistant-backend`)
- **Base**: Python 3.12-slim
- **Package Manager**: uv (fast Rust-based pip)
- **Code**: `/app/tools/riskctl.py`
- **Volumes**: 
  - `./model` → `/app/model` (read-only)
  - `./systems` → `/app/systems` (read-write)
  - `./tools` → `/app/tools` (read-only in prod, read-write in dev)
- **Port**: 8000

### Frontend (`risk-assistant-frontend`)
- **Base**: oven/bun:1.3.8-slim
- **Framework**: Next.js 16 (standalone output)
- **Build**: Multi-stage (deps → builder → runner)
- **Port**: 3000
- **User**: Non-root (nextjs:nodejs)

## Differences from Docker

Podman is Docker-compatible but has key differences:

1. **No daemon** - Runs containers directly
2. **Rootless by default** - Better security
3. **No licensing issues** - Fully open source (Apache 2.0)
4. **Pod support** - Native Kubernetes pod compatibility

### Podman-Compose vs Docker Compose

```powershell
# Same commands, different tool
docker-compose up    →  podman-compose up
docker build         →  podman build
docker ps            →  podman ps
```

## Troubleshooting

### Port conflicts
If ports 3000 or 8000 are in use:
```yaml
# Edit infrastructure/compose.yaml
ports:
  - "3001:3000"  # Change host port
```

### Volume permission issues
```powershell
# Ensure proper SELinux context (Linux only)
podman-compose -f infrastructure/compose.yaml up --security-opt label=disable
```

### View logs
```powershell
podman-compose -f infrastructure/compose.yaml logs -f frontend
podman-compose -f infrastructure/compose.yaml logs -f backend
```

### Shell into container
```powershell
podman exec -it risk-assistant-frontend sh
podman exec -it risk-assistant-backend bash
```

## CI/CD Integration

Example GitHub Actions workflow:
```yaml
- name: Install Podman
  run: |
    sudo apt-get update
    sudo apt-get -y install podman

- name: Build containers
  run: podman-compose -f infrastructure/compose.yaml build

- name: Run tests
  run: podman-compose -f infrastructure/compose.yaml -f infrastructure/compose.test.yaml up --abort-on-container-exit
```

## File Structure

```
infrastructure/
├── backend.Dockerfile       # Python backend container
├── frontend.Dockerfile      # Next.js frontend container
├── compose.yaml            # Production compose configuration
├── compose.dev.yaml        # Development overrides
├── podman.ps1              # PowerShell helper script
└── README.md               # This file
```

## Next Steps

1. **Add health checks** to compose.yaml for production readiness
2. **Create compose.test.yaml** for running tests in containers
3. **Add Kubernetes manifests** using `podman generate kube`
4. **Set up registry** for pushing images: `podman push`
