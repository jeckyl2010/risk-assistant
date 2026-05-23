# risk-assistant

[![CI](https://github.com/jeckyl2010/risk-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/jeckyl2010/risk-assistant/actions/workflows/ci.yml)
[![CodeQL](https://github.com/jeckyl2010/risk-assistant/actions/workflows/codeql.yml/badge.svg)](https://github.com/jeckyl2010/risk-assistant/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/jeckyl2010/risk-assistant/graph/badge.svg)](https://codecov.io/gh/jeckyl2010/risk-assistant)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jeckyl2010/risk-assistant/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jeckyl2010/risk-assistant)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/runtime-Bun-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![code style: Biome](https://img.shields.io/badge/code%20style-Biome-60a5fa.svg)](https://biomejs.dev)
[![Last commit](https://img.shields.io/github/last-commit/jeckyl2010/risk-assistant)](https://github.com/jeckyl2010/risk-assistant/commits/main)

A lightweight, deterministic guardrail engine for software systems. Describe a system, get a derived set of controls — with full traceability. No scoring, no RAG, no approval flows.

```
facts → conditional questions → derived controls
```

---

## Quick start

```bash
./scripts/setup.ps1     # install Bun and dependencies (macOS/Windows)
cd web && bun run dev   # start the web UI at http://localhost:3000
```

**CLI:**

```bash
bun riskctl evaluate systems/TestMe.yaml
bun riskctl diff systems/TestMe.yaml --old model-v1 --new model-v2
```

---

## Documentation

| | |
|---|---|
| [docs/setup.md](docs/setup.md) | Full install, manual setup, VS Code extensions |
| [docs/architecture.md](docs/architecture.md) | Engine design, model layout, code structure |
| [docs/deployment.md](docs/deployment.md) | Podman Compose, container reference, troubleshooting |
| [docs/development.md](docs/development.md) | Tests, quality gates, model changes |

---

## Architecture

The engine evaluates a set of YAML fact files against a rule-driven model. Trigger rules activate domains (progressive disclosure). Control derivation runs directly against facts — not gated by domain activation. Every derived control carries a reason.

See [docs/architecture.md](docs/architecture.md) for detail.

---

## Development

```bash
cd web
bun run check      # typecheck + lint
bun run test       # 115 tests, >90% coverage on lib/
bunx knip          # dead code
```

See [docs/development.md](docs/development.md) for the full quality gate setup.

---

## License

[GNU General Public License v3.0](LICENSE)
