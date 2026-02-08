# risk-assistant

Lightweight, deterministic, facts-based "guardrail" engine:
facts -> (conditional questions) -> derived controls.

Non-goals: scoring, RAG, workshops, approvals.

## Quick Start

### One-Command Setup

```powershell
.\scripts\setup.ps1
```

This installs Bun and all project dependencies.

### Manual Setup

<details>
<summary>Click to expand manual installation steps</summary>

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

**CLI:**
```bash
bun riskctl evaluate systems/TestMe.yaml
bun riskctl diff systems/TestMe.yaml --old model-v1 --new model-v2
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
.\scripts\install-extensions.ps1
```

This installs:
- **Biome** - Linting and formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete and IntelliSense
- **Bun** - Bun runtime support

Alternatively, VS Code will prompt you to install recommended extensions when you open the workspace.

## Maintenance

**Update all dependencies:**
```powershell
.\scripts\update.ps1
```

**Code quality:**
```bash
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
- The CLI tool (`tools/riskctl.ts`) provides evaluation and diff capabilities.
- The evaluation logic validates facts against question schemas and triggers, deriving applicable controls.

**Versioning:**
- The model uses SemVer via `model/model.manifest.yaml` (`model_version`).
- Individual YAML files under `model/questions`, `model/rules`, and `model/controls` use `schema_version` to describe file format (not release SemVer).
