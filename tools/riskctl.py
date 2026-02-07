#!/usr/bin/env python3
import sys
import yaml
from pathlib import Path

MODEL_DIR = Path("model")
QUESTIONS_DIR = MODEL_DIR / "questions"
RULES_DIR = MODEL_DIR / "rules"
CONTROLS_DIR = MODEL_DIR / "controls"

BASE_QUESTIONS_FILE = QUESTIONS_DIR / "base.questions.yaml"
TRIGGERS_FILE = RULES_DIR / "triggers.rules.yaml"
CONTROLS_RULES_FILE = RULES_DIR / "controls.rules.yaml"
CONTROLS_CATALOG_FILE = CONTROLS_DIR / "controls.catalog.yaml"

ALLOWED_ACTIVATION_PHASES = {"design", "pre_go_live", "runtime", "post_go_live"}
ALLOWED_EVIDENCE_TYPES = {"config", "pipeline", "log", "document"}


def deep_get(d, path: str):
    cur = d
    for p in path.split("."):
        if not isinstance(cur, dict) or p not in cur:
            return None
        cur = cur[p]
    return cur


def matches_condition(facts: dict, cond: dict) -> bool:
    """
    Condition keys can be:
      - "base_key"  (shorthand for base.base_key)
      - "namespace.key" (full path)
    Values can be scalars or membership checks when actual is a list.
    """
    for k, expected in cond.items():
        if "." in k:
            actual = deep_get(facts, k)
        else:
            actual = deep_get(facts, f"base.{k}")

        # membership check: actual list contains expected scalar
        if isinstance(actual, list) and not isinstance(expected, list):
            if expected not in actual:
                return False
        else:
            if actual != expected:
                return False
    return True


