# 0002 — npm workspaces for monorepo tooling

**Status:** Accepted · **Date:** 2026-07-12 · **Decided by:** Founder (scaffold review session)

## Context

The handbook specifies the stack (TypeScript, Prisma, Inngest, Expo) but is silent on how `apps/*`, `packages/*`, and `workers/*` relate at build time. Implementation agents need one answer, not a survey.

## Decision

**npm workspaces**, declared in the root manifest when implementation starts. Zero additional tooling; the directory layout (`apps/*`, `packages/*`, `workers/*`) maps onto it directly.

## Consequences

- No package manifests exist yet (the scaffold is docs-only); the first implementation change adds the root workspace declaration.
- Turborepo/pnpm are optimizations to consider **only if build times demand it** — adopting one requires a superseding record here.
