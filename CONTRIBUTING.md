# Contributing

## Prerequisites

- [Bun](https://bun.sh) (see README for install)
- [pre-commit](https://pre-commit.com) — `pip install pre-commit && pre-commit install`

## Local setup

```bash
cd web
bun install
```

## Before committing

Pre-commit hooks run automatically on `git commit`:

- **gitleaks** — secret scanning
- **biome** — lint and format
- **typecheck** — TypeScript strict mode
- **knip** — dead code detection

Run them manually at any time:

```bash
pre-commit run --all-files
```

## Tests

```bash
cd web
bun test tests/
```

Tests live in `web/tests/lib/` and use Bun's built-in test runner. No jsdom, no external test libraries.

All 115 tests must pass. Coverage for `src/lib/` is expected to stay above 90%.

## Pull requests

- Keep PRs focused — one concern per PR.
- Add or update tests for any logic change in `src/lib/`.
- Do not add UI component tests that require a browser runtime.
- Run `bun run check` (typecheck + lint) and `bun test tests/` before pushing.

## Model changes

The risk model lives in `model/`. Changes to `controls.rules.yaml` or `triggers.rules.yaml` should include a corresponding test update in `web/tests/lib/yaml-and-model.test.ts`.

Bump `model/model.manifest.yaml` version (SemVer) when the model changes are user-visible.
