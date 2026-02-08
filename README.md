# risk-assistant

Lightweight, deterministic, facts-based "guardrail" engine:
facts -> (conditional questions) -> derived controls.

Non-goals: scoring, RAG, workshops, approvals.

## Quick Start

### One-Command Setup

```powershell
.\setup.ps1
```

This installs everything: uv, Bun, Python dependencies, and frontend packages.

### Manual Setup

<details>
<summary>Click to expand manual installation steps</summary>

#### Backend (Python)

1. Install uv (fast Python package manager):
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. Create virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Linux/Mac
   
   # Install all dependencies
   uv pip install -r requirements.txt
   uv pip install -r requirements-dev.txt
   ```

#### Frontend (Web)

1. Install Bun:
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. Install dependencies:
   ```bash
   cd web
   bun install
   ```

</details>

### Run the Application

**Backend:**
```bash
.venv\Scripts\activate
python tools/riskctl.py evaluate examples/system.example.yaml
```

**Frontend:**
```bash
cd web
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Podman / Docker Deployment

**Production deployment with Podman Compose:**
```powershell
.\infrastructure\podman.ps1 up
```

**Development mode with hot reload:**
```powershell
.\infrastructure\podman.ps1 dev
```

See [infrastructure/README.md](infrastructure/README.md) for complete Podman setup, troubleshooting, and CI/CD integration.

## VS Code Setup

**Install recommended extensions:**
```powershell
.\install-extensions.ps1
```

This installs:
- **Biome** - Frontend linting/formatting
- **Ruff** - Python linting/formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete and IntelliSense
- **Bun** - Bun runtime support

Alternatively, VS Code will prompt you to install recommended extensions when you open the workspace.

## Maintenance

**Update all dependencies:**
```powershell
.\update.ps1
```

**Code quality:**
```bash
# Python (with venv activated)
ruff check . --fix && ruff format .

# Frontend
cd web
bun run check
```

## Architecture

**Outputs:**
- Derived controls
- Why each control was triggered
- Enforcement intent metadata (automatic vs procedural)

**Semantics:**
- Facts are the source of truth; the engine is deterministic and explainable.
- Domain activation (via `model/rules/triggers.rules.yaml`) is used for progressive disclosure of questions (what follow-ups are relevant).
- Control derivation (via `model/rules/controls.rules.yaml`) evaluates directly against the facts provided; it is not gated by whether a domain was activated.

**Validation:**
- `riskctl.py` emits warning-only diagnostics (stderr) to catch model drift and input mistakes early.
- It validates facts against the question schemas (types + allowed values) and warns on unknown keys that would otherwise silently not match any rules.
- It also warns if rules reference control IDs missing from the control catalog, or if the control catalog contains unknown metadata values.

**Versioning:**
- The model uses SemVer via `model/model.manifest.yaml` (`model_version`).
- Individual YAML files under `model/questions`, `model/rules`, and `model/controls` use `schema_version` to describe file format (not release SemVer).
