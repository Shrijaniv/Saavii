# 0004 — Fastify as the HTTP framework for `apps/api`

**Status:** Accepted · **Date:** 2026-08-05 · **Decided by:** Founder (approved recommendation in the bootstrap session)

## Context

Decision 0001 settled the runtime shape (dedicated Node.js service) but explicitly left the HTTP framework open (formerly OPEN QUESTION #1 in `ARCHITECTURE.md` §9). The handbook is silent on the choice.

## Decision

**Fastify.** Chosen for schema-first request validation (a natural fit for the Action Protocol's versioned schemas), first-class TypeScript support, plugin encapsulation that matches the one-module-per-domain route layout, and performance without framework-level magic.

## Consequences

- Route modules in `apps/api/src/routes/` register as Fastify plugins, one per Volume IV domain.
- `trust` auth middleware is consumed as a Fastify hook/plugin applied globally.
- Request/response schemas should reference the `contracts` types rather than redefining shapes inline.
