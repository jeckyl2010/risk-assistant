# Security Policy

## Supported Versions

This project is in active development. Only the current `main` branch receives security fixes.

| Version | Supported |
|---------|-----------|
| main    | ✅        |
| older   | ❌        |

## Reporting a Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Use GitHub's private vulnerability reporting:

👉 [Report a vulnerability](https://github.com/jeckyl2010/risk-assistant/security/advisories/new)

Expect an acknowledgement within a few days and a fix or mitigation within a reasonable timeframe depending on severity.

## Risk Surface

This is a local-first application. It runs in a browser against a local Next.js dev server or a self-hosted container. There is no cloud backend, no authentication layer, and no external API calls.

The main risk areas are:

- **Fact files** — system descriptions stored as YAML files on disk. These may contain sensitive organisational or architectural details. They are never transmitted anywhere by this application. Protect them as you would any internal documentation.
- **Dependency vulnerabilities** — monitored automatically via Dependabot (weekly) and `osv-scanner` in CI on every push.
- **YAML parsing** — fact files and model definitions are parsed server-side. Malformed or adversarially crafted YAML could cause unexpected behaviour. Only load model and system files from trusted sources.
- **Container exposure** — when running via Podman Compose, the app binds to `localhost` by default. Do not expose the container port to untrusted networks.
