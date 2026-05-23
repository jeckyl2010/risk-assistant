# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning is [SemVer](https://semver.org/).

---

## [Unreleased]

### Added
- Deterministic guardrail engine: facts → trigger rules → domain activation → derived controls
- Progressive disclosure UI — follow-up questions activated by domain triggers
- CLI: `riskctl evaluate` and `riskctl diff` commands
- 115-test suite covering engine logic, storage, YAML parsing, and UI types
- Full CI quality pipeline: Biome, TypeScript, knip, gitleaks, osv-scanner, CodeQL, OpenSSF Scorecard
- Podman Compose setup for self-hosted deployment
