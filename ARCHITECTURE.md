# ARCHITECTURE.md — The Technical Contract

This is the authoritative technical contract for the Saavii repository, derived from `docs/handbook/volume-4-technical-architecture.md` (systems, stack, workers, security) and the constraints in `CLAUDE.md`. **Every per-folder README conforms to this document.** If a folder doc and this file disagree, this file wins — and the disagreement should be surfaced and fixed, not worked around.

## 1. Architectural principle

Saavii is a **life-state system that uses AI for interpretation**. It is not an LLM wrapper. Deterministic software owns scheduling, state, permissions, and critical actions. The LLM returns structured proposals; validated services execute them.

## 2. The plan is canonical

Saavii's system of record is the **plan** — the intention layer (Volume I, Chapter 11, Pillar 1). Concretely:

- Google Calendar events flow **in** as constraints via the Signal Layer.
- Saavii's schedule blocks flow **out** to the user's calendar as a **mirror**.
- The authoritative representation of what the user intends to do — and whether it happened — lives in the Operational Store (`packages/store`), never in the calendar.
- Edits a user makes to mirrored blocks inside Google Calendar re-enter as *signals* to reconcile, not as authoritative writes.

Any code path that treats calendar state as truth violates this contract.

## 3. System map

One package per Volume IV core system. System boundaries are directory boundaries.

| Volume IV system | Package | One-line responsibility |
|---|---|---|
| Signal Layer | `packages/signals` | Connect external systems, detect changes, emit normalized events; mirror plan blocks out to the calendar. |
| Operational Store | `packages/store` | Own the PostgreSQL schema and repositories. The only database boundary. |
| Memory Service / Life Graph | `packages/memory` | Memory API over a provenance-carrying graph of nodes and edges. |
| Reasoning Engine | `packages/reasoning` | LLM interpretation. Returns structured proposals only. |
| Priority Engine | `packages/priority` | Explainable priority scores. Numbers internal; users see labels and reasons. |
| Capacity Engine | `packages/capacity` | Free-capacity math; point-in-time and range "Can I?" queries. |
| Planning Engine | `packages/planning` | Deterministic constraint scheduler; produces the canonical plan. |
| Execution Engine | `packages/execution` | Planned-vs-actual states and reconciliation records (the proprietary data). |
| Conflict Engine | `packages/conflicts` | Conflicting signals as first-class data; important conflicts never silently resolved. |
| Insight Engine | `packages/insights` | Daily/weekly summaries, milestones, trends, evidence-based encouragement. |
| Notification Engine | `packages/notifications` | Routing by urgency, quiet hours, batching, interruption value. Owns push delivery. |
| Trust Layer | `packages/trust` | Cross-cutting auth, consent, token security, audit, retention, export, deletion. |
| *(shared, not a Vol IV system)* | `packages/contracts` | Normalized event model and shared domain types. Types only, no logic. |

Surfaces and orchestration:

| Path | Role |
|---|---|
| `apps/mobile` | React Native + Expo client. Talks to `apps/api` over HTTP only. Primary MVP surface. |
| `apps/api` | Dedicated Node.js service exposing the Volume IV API domains. Thin routes; delegates to packages. |
| `workers/` | The five Inngest workflows (sync, planning, end-of-day, insight, memory). Orchestration only. |

## 4. Three kinds of code

Every module in this repo is exactly one of these. Do not mix them.

1. **Boundary systems** — the only code allowed side effects, each with exactly one kind:
   - `signals`: external provider APIs (Canvas/GCal/Gmail), including the calendar mirror-out.
   - `store`: PostgreSQL (via Prisma). Nothing else touches the database.
   - `notifications`: push delivery. Nothing else sends notifications.
   - `trust`: the auth provider (Supabase Auth) and audit sinks.
   - `reasoning`: the model API. **May call the LLM; may not write anything durable.**
   - `memory`: exposes the memory API; persists via `store` (callers never touch node/edge tables directly).
2. **Pure engines** — `priority`, `capacity`, `planning`, `execution`, `conflicts`, `insights`. Deterministic functions over inputs their callers provide. **No I/O, no clocks hidden inside, no network, no database.** This is what makes them testable and what enforces "deterministic software owns state."
3. **Orchestrators** — `apps/api` routes and `workers/*`. They fetch via boundary systems, invoke pure engines, persist results via `store`, and route user-facing output through `notifications`. All sequencing lives here.

## 5. Data flow

```
  Canvas · Google Calendar · Gmail · user actions
        │ (inbound: constraints and signals)
        ▼
  packages/signals ──► normalized events (packages/contracts)
        │
        ▼
  packages/store  ◄───────────────── the ONLY PostgreSQL boundary
        │
        │  orchestrated by workers/ and apps/api:
        ├──► priority ──┐
        ├──► capacity ──┼──► planning ──► PLAN (canonical, persisted in store)
        │               │                   │
        │               │                   ├──► calendar mirror-out (via signals)
        │               │                   └──► notifications ──► push to user
        ▼               │
  execution  ◄── user marks blocks done / partial / missed (mobile → api)
        │
        │  reconciliation records (proprietary — Volume I, Ch. 11, Pillar 2)
        └──► replan trigger ──► workers/planning  (the loop closes)
```

