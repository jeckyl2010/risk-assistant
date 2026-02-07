#!/usr/bin/env python3
import sys
import argparse
import yaml
from pathlib import Path

DEFAULT_MODEL_DIR = Path("model")
MODEL_MANIFEST_CANDIDATES = ("model.manifest.yaml", "manifest.yaml")
MODEL_COMPONENT_DIRS = ("questions", "rules", "controls")

ALLOWED_ACTIVATION_PHASES = {"design", "pre_go_live", "runtime", "post_go_live"}
ALLOWED_EVIDENCE_TYPES = {"config", "pipeline", "log", "document"}
ALLOWED_QUESTION_TYPES = {"bool", "enum", "set"}


def model_paths(model_dir: Path) -> dict[str, Path]:
    questions_dir = model_dir / "questions"
    rules_dir = model_dir / "rules"
    controls_dir = model_dir / "controls"

    return {
        "model_dir": model_dir,
        "questions_dir": questions_dir,
        "rules_dir": rules_dir,
        "controls_dir": controls_dir,
        "base_questions_file": questions_dir / "base.questions.yaml",
        "triggers_file": rules_dir / "triggers.rules.yaml",
        "controls_rules_file": rules_dir / "controls.rules.yaml",
        "controls_catalog_file": controls_dir / "controls.catalog.yaml",
    }


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


def info(msg: str):
    print(msg)


def read_model_manifest(model_dir: Path) -> dict:
    for name in MODEL_MANIFEST_CANDIDATES:
        p = model_dir / name
        if p.exists():
            doc = load_yaml(p)
            if not isinstance(doc, dict):
                warn(f"model manifest: expected object in {p}")
                return {}
            return doc
    return {}


def get_model_version(model_dir: Path) -> str:
    manifest = read_model_manifest(model_dir)
    v = manifest.get("model_version")
    if isinstance(v, str) and v.strip():
        return v.strip()
    return "(unknown)"


def validate_model_component_headers(model_dir: Path):
    """Validate that model component YAMLs use schema_version (not version).

    This is intentionally warning-only to keep the tool lightweight and non-blocking.
    """
    for dirname in MODEL_COMPONENT_DIRS:
        d = model_dir / dirname
        if not d.exists() or not d.is_dir():
            continue

        for p in sorted(d.glob("*.yaml")):
            try:
                doc = load_yaml(p)
            except Exception as e:
                warn(f"model: failed to parse {p}: {e}")
                continue

            if not isinstance(doc, dict):
                warn(f"model: expected YAML object in {p}")
                continue

            if "version" in doc:
                warn(f"model: {p} uses 'version' header; use 'schema_version' to avoid confusion with model SemVer")

            if "schema_version" not in doc:
                warn(f"model: {p} missing required 'schema_version' header")
            else:
                sv = doc.get("schema_version")
                if not isinstance(sv, (int, float, str)):
                    warn(f"model: {p} schema_version should be number or string")


