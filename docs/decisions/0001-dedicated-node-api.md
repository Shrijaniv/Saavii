# 0001 — Dedicated Node.js service for the API

**Status:** Accepted · **Date:** 2026-07-12 · **Decided by:** Founder (scaffold review session)

## Context

Volume IV (Reference technology stack → Backend) allows either "Next.js API routes or a dedicated Node backend" and does not choose between them.

## Decision

`apps/api` is a **dedicated Node.js service**, not Next.js API routes.

## Consequences

- `apps/api` is a standalone deployable with its own server bootstrap (`apps/api/src/server.ts`).
- No Next.js dependency exists in the backend; `apps/web` (if ever built) would be a separate concern.
- The HTTP framework *within* Node (Express, Fastify, …) remains **OPEN QUESTION #1** (`ARCHITECTURE.md` §9) — this record settles the runtime shape, not the framework. When the framework is chosen, record it as a new decision here.
