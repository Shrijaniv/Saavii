# workers/sync — Sync Worker

**Responsibility (Volume IV):** Incrementally fetch changes from connected providers and emit normalized domain events.

**Orchestrates:** load sync cursors via `store` → `signals` adapters + change detection (cursors passed in) → receive normalized `contracts` events and updated cursors → persist both via `store`. `signals` itself never touches the database (`ARCHITECTURE.md` §4).

**Rules:**
- Idempotent: replays never duplicate events (Volume V, Phase 2).
- Canvas: incremental polling with change detection; consume webhooks/Live Events as an optimization where available (Volume IV).
- Never interprets what a change means — downstream workers/routes decide; this worker fetches, normalizes, persists.

**For implementing agents:** retries with backoff and degraded states live here (Volume V, Integration fragility); provider quirks live in `signals` adapters, not in this worker.

**OPEN QUESTION** (`ARCHITECTURE.md` §9): poll frequency — "frequently enough to feel event-driven while respecting rate limits", no number given.