Memory and reasoning run alongside:

```
  conversation / signals ──► reasoning ──► structured proposals (contracts)
                                              │
                              workers/memory validates (explicit + low-risk → store;
                              ambiguous → user confirmation via notifications)
                                              │
                                              ▼
                              packages/memory ──► Life Graph (persisted via store,
                                                  with provenance on every node/edge)
```

## 6. Communication matrix

"May call" means a direct code dependency. Everything may use `contracts` (types) and `trust` (auth/consent checks); those two rows are omitted from "may call" for brevity.

| Package | May call | Must NOT call |
|---|---|---|
| `contracts` | nothing | everything (types only, zero dependencies) |
| `signals` | `store` (sync state, persisted plan blocks for mirror-out) | any engine, `reasoning`, `notifications` |
| `store` | PostgreSQL only | any other package (no business logic inside) |
| `memory` | `store` | `reasoning`, `signals`; must never be bypassed by direct table access |
| `reasoning` | model API only | `store` (write), `memory` (write), `signals`, `notifications` — no durable side effects |
| `priority` | nothing (pure) | all I/O |
| `capacity` | nothing (pure) | all I/O |
| `planning` | nothing (pure) | all I/O; especially any calendar API |
| `execution` | nothing (pure) | all I/O |
| `conflicts` | nothing (pure) | all I/O |
| `insights` | nothing (pure) | all I/O |
| `notifications` | push provider; `store` (delivery state, preferences) | engines, `signals`, `reasoning` |
| `trust` | auth provider, audit sink | any domain package (it depends on nothing domain-specific) |
| `apps/api`, `workers/*` | any package, per its rules above | external provider APIs directly (go through `signals`), the database directly (go through `store`) |
| `apps/mobile` | `apps/api` over HTTP; `contracts` for types | any backend package directly |

## 7. Recorded stack decisions

These are settled. Do not re-litigate them; record new decisions here.

- **Client:** React Native with Expo (TypeScript). Mobile is the primary MVP surface. *(Volume IV)*
- **API:** a **dedicated Node.js service** (not Next.js API routes). *(Volume IV allows either; decided by the founder.)*
- **Database:** PostgreSQL on Supabase, accessed exclusively through `packages/store` via **Prisma**. The Prisma schema lives in `packages/store` — deliberate boundary enforcement, not the conventional root location.
- **Auth:** Supabase Auth, owned by `packages/trust` (client wiring, session/token verification, RLS policy). `apps/api` consumes auth middleware from `trust`.
- **No `packages/supabase`:** Supabase is split by responsibility (Postgres → `store`, Auth → `trust`), never by vendor.
- **Background workflows:** Inngest, one folder per Volume IV worker under `workers/`.
- **Monorepo:** npm workspaces (`apps/*`, `packages/*`, `workers/*`), declared when implementation starts. No extra tooling until build times demand it.
- **Reasoning:** Claude for reasoning and structured tool use; smaller models for classification/extraction, larger for synthesis. *(Volume IV, Volume V cost strategy)*
- **Canvas sync:** incremental polling with change detection; webhooks/Live Events consumed as an optimization where available. *(Volume IV)*
- **No `apps/web` for MVP.** *(Volume IV: mobile primary)*

## 8. Security and privacy requirements (Volume IV / Volume I Ch. 10)

- OAuth tokens encrypted and isolated from application logs.
- Least-privilege scopes; explicit opt-in for location and sensitive memory categories.
- Row-level access controls.
- No sensitive payloads in analytics.
- Structured redaction before model calls where possible.
- Extract structured events from Gmail and **discard message bodies**.
- User-level deletion and export workflows; memory provenance and audit trails.

## 9. Open questions (master list)

Marked in the owning folder's README as well. Do not invent answers — extend this list.

| # | Question | Owning doc |
|---|---|---|
| 1 | Node.js HTTP framework for `apps/api` (Express, Fastify, …) — handbook silent. | `apps/api/README.md` |
| 2 | Canvas poll frequency — handbook says "frequently enough to feel event-driven while respecting rate limits", no number. | `packages/signals/README.md` |
| 3 | Do memory node/edge tables live in the same Prisma schema as operational tables, or a separate one? | `packages/store/README.md` |
| 4 | Priority formula weights — factors are listed, the formula is not. | `packages/priority/README.md` |
| 5 | Default buffer sizes and protected-time defaults. | `packages/capacity/README.md` |
| 6 | End-of-day "configured timeout behavior" when the user doesn't respond — unspecified. | `workers/end-of-day/README.md` |
| 7 | Push delivery provider: Firebase Cloud Messaging vs Expo Notifications — Volume IV allows either. | `packages/notifications/README.md` |
| 8 | Model routing thresholds and specific model IDs. | `packages/reasoning/README.md` |
| 9 | Default quiet hours. | `packages/notifications/README.md` |
