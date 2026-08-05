# Saavii

> **Saavii is an AI Life Operating System that helps students and professionals make better decisions every day by understanding their commitments, priorities, relationships, and goals — so they can live happier, more balanced lives.**
> — [Handbook, Volume I, Chapter 3](./docs/handbook/README.md)

This repository is currently a **documented scaffold**: the directory structure, the architectural contract, and the rules implementing agents must follow. There is no implementation code yet. The map and the rulebook come first; the product is built against them.

## Where the canonical thesis lives

**`docs/handbook/`** is the single source of truth — Volumes I–V cover vision, strategy, product requirements, experience/design, technical architecture, and the business/build plan. Nothing in this repository may contradict it. If you find a contradiction, surface it; do not resolve it silently.

The load-bearing decisions are distilled into [`CLAUDE.md`](./CLAUDE.md) and made operational in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Repo map

| Path | What it is |
|---|---|
| `docs/handbook/` | The canonical Saavii Handbook (Volumes I–V). Read-only source of truth. |
| `docs/decisions/` | Decision records for choices the handbook leaves open; cited from `ARCHITECTURE.md` §7. |
| `CLAUDE.md` | Non-negotiable constraints every agent loads before working. |
| `ARCHITECTURE.md` | The authoritative technical contract. All folder docs conform to it. |
| `AGENTS.md` | Imperative guide + done-checklist for implementation agents. |
| `apps/mobile/` | React Native + Expo client — the primary MVP surface (Volume IV). |
| `apps/api/` | Dedicated Node.js backend exposing the Volume IV API domains. |
| `packages/` | One package per Volume IV core system. System boundaries are directory boundaries. |
| `workers/` | The five Inngest background workflows from Volume IV. |

## How the folders relate

External signals (Canvas, Google Calendar, Gmail, user actions) enter through `packages/signals`, become normalized events (`packages/contracts`), and are persisted by `packages/store` — the only package that touches PostgreSQL. The deterministic engines (`priority`, `capacity`, `planning`, `execution`, `conflicts`, `insights`) are pure computation; `workers/` and `apps/api` orchestrate them. Plans flow out to Google Calendar as a **mirror** via `signals`; the calendar is never the source of truth. Execution/reconciliation records flow back in and trigger replanning. `packages/reasoning` (the LLM) only ever returns structured proposals; `packages/trust` cross-cuts everything.

The full data flow, the communication matrix, and the "three kinds of code" rule are in [`ARCHITECTURE.md`](./ARCHITECTURE.md) — that document is the contract; per-folder READMEs are its implementations.

## Reading order for agents

1. [`CLAUDE.md`](./CLAUDE.md) — the constraints.
2. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — the contract.
3. The `README.md` of the folder you are about to touch.
4. The relevant handbook volume when the folder doc cites it.

## Deliberately deferred

- **`apps/web`** — Volume IV allows a Next.js dashboard but names mobile as the primary MVP surface. Not scaffolded; add only when the roadmap calls for it.
- **Multiplayer / shared planning** — Volume I, Chapter 11, Pillar 4. Now specified in detail as the future Coordination Engine (Volume IV) with UX (Volume III) and release criteria (Volume V), governed by *"coordinate outcomes without exposing lives."* Still not built in the MVP, but the data model must not foreclose it.
