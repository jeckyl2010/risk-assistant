# risk-assistant

Lightweight, deterministic, facts-based “guardrail” engine:
facts -> (conditional questions) -> derived controls.

Non-goals: scoring, RAG, workshops, approvals.

## Quick Start

### Backend (Python)

1. Install uv (fast Python package manager):
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. Create virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Linux/Mac
   
   # Install runtime dependencies
   uv pip install -r requirements.txt
   
   # Install development tools (Ruff)
   uv pip install -r requirements-dev.txt
   ```

3. Run the evaluation engine:
   ```bash
   python tools/riskctl.py evaluate examples/system.example.yaml
   ```

### Frontend (Web)

See [web/README.md](web/README.md) for Next.js frontend setup.

### Code Quality

- **Python**: Use Ruff for linting and formatting (with venv activated)
  ```bash
  ruff check .        # Lint
  ruff format .       # Format
  ruff check . --fix  # Auto-fix issues
  ```

- **TypeScript/React**: Use Biome (see web/ directory)
  ```bash
  cd web
  bun run lint        # Lint
  bun run format      # Format
  bun run check       # Lint + format with auto-fix
  ```

Outputs:
- derived controls
- why each control was triggered
- enforcement intent metadata (automatic vs procedural)

## Semantics
- Facts are the source of truth; the engine is deterministic and explainable.
- Domain activation (via `model/rules/triggers.rules.yaml`) is used for progressive disclosure of questions (what follow-ups are relevant).
- Control derivation (via `model/rules/controls.rules.yaml`) evaluates directly against the facts provided; it is not gated by whether a domain was activated.

## Validation
- `riskctl.py` emits warning-only diagnostics (stderr) to catch model drift and input mistakes early.
- It validates facts against the question schemas (types + allowed values) and warns on unknown keys that would otherwise silently not match any rules.
- It also warns if rules reference control IDs missing from the control catalog, or if the control catalog contains unknown metadata values.

## Versioning
- The model uses SemVer via `model/model.manifest.yaml` (`model_version`).
- Individual YAML files under `model/questions`, `model/rules`, and `model/controls` use `schema_version` to describe file format (not release SemVer).
