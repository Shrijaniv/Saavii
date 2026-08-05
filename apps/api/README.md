# apps/api — Saavii Backend (dedicated Node.js service)

**Single responsibility:** Expose the Volume IV API domains over HTTP and orchestrate the packages: authenticate (via `trust`), fetch (via `store`/`signals`), invoke pure engines, persist results (via `store`), and route user-facing output (via `notifications`).

> Recorded decision (`ARCHITECTURE.md` §7): this is a **dedicated Node.js service**, not Next.js API routes. Volume IV allowed either; decision record: `docs/decisions/0001-dedicated-node-api.md`.

**Inputs:** HTTP requests from `apps/mobile`. **Outputs:** JSON responses; orchestrated side effects through boundary packages only.

**May talk to:** Any package, subject to each package's own rules. **May NOT:** call external provider APIs directly (that's `signals`), touch the database directly (that's `store`), send pushes directly (that's `notifications`), or embed engine logic in route handlers.

**Route domains (Volume IV, one module per domain):**
`/profile` · `/goals` · `/classes` · `/interests` · `/integrations` · `/sync` · `/tasks` · `/plans` · `/execution` · `/capacity` · `/conflicts` · `/memories` · `/briefings` · `/notifications` · `/chat`

Future coordination domains (Volume IV, V2 — deliberately not scaffolded): `/sharing-policies`, `/availability-grants`, `/coordination-requests`, `/coordination-candidates`, `/shared-plans`.

**Rules it must honor**
- Routes are **thin**: validate → authorize (middleware from `trust`) → orchestrate packages → respond. If a handler contains a scheduling loop or a priority formula, it's in the wrong layer.
- `/chat` is the main consumer of `reasoning` — and the place where proposals get validated and executed by deterministic services, never auto-applied (`CLAUDE.md` constraint 3).
- **All user-initiated changes use the Action Protocol** (`ARCHITECTURE.md` §5), whatever the surface: voice, chat, buttons, widgets, notification actions. Route handlers for direct UI actions (e.g. a "move block" button) construct the same versioned proposals and run the same validation path as `/chat` — no surface-specific shortcut writes.
- `/capacity` serves the "Can I?" hero feature: feasible windows + tradeoffs + safest recommendation, with reasoning shown (Volume I, Ch. 8; Volume II).
- `/memories` exposes view/edit/export/delete per the privacy commitments (Volume I, Ch. 10).

**For implementing agents**
- Do: keep one route module per domain, named exactly as listed.
- Do: apply `trust` middleware globally; no unauthenticated domain routes.
- Don't: import Prisma, provider SDKs, or a push SDK here — those imports are the smell of a boundary violation.

**Resolved decisions**
- HTTP framework: **Fastify** (`docs/decisions/0004-fastify-api-framework.md`). Route modules register as Fastify plugins; `trust` middleware applies as a global hook; request/response schemas reference `contracts` types.
