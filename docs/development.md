# Development

## Test suite

```bash
cd web
bun test tests/
```

Tests live in `web/tests/lib/` and use Bun's built-in test runner. No jsdom, no external test libraries.

115 tests, 203 assertions. Coverage for `src/lib/` is expected to stay above 90%.

## Quality gates

```bash
cd web
bun run check      # typecheck + lint (Biome)
bun run test       # test suite
bunx knip          # dead code detection
```

All four pre-commit hooks run automatically on `git commit`:
- **gitleaks** — secret scanning
- **biome** — lint and format
- **typecheck** — TypeScript strict mode
- **knip** — dead code detection

Run manually:

```bash
pre-commit run --all-files
```

## Model changes

Model files live in `model/`. Changes to `controls.rules.yaml` or `triggers.rules.yaml` should include a corresponding test update in `web/tests/lib/yaml-and-model.test.ts`.

Bump `model/model.manifest.yaml` (SemVer) when changes are user-visible.

## Adding a new domain

1. Add question definitions in `model/questions/<domain>.yaml`.
2. Add trigger rules in `model/rules/triggers.rules.yaml`.
3. Add control rules in `model/rules/controls.rules.yaml` if applicable.
4. Add control metadata in `model/controls/`.
5. Update `yaml-and-model.test.ts` to cover the new rules.
6. Bump model version.
