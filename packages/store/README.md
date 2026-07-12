# packages/store — Operational Store

**Single responsibility:** Own the PostgreSQL schema (Prisma, on Supabase) and expose typed repositories. This is the **only** package that touches the database (`ARCHITECTURE.md` §4).

**Inputs:** Entity reads/writes from orchestrators (`apps/api`, `workers/*`) and from the two boundary packages allowed here (`signals` for sync state, `memory` for graph persistence).

**Outputs:** Typed repository operations over the Volume IV data set: users and profiles, integrations, classes, tasks, external events, **plans and schedule blocks**, **execution records**, conflicts, notifications, daily and capacity snapshots, insights — plus the memory node/edge tables (reached only through `packages/memory`).

**May talk to:** PostgreSQL only. **May NOT:** call any other package, contain scheduling/priority/planning logic, or send anything anywhere.

**Rules it must honor**
- **Plans and execution records stored here are the system of record** (`CLAUDE.md` constraint 1). There is no more-authoritative copy anywhere.
- Row-level access controls; no sensitive payloads leak into logs or analytics (Volume IV, Security requirements).
- User-level deletion and export workflows operate at this layer (Volume I, Ch. 10).
- The Prisma schema lives **here**, not at repo root — deliberate boundary enforcement (recorded decision, `ARCHITECTURE.md` §7).

**For implementing agents**
- Do: keep repositories thin — persistence and retrieval, nothing else.
- Do: put every migration here; there is no other schema location.
- Don't: add business rules ("recalculate priority on save") — that's an orchestrator calling an engine.
- Don't: export raw Prisma client or SQL escape hatches to other packages.

**OPEN QUESTIONS** (also in `ARCHITECTURE.md` §9)
- Do memory node/edge tables live in the same Prisma schema as operational tables, or a separate one? Volume IV says only "MVP implementation may use PostgreSQL tables for nodes and edges."