def load_yaml(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def warn(msg: str):
    print(f"WARN: {msg}", file=sys.stderr)


def validate_controls_catalog(catalog_doc: dict):
    controls = catalog_doc.get("controls", [])
    if not isinstance(controls, list):
        warn("controls catalog: expected 'controls' to be a list")
        return

    for c in controls:
        if not isinstance(c, dict):
            warn("controls catalog: found non-object control entry")
            continue

        cid = c.get("id", "(missing id)")

        phase = c.get("activation_phase")
        if phase is not None and phase not in ALLOWED_ACTIVATION_PHASES:
            warn(
                f"controls catalog: {cid} has unknown activation_phase '{phase}' (allowed: {sorted(ALLOWED_ACTIVATION_PHASES)})"
            )

        evidence = c.get("evidence_type", [])
        if isinstance(evidence, str):
            evidence = [evidence]
        if not isinstance(evidence, list):
            warn(f"controls catalog: {cid} evidence_type should be a list")
            continue

        for e in evidence:
            if e not in ALLOWED_EVIDENCE_TYPES:
                warn(
                    f"controls catalog: {cid} has unknown evidence_type '{e}' (allowed: {sorted(ALLOWED_EVIDENCE_TYPES)})"
                )


def validate_controls_rules(rules_doc: dict, catalog: dict[str, dict]):
    rules = rules_doc.get("rules", [])
    if not isinstance(rules, list):
        warn("controls rules: expected 'rules' to be a list")
        return

    for idx, rule in enumerate(rules, start=1):
        if not isinstance(rule, dict):
            warn(f"controls rules: rule #{idx} is not an object")
            continue

        required = rule.get("require", [])
        if isinstance(required, str):
            required = [required]

        if not isinstance(required, list):
            warn(f"controls rules: rule #{idx} has non-list require")
            continue

        for cid in required:
            if cid not in catalog:
                cond = rule.get("when", {})
                warn(f"controls rules: rule #{idx} references missing control '{cid}' (when: {cond})")


def collect_base_question_ids() -> list[str]:
    doc = load_yaml(BASE_QUESTIONS_FILE)
    return [q["id"] for q in doc.get("questions", [])]


def derive_activated_domains(facts: dict) -> list[str]:
    doc = load_yaml(TRIGGERS_FILE)
    activated = set()

    for t in doc.get("triggers", []):
        cond = t.get("when", {})
        if matches_condition(facts, cond):
            for domain in t.get("activate", []):
                activated.add(domain)

    # stable output order
    return sorted(activated)


def domain_questions_file(domain: str) -> Path:
    return QUESTIONS_DIR / f"{domain}.questions.yaml"


def list_domain_questions(domain: str) -> list[dict]:
    path = domain_questions_file(domain)
    if not path.exists():
        return []
    doc = load_yaml(path)
    return doc.get("questions", [])


def derive_controls(facts: dict) -> tuple[dict, dict]:
    """
    Returns:
      derived: control_id -> list[cond] (why)
      catalog: control_id -> control metadata
    """
    rules_doc = load_yaml(CONTROLS_RULES_FILE)
    catalog_doc = load_yaml(CONTROLS_CATALOG_FILE)

    validate_controls_catalog(catalog_doc)

    catalog = {c["id"]: c for c in catalog_doc.get("controls", [])}
    validate_controls_rules(rules_doc, catalog)
    derived: dict[str, list[dict]] = {}

    for rule in rules_doc.get("rules", []):
        cond = rule.get("when", {})
        if matches_condition(facts, cond):
            for cid in rule.get("require", []):
                derived.setdefault(cid, []).append(cond)

    return derived, catalog


def print_required_questions(base_ids: list[str], activated_domains: list[str], facts: dict):
    print("Required questions (progressive disclosure):")
    print("- base:")
    for qid in base_ids:
        val = deep_get(facts, f"base.{qid}")
        marker = "answered" if val is not None else "missing"
        print(f"  - {qid} ({marker})")

    for domain in activated_domains:
        print(f"- {domain}:")
        questions = list_domain_questions(domain)
        if not questions:
            print("  - (no question file found)")
            continue

        for q in questions:
            qid = q["id"]
            val = deep_get(facts, f"{domain}.{qid}")
            marker = "answered" if val is not None else "missing"
            print(f"  - {domain}.{qid} ({marker})")

    print()


def print_activated_domains(activated_domains: list[str]):
    print("Activated domains:")
    if not activated_domains:
        print("- (none)")
    else:
        for d in activated_domains:
            print(f"- {d} ({domain_questions_file(d)})")
    print()


def print_controls(derived: dict, catalog: dict):
    print("Derived controls:")
    if not derived:
        print("- (none)")
        return

    for cid in sorted(derived.keys()):
        c = catalog.get(cid, {"id": cid, "title": "(missing from catalog)"})
        title = c.get("title", "(no title)")
        scope = c.get("scope", "unknown")
        intent = c.get("enforcement_intent", "unknown")
        phase = c.get("activation_phase", "unknown")
        evidence = c.get("evidence_type", [])

        print(f"- {cid}: {title}")
        print(f"  scope: {scope}")
        print(f"  enforcement_intent: {intent}")
        print(f"  activation_phase: {phase}")
        if evidence:
            print(f"  evidence_type: {evidence}")
        print("  because:")
        for why in derived[cid]:
            print(f"    - when: {why}")
    print()


def main():
    if len(sys.argv) < 3 or sys.argv[1] != "evaluate":
        print("Usage: riskctl.py evaluate <facts.yaml>")
        sys.exit(2)

    facts_path = Path(sys.argv[2])
    if not facts_path.exists():
        print(f"Facts file not found: {facts_path}")
        sys.exit(2)

    facts = load_yaml(facts_path)

    # 1) Base + triggers => activated domains
    base_ids = collect_base_question_ids()
    activated_domains = derive_activated_domains(facts)

    print_activated_domains(activated_domains)
    print_required_questions(base_ids, activated_domains, facts)

    # 2) Controls
    derived, catalog = derive_controls(facts)
    print_controls(derived, catalog)


if __name__ == "__main__":
    main()
