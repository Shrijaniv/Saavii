# 0006 — Delivery pipeline: checks gate every path to production

**Status:** Accepted · **Date:** 2026-08-05 · **Decided by:** Founder (requested CI/CD gating before production)

## Context

Decision 0005 established the checks (typecheck, architecture boundaries, tests) on PRs and pushes to `main`. The founder asked for a CI/CD pipeline that runs code through those checks before it reaches production. No hosting target exists yet — the handbook is silent on hosting (Volume V names cost line items, not providers) — so the deploy stage must exist and be gated without pretending to ship.

## Decision

Two workflows in `.github/workflows/`:

- **`ci.yml` (Checks)** — reusable quality gate (`pull_request` + `workflow_call`): typecheck → boundary checks → tests.
- **`deploy.yml` (Deploy)** — on push to `main` and manual dispatch: re-runs Checks, then `deploy-backend` and `deploy-mobile` jobs that run only when **all three gates** hold: Checks green, repository variable `DEPLOY_ENABLED == 'true'`, and the `production` GitHub environment (where required reviewers can be enforced). A concurrency group prevents overlapping production deploys.

Until hosting is decided, the deploy steps **fail loudly by design** rather than no-op, so enabling the gate without configuring a target cannot masquerade as a successful ship.

Branch protection on `main` (require Checks, no direct pushes) is part of this decision but must be enabled in repository settings by an admin.

## Consequences

- Production is reachable only through: PR checks → merge to `main` → checks re-run → gated deploy. No path ships unchecked code.
- Choosing the backend host and the mobile build pipeline (likely Expo EAS) are recorded as **open question #10** (`ARCHITECTURE.md` §9); each choice becomes a new decision record and replaces its placeholder step.
- Deploy credentials live in the `production` environment's secrets, never in the repository.
