# GitHub Copilot Instructions for Risk Assistant

## Communication Style

**Be direct and honest.** The maintainer prefers straightforward feedback without corporate politeness or sugar-coating. Danish communication style: challenge assumptions when needed, don't hold back criticism if something is wrong or could be better.

- If code is bad, say it's bad and explain why
- If a design choice is questionable, challenge it
- If there's a better approach, suggest it directly
- No need to soften feedback with "maybe" or "perhaps" unless genuinely uncertain
- Prefer terse, action-oriented responses over verbose explanations (unless complexity demands it)

## Project Context

**Risk Assistant** is a risk-informed architecture guardrail tool for manufacturing and enterprise IT systems. It's a "guardrail, not a gate" — designed to surface risks through questions and controls, not to block progress.

### Core Philosophy
- **Deterministic, not probabilistic**: No risk scores or metrics
- **Facts-based**: Derived from system architecture answers
- **Question-driven**: System owners answer domain-specific questions
- **Control derivation**: Rules trigger specific controls based on answers
- **Evidence-focused**: Controls require verification

### Architecture
- **Model**: Question catalog, control catalog, trigger rules (YAML-based)
- **Backend**: Python FastAPI (`tools/riskctl.py`) for evaluation engine
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **Storage**: File-based (YAML) for systems and model definitions

### Domain Categories
Security, Data, Operations, Integration, Cost, Criticality, AI (emerging technologies)

## Tech Stack Specifics

### Frontend
- **Runtime**: Bun (fast JavaScript runtime and package manager)
- **Next.js**: App Router with React Server Components
- **TypeScript**: Strict mode, prefer type safety
- **Styling**: Tailwind CSS v4, indigo/purple gradient theme, Geist Sans + Geist Mono fonts
- **Components**: Portal-based tooltips, client-side state management
- **Build**: Turbopack for dev, standard Next.js build for production
- **Linting/Formatting**: Biome (Rust-based, replaces ESLint + Prettier)

### Backend
- **Python**: FastAPI for evaluation engine
- **Package Manager**: uv (fast Rust-based pip replacement)
- **Linting/Formatting**: Ruff (Rust-based, replaces Flake8/Black/isort)
- **Environment**: All Python tools installed in `.venv` virtual environment

### Containerization
- **Runtime**: Podman (Docker-compatible, no licensing issues)
- **Location**: `infrastructure/` directory for all container files
- **Compose**: `compose.yaml` for production, `compose.dev.yaml` for development
- **Images**: Multi-stage builds (Python 3.12-slim for backend, Bun 1.3.8-slim for frontend)
- **Helper**: `infrastructure/podman.ps1` for common operations (build, up, dev, logs, shell, clean)
- **Philosophy**: Podman over Docker Desktop (Apache 2.0 license, rootless by default)

## Code Preferences

- Use TypeScript strictly (no `any` unless absolutely necessary)
- Prefer server components unless interactivity requires `"use client"`
- Keep components focused and single-purpose
- Use Tailwind utilities over custom CSS
- Follow established typography hierarchy (text-5xl → text-3xl → text-2xl → text-xl → text-lg → base)

## File Organization & Structure

**Critical: The maintainer values clean, structured file organization.**

- **Never dump files in the root directory** - Use proper subdirectories for logical grouping
- **Think before creating** - Plan file placement based on purpose and category
- **Use established patterns**:
  - Infrastructure files → `infrastructure/`
  - Tooling/scripts → Keep in root only if frequently executed (e.g., `setup.ps1`)
  - Configuration → Root for project-wide (e.g., `pyproject.toml`), subdirs for scoped config
  - Documentation → Root for primary docs (README.md), subdirs for detailed topics
- **Group related files together** - Don't scatter Dockerfiles, compose files, and related configs across multiple locations
- **Clean naming conventions** - Use descriptive, consistent names (e.g., `backend.Dockerfile` not just `Dockerfile`)

**Examples of proper structure:**
- ✅ `infrastructure/compose.yaml`, `infrastructure/backend.Dockerfile`, `infrastructure/README.md`
- ❌ `Dockerfile.backend`, `compose.yaml`, `PODMAN.md` scattered in root
- ✅ `web/biome.json` (scoped to frontend)
- ❌ `biome.json` in root when it only applies to web/

**When adding new files:**
1. Identify the logical category (infrastructure, tooling, config, docs, code)
2. Check if a directory exists for that category
3. Create a proper directory structure if needed
4. Place files in the appropriate location
5. Never default to "just put it in root"

This isn't about over-engineering - it's about respecting the maintainer's workspace and keeping the project navigable.

## Automation Preferences

- **Automate repetitive tasks** — write scripts instead of documenting manual steps
- **One command per task** — setup, update, install should each be a single script
- **PowerShell for tooling** — project uses `.ps1` scripts for cross-platform Windows/Linux/Mac support
- **Hide complexity** — manual steps go in collapsible sections, automation goes first

## When Making Suggestions

- Assume the maintainer knows what they're doing, but might miss edge cases
- Focus on concrete improvements with rationale
- If multiple approaches exist, recommend one and briefly explain tradeoffs
- Don't ask permission for obvious improvements — just do them
