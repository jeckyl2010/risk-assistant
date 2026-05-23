# Architecture

## How it works

```
facts → conditional questions → derived controls
```

1. Describe a system by answering a set of questions (facts).
2. The engine activates relevant domains based on trigger rules.
3. Control derivation runs directly against the facts — independent of domain activation.
4. Each derived control carries a reason: which fact triggered it and via which rule.

The engine is rule-driven and fully explainable. No scoring, no RAG, no workshops, no approval flows.

## Model layout

| Path | Purpose |
|------|---------|
| `model/questions/` | Question definitions per domain |
| `model/rules/triggers.rules.yaml` | Domain activation rules |
| `model/rules/controls.rules.yaml` | Control derivation rules |
| `model/controls/` | Control metadata |
| `model/model.manifest.yaml` | Model version (SemVer) |

## Key semantics

- **Facts** are the source of truth. Same input always produces the same output.
- **Domain activation** (triggers) drives progressive disclosure — which follow-up questions are relevant.
- **Control derivation** evaluates directly against facts; it is not gated by domain activation.
- **Traceability** — each derived control records which fact triggered it and via which rule.

## Code layout

| Path | Purpose |
|------|---------|
| `web/src/lib/` | Pure engine logic — evaluator, facts, model, storage, yaml parsing |
| `web/src/app/` | Next.js App Router — pages and API routes |
| `web/src/components/` | UI components |
| `web/tests/lib/` | Engine unit tests (Bun test runner) |
| `infrastructure/` | Podman Compose, Dockerfiles |
| `scripts/` | Setup and tooling scripts |

Engine logic in `web/src/lib/` has exactly one implementation. UI components import from there — they never reimplement engine behaviour.
