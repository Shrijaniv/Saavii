# packages/execution — Execution Engine

**Single responsibility:** Track planned versus actual behavior and trigger replanning (Volume IV). Owns the state machine — `planned`, `completed`, `partial`, `missed`, `rescheduled`, `cancelled` — and the shape of the **reconciliation record**.

> **This package guards the moat.** The daily reconciliation record is proprietary data that exists in no external API (Volume I, Ch. 11, Pillar 2; `CLAUDE.md` constraint 2). It is co-equal in priority with planning and is never cut, weakened, or skipped. A change that reduces reconciliation fidelity violates the repo's constraints regardless of what it gains.

**Inputs:** User completion actions (complete / partial / skip / reschedule from the Today screen), end-of-day reconciliation answers (actual time or percentage), plan blocks. **Outputs:** Execution records, state transitions, replan triggers, and capacity-model feedback (actual-vs-estimated effort).

**May talk to:** Nothing — **pure engine** (`ARCHITECTURE.md` §4): transition logic and record construction only. Persistence and scheduling of replans belong to orchestrators (`workers/end-of-day`, `apps/api`) via `store`.

**Rules it must honor**
- **Plans are hypotheses; execution records are truth** (Volume IV).
- **A missed task means new information — replanning, updated capacity estimates, better predictions. Never shame the user** (Volume I, Ch. 4, Principle 3). No state, field, or message in this package may encode blame.
- Reconciliation captures partial progress (time or percentage) so remaining effort can be replanned (Volume II, End-of-day reconciliation).
- Every generated work block is checkable (Volume II, Execution tracking).

**For implementing agents**
- Do: make every state transition explicit and auditable — this data feeds the personalized capacity model.
- Do: preserve the raw user-reported outcome alongside any derived values.
- Don't: infer completion silently; the user's report is the record.
- Don't: let any refactor drop reconciliation fields "temporarily." This data compounds; gaps are permanent.
