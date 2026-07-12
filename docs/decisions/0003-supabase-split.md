# 0003 — Supabase split by responsibility: Postgres → `store`, Auth → `trust`

**Status:** Accepted · **Date:** 2026-07-12 · **Decided by:** Founder (scaffold review session)

## Context

Volume IV assigns the database to the Operational Store and authentication/token security to the Trust Layer, and names Supabase as the vendor for both PostgreSQL and Auth — but does not say which module owns the vendor wiring.

## Decision

Supabase is split **by responsibility, never by vendor**:

- **PostgreSQL** (via Prisma) → `packages/store`. Connection config, schema, and migrations live there; the Prisma schema sits in `packages/store` rather than the conventional repo root, as deliberate boundary enforcement.
- **Supabase Auth** → `packages/trust`. Client wiring, session/token verification, and the documented RLS policy live there; `apps/api` consumes auth middleware from `trust`, and `apps/mobile` gets its sign-in flow contract from `trust`.
- There is **no `packages/supabase`**. An infra-named package would invite agents to route around the store/trust boundaries.

## Consequences

- Swapping Supabase Auth, or moving off Supabase Postgres, changes the internals of one package each — never the folder structure or the communication matrix.
- Any code importing a Supabase client outside `store` (data) or `trust` (auth) is a boundary violation per `AGENTS.md`.
