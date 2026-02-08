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

- **Runtime**: Bun (fast JavaScript runtime and package manager)
- **Next.js**: App Router with React Server Components
- **TypeScript**: Strict mode, prefer type safety
- **Styling**: Tailwind CSS v4, indigo/purple gradient theme, Geist Sans + Geist Mono fonts
- **Components**: Portal-based tooltips, client-side state management
- **Build**: Turbopack for dev, standard Next.js build for production

## Code Preferences

- Use TypeScript strictly (no `any` unless absolutely necessary)
- Prefer server components unless interactivity requires `"use client"`
- Keep components focused and single-purpose
- Use Tailwind utilities over custom CSS
- Follow established typography hierarchy (text-5xl → text-3xl → text-2xl → text-xl → text-lg → base)

## When Making Suggestions

- Assume the maintainer knows what they're doing, but might miss edge cases
- Focus on concrete improvements with rationale
- If multiple approaches exist, recommend one and briefly explain tradeoffs
- Don't ask permission for obvious improvements — just do them
