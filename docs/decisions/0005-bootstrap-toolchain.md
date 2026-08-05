# 0005 — Bootstrap toolchain: dependency-cruiser, Vitest, strict TypeScript

**Status:** Accepted · **Date:** 2026-08-05 · **Decided by:** Founder (approved bootstrap plan)

## Context

`ARCHITECTURE.md` §6 "Enforcement" requires that the change introducing package manifests also introduce automated architecture checks, and names the candidate tools without choosing. `AGENTS.md` requires a test runner for the concrete-unit-tests rule. This record fixes both choices, made in the same change that added the npm workspace manifests (per decision 0002).

## Decision

- **dependency-cruiser** (`.dependency-cruiser.cjs`) encodes the §6 communication matrix and §4 rules as forbidden-dependency rules: pure engines restricted to `contracts` (and banned from Node core modules and npm I/O), per-package allowed-dependency lists, vendor SDK ownership (Prisma → `store`, Supabase → `trust`, model SDK → `reasoning`, push SDKs → `notifications`, provider clients → `signals`), and dependency direction (packages never import apps/workers).
- **Vitest** as the test runner (`npm test`), workspace-wide.
- **Strict TypeScript** via a shared `tsconfig.base.json` (strict, `noUncheckedIndexedAccess`); `npm run typecheck` covers the whole monorepo.
- **CI** (`.github/workflows/ci.yml`) runs typecheck → boundary checks → tests on every push to `main` and every PR.

## Consequences

- A boundary violation is a build failure, not a review comment. Weakening a rule to make code pass is a spec conflict per `AGENTS.md` — surface it instead.
- `npm test` currently passes with no tests (`--passWithNoTests`); the flag exists only because the scaffold has no behavior yet. The first change that adds runtime behavior must add tests per `AGENTS.md` "Testing", and the flag should be removed once the first real test lands.
- ESLint is not yet configured; adding it later (for style, not boundaries) needs no new decision record unless it takes over boundary enforcement.