def load_questions_index(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    doc = load_yaml(path)
    questions = doc.get("questions", [])
    if not isinstance(questions, list):
        warn(f"questions schema: expected 'questions' list in {path}")
        return {}

    index: dict[str, dict] = {}
    for q in questions:
        if not isinstance(q, dict):
            warn(f"questions schema: found non-object question in {path}")
            continue
        qid = q.get("id")
        if not qid:
            warn(f"questions schema: question missing id in {path}")
            continue
        index[qid] = q
    return index


def domain_name_from_questions_file(path: Path) -> str | None:
    name = path.name
    suffix = ".questions.yaml"
    if not name.endswith(suffix):
        return None
    domain = name[: -len(suffix)]
    return domain or None


def list_available_domain_question_files(questions_dir: Path, base_questions_file: Path) -> dict[str, Path]:
    out: dict[str, Path] = {}
    if not questions_dir.exists():
        return out

    for p in questions_dir.iterdir():
        if not p.is_file():
            continue
        if p.name == base_questions_file.name:
            continue
        domain = domain_name_from_questions_file(p)
        if not domain:
            continue
        out[domain] = p
    return out


def validate_value(scope: str, qid: str, q: dict, value):
    qtype = q.get("type")
    if qtype not in ALLOWED_QUESTION_TYPES:
        warn(f"questions schema: {scope}.{qid} has unknown type '{qtype}'")
        return

    if qtype == "bool":
        if not isinstance(value, bool):
            warn(f"facts: {scope}.{qid} should be bool, got {type(value).__name__}")
        return

    allowed = q.get("allowed", [])
    if qtype == "enum":
        if not isinstance(value, str):
            warn(f"facts: {scope}.{qid} should be string enum, got {type(value).__name__}")
            return
        if allowed and value not in allowed:
            warn(f"facts: {scope}.{qid} has invalid value '{value}' (allowed: {allowed})")
        return

    # set
    if not isinstance(value, list):
        warn(f"facts: {scope}.{qid} should be a list (set), got {type(value).__name__}")
        return
    if allowed:
        for item in value:
            if item not in allowed:
                warn(f"facts: {scope}.{qid} contains invalid item '{item}' (allowed: {allowed})")


def validate_scope_facts(scope: str, facts_section, questions_index: dict[str, dict]):
    if facts_section is None:
        return
    if not isinstance(facts_section, dict):
        warn(f"facts: '{scope}' section should be an object")
        return

    # warn for unknown keys to avoid silent non-matches
    for k in facts_section.keys():
        if k not in questions_index:
            warn(f"facts: unknown key {scope}.{k} (no matching question id)")

    for qid, q in questions_index.items():
        if qid not in facts_section:
            continue
        value = facts_section.get(qid)
        if value is None:
            continue
        validate_value(scope, qid, q, value)


def validate_facts_against_schemas(
    facts: dict,
    activated_domains: list[str],
    *,
    questions_dir: Path,
    base_questions_file: Path,
):
    if not isinstance(facts, dict):
        warn("facts: root should be an object")
        return

    base_index = load_questions_index(base_questions_file)
    validate_scope_facts("base", facts.get("base"), base_index)

    available_domains = list_available_domain_question_files(questions_dir, base_questions_file)
    # Validate any domain sections that are present in the facts file
    for domain, path in sorted(available_domains.items()):
        if domain in facts:
            index = load_questions_index(path)
            validate_scope_facts(domain, facts.get(domain), index)

    # If a domain is activated but entirely missing, warn (helps catch structure mistakes)
    for domain in activated_domains:
        if domain not in facts:
            warn(f"facts: activated domain '{domain}' is missing its section")


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


def collect_base_question_ids(base_questions_file: Path) -> list[str]:
    doc = load_yaml(base_questions_file)
    return [q["id"] for q in doc.get("questions", [])]


def derive_activated_domains(facts: dict, triggers_file: Path) -> list[str]:
    doc = load_yaml(triggers_file)
    activated = set()

    for t in doc.get("triggers", []):
        cond = t.get("when", {})
        if matches_condition(facts, cond):
            for domain in t.get("activate", []):
                activated.add(domain)

    # stable output order
    return sorted(activated)


def domain_questions_file(questions_dir: Path, domain: str) -> Path:
    return questions_dir / f"{domain}.questions.yaml"


def list_domain_questions(questions_dir: Path, domain: str) -> list[dict]:
    path = domain_questions_file(questions_dir, domain)
    if not path.exists():
        return []
    doc = load_yaml(path)
    return doc.get("questions", [])


def derive_controls(facts: dict, *, controls_rules_file: Path, controls_catalog_file: Path) -> tuple[dict, dict]:
    """
    Returns:
      derived: control_id -> list[cond] (why)
      catalog: control_id -> control metadata
    """
    rules_doc = load_yaml(controls_rules_file)
    catalog_doc = load_yaml(controls_catalog_file)

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


def print_required_questions(base_ids: list[str], activated_domains: list[str], facts: dict, *, questions_dir: Path):
    print("Required questions (progressive disclosure):")
    print("- base:")
    for qid in base_ids:
        val = deep_get(facts, f"base.{qid}")
        marker = "answered" if val is not None else "missing"
        print(f"  - {qid} ({marker})")

    for domain in activated_domains:
        print(f"- {domain}:")
        questions = list_domain_questions(questions_dir, domain)
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
            print(f"- {d}")
    print()


def print_activated_domains_with_paths(activated_domains: list[str], questions_dir: Path):
    print("Activated domains:")
    if not activated_domains:
        print("- (none)")
    else:
        for d in activated_domains:
            print(f"- {d} ({domain_questions_file(questions_dir, d)})")
    print()


def required_question_ids(base_questions_file: Path, questions_dir: Path, activated_domains: list[str]) -> list[str]:
    base = load_yaml(base_questions_file)
    base_ids = [q["id"] for q in base.get("questions", [])]
    out = [f"base.{qid}" for qid in base_ids]

    for domain in activated_domains:
        for q in list_domain_questions(questions_dir, domain):
            out.append(f"{domain}.{q['id']}")
    return out


def missing_required_questions(required: list[str], facts: dict) -> list[str]:
    missing: list[str] = []
    for qpath in required:
        val = deep_get(facts, qpath)
        if val is None:
            missing.append(qpath)
    return missing


def evaluate(facts_path: Path, model_dir: Path):
    if not facts_path.exists():
        print(f"Facts file not found: {facts_path}")
        return 2

    facts = load_yaml(facts_path)
    if not isinstance(facts, dict):
        print("Facts file must be a YAML object at the root")
        return 2

    paths = model_paths(model_dir)
    model_version = get_model_version(model_dir)
    info(f"Model version: {model_version}")

    validate_model_component_headers(model_dir)

    pinned = facts.get("model_version")
    if isinstance(pinned, str) and pinned.strip() and pinned.strip() != model_version:
        warn(f"facts: model_version '{pinned.strip()}' does not match loaded model '{model_version}'")

    # 1) Base + triggers => activated domains
    base_ids = collect_base_question_ids(paths["base_questions_file"])
    activated_domains = derive_activated_domains(facts, paths["triggers_file"])

    validate_facts_against_schemas(
        facts,
        activated_domains,
        questions_dir=paths["questions_dir"],
        base_questions_file=paths["base_questions_file"],
    )

    print_activated_domains_with_paths(activated_domains, paths["questions_dir"])
    print_required_questions(base_ids, activated_domains, facts, questions_dir=paths["questions_dir"])

    # 2) Controls
    derived, catalog = derive_controls(
        facts,
        controls_rules_file=paths["controls_rules_file"],
        controls_catalog_file=paths["controls_catalog_file"],
    )
    print_controls(derived, catalog)
    return 0


def diff_models(facts_path: Path, old_model_dir: Path, new_model_dir: Path):
    if not facts_path.exists():
        print(f"Facts file not found: {facts_path}")
        return 2

    facts = load_yaml(facts_path)
    if not isinstance(facts, dict):
        print("Facts file must be a YAML object at the root")
        return 2

    old_paths = model_paths(old_model_dir)
    new_paths = model_paths(new_model_dir)
    old_version = get_model_version(old_model_dir)
    new_version = get_model_version(new_model_dir)

    validate_model_component_headers(old_model_dir)
    validate_model_component_headers(new_model_dir)

    old_domains = derive_activated_domains(facts, old_paths["triggers_file"])
    new_domains = derive_activated_domains(facts, new_paths["triggers_file"])

    old_required = required_question_ids(old_paths["base_questions_file"], old_paths["questions_dir"], old_domains)
    new_required = required_question_ids(new_paths["base_questions_file"], new_paths["questions_dir"], new_domains)

    old_missing = set(missing_required_questions(old_required, facts))
    new_missing = set(missing_required_questions(new_required, facts))

    old_derived, _old_catalog = derive_controls(
        facts,
        controls_rules_file=old_paths["controls_rules_file"],
        controls_catalog_file=old_paths["controls_catalog_file"],
    )
    new_derived, _new_catalog = derive_controls(
        facts,
        controls_rules_file=new_paths["controls_rules_file"],
        controls_catalog_file=new_paths["controls_catalog_file"],
    )

    old_controls = set(old_derived.keys())
    new_controls = set(new_derived.keys())

    added_controls = sorted(new_controls - old_controls)
    removed_controls = sorted(old_controls - new_controls)

    newly_missing_questions = sorted(new_missing - old_missing)
    no_longer_missing_questions = sorted(old_missing - new_missing)

    print(f"Diff: {old_model_dir} ({old_version}) -> {new_model_dir} ({new_version})")
    print()

    print("Controls:")
    if not added_controls and not removed_controls:
        print("- (no changes)")
    else:
        if added_controls:
            print(f"- added: {added_controls}")
        if removed_controls:
            print(f"- removed: {removed_controls}")
    print()

    print("Required questions (missing):")
    if not newly_missing_questions and not no_longer_missing_questions:
        print("- (no changes)")
    else:
        if newly_missing_questions:
            print(f"- newly missing: {newly_missing_questions}")
        if no_longer_missing_questions:
            print(f"- no longer missing: {no_longer_missing_questions}")
    print()

    print("Activated domains:")
    if old_domains == new_domains:
        print(f"- (unchanged) {old_domains}")
    else:
        print(f"- old: {old_domains}")
        print(f"- new: {new_domains}")
    return 0


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
    parser = argparse.ArgumentParser(prog="riskctl.py", add_help=True)
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_eval = sub.add_parser("evaluate", help="Evaluate a facts file against a model")
    p_eval.add_argument("facts", help="Path to facts YAML")
    p_eval.add_argument("--model-dir", default=str(DEFAULT_MODEL_DIR), help="Path to model directory (default: model)")

    p_diff = sub.add_parser("diff", help="Compare outcomes between two model versions for the same facts")
    p_diff.add_argument("facts", help="Path to facts YAML")
    p_diff.add_argument("--old", required=True, help="Old model directory")
    p_diff.add_argument("--new", required=True, help="New model directory")

    args = parser.parse_args()

    if args.cmd == "evaluate":
        sys.exit(evaluate(Path(args.facts), Path(args.model_dir)))
    if args.cmd == "diff":
        sys.exit(diff_models(Path(args.facts), Path(args.old), Path(args.new)))

    parser.print_help()
    sys.exit(2)


if __name__ == "__main__":
    main()
