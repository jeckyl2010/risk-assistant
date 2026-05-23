# risk-assistant

[![CI](https://github.com/jeckyl2010/risk-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/jeckyl2010/risk-assistant/actions/workflows/ci.yml)
[![CodeQL](https://github.com/jeckyl2010/risk-assistant/actions/workflows/codeql.yml/badge.svg)](https://github.com/jeckyl2010/risk-assistant/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jeckyl2010/risk-assistant/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jeckyl2010/risk-assistant)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Lightweight, deterministic, facts-based guardrail engine.

```
facts → conditional questions → derived controls
```

The engine is rule-driven and fully explainable. No scoring, no RAG, no workshops, no approval flows.

## How it works

1. You describe a system by answering a set of questions (facts).
2. The engine activates relevant domains based on trigger rules.
3. Control derivation runs directly against the facts, independent of domain activation.
4. The result is a set of derived controls with traceability: what triggered each one, and why.

## Quick start

### Prerequisites

**macOS** — install PowerShell via Homebrew (required for `.ps1` scripts):

```bash
brew install powershell/tap/powershell
```

**Windows** — PowerShell is built-in.

### One-command setup

```powershell
./scripts/setup.ps1
```

Installs Bun and all project dependencies.

### Manual setup

<details>
<summary>Expand manual steps</summary>

1. Install Bun:

   **macOS:**
   ```bash
   brew install oven-sh/bun/bun
   ```

   **Windows:**
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. Install dependencies:
   ```bash
   cd web
   bun install
   ```

</details>

### Run

**Web UI:**
```bash
cd web
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

**CLI:**
```bash
bun riskctl evaluate systems/TestMe.yaml
bun riskctl diff systems/TestMe.yaml --old model-v1 --new model-v2
```

## Deployment

**Production (Podman Compose):**
```powershell
./infrastructure/podman.ps1 up
```

**Development with hot reload:**
```powershell
./infrastructure/podman.ps1 dev
```

See [infrastructure/README.md](infrastructure/README.md) for full setup and troubleshooting.

## Development

**VS Code extensions:**
```powershell
./scripts/install-extensions.ps1
```

Installs Biome (lint/format), Tailwind CSS IntelliSense, and Bun runtime support.

**Code quality:**
```bash
cd web
bun run check      # typecheck + lint
bun run test       # test suite
bunx knip          # dead code detection
```

**Update dependencies:**
```powershell
./scripts/update.ps1
```

## Architecture

**Model layout:**

| Path | Purpose |
|---|---|
| `model/questions/` | Question definitions per domain |
| `model/rules/triggers.rules.yaml` | Domain activation rules |
| `model/rules/controls.rules.yaml` | Control derivation rules |
| `model/controls/` | Control metadata |
| `model/model.manifest.yaml` | Model version (SemVer) |

**Key semantics:**

- Facts are the source of truth. The engine is deterministic and produces the same output for the same input, every time.
- Domain activation (triggers) drives progressive disclosure — which follow-up questions are relevant.
- Control derivation evaluates directly against facts; it is not gated by domain activation.
- Each derived control carries a reason: which fact triggered it and via which rule.

## License

[GNU General Public License v3.0](LICENSE)
