# packages/signals — Signal Layer

**Single responsibility:** Connect external systems, detect changes, and emit normalized events (Volume IV, Signal Layer). Also owns the **calendar mirror-out**: projecting persisted plan blocks into the user's Google Calendar.

**Inputs:** Canvas, Google Calendar, and Gmail APIs (MVP signals); user actions and conversations arrive as events from the surfaces. Sync cursors and persisted plan blocks (for mirror-out) are loaded by the orchestrator via `store` and **passed in**. Future signals per Volume IV: GitHub, Google Drive, Maps, health/wearables, campus events.

**Outputs:** Normalized domain events (`contracts` shapes) plus updated sync cursors, returned to the orchestrator for persistence; calendar writes (mirror only).

**May talk to:** the external provider APIs, `contracts`, `trust` (OAuth tokens). **May NOT talk to:** `store` — orchestrators load cursors and plan blocks, pass them in, and persist what comes back (`ARCHITECTURE.md` §4) — nor `planning`, `priority`, `capacity`, `reasoning`, `notifications` — signals emits events; orchestrators decide what happens next.

**Rules it must honor**
- **Calendar is never truth** (`CLAUDE.md` constraint 1). Inbound events are constraints. Mirror-out is a write-only projection; user edits to mirrored blocks in Google Calendar come back as *signals to reconcile*, not authoritative writes.
- **Gmail: extract structured events, discard message bodies** (Volume I Ch. 10; Volume V integration-risk mitigation).
- **Canvas: incremental polling with change detection**; consume webhooks/Live Events as an optimization where a deployment supports them (Volume IV).
- Ingestion is **idempotent** (Volume V, Phase 2): replaying a fetch must not duplicate events.

**For implementing agents**
- Do: normalize at the edge — nothing downstream of this package ever sees a raw Canvas/Google payload.
- Do: keep one adapter per provider (`canvas`, `gcal`, `gmail`), each producing only `contracts` event types.
- Do: return updated sync cursors alongside events — the orchestrator persists both; adapters hold no state of their own.
- Don't: compute priority, capacity, or plans here, or decide what a change *means* — emit the event and stop.
- Don't: store raw email bodies, anywhere, even temporarily "for debugging".

**OPEN QUESTIONS** (also in `ARCHITECTURE.md` §9)
- Canvas poll frequency: handbook says "frequently enough to feel event-driven while respecting rate limits" — no number given.
