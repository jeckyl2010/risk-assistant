# risk-assistant

Lightweight, deterministic, facts-based “guardrail” engine:
facts -> (conditional questions) -> derived controls.

Non-goals: scoring, RAG, workshops, approvals.

## Quick start
1) Put your facts in `examples/*.yaml`
2) Run:
   python tools/riskctl.py evaluate examples/system.example.yaml

Outputs:
- derived controls
- why each control was triggered
- enforcement intent metadata (automatic vs procedural)
