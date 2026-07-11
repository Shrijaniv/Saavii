# packages/capacity — Capacity Engine

**Single responsibility:** Calculate free capacity after fixed commitments, routines, travel assumptions, buffers, protected personal time, and unscheduled required work (Volume IV). Supports **point-in-time and range queries** — this is the engine beneath the **"Can I?" hero feature** (Volume I, Ch. 8; Volume V, Phase 3: a first-class, user-facing feature).

**Inputs:** Commitments, routines, tasks and remaining effort, protected activities, execution history — passed in by callers. **Outputs:** Available capacity; for "Can I?" queries: **feasible windows, tradeoffs, and the safest recommendation** (Volume II).

**May talk to:** Nothing — **pure engine** (`ARCHITECTURE.md` §4). **May NOT:** perform any I/O.

**Rules it must honor**
- **Protected personal time is a hard input, not slack to reclaim** (Volume I, Ch. 4, Principles 2 & 4): exercise, hobbies, relationships, and rest are commitments, not leftover time.
- Answers must be explainable — the "Can I?" answer ships with its reasoning shown (Volume I, Ch. 8).
- Execution history informs capacity: the personalized capacity model is a defensibility asset (Volume I, Ch. 11, Pillar 2). Real reconciliation data beats optimistic assumptions.
- A late night reduces tomorrow's available capacity (Volume I, Ch. 5, Principle 3).

**For implementing agents**
- Do: return ranked windows with tradeoffs, not a bare yes/no.
- Do: treat buffers as reserved (Volume IV, Planning Engine reserves buffers).
- Don't: silently consume protected time to make an answer "yes".
- Don't: hide a risky "yes" — the safest recommendation is part of the output contract.

**OPEN QUESTIONS** (also in `ARCHITECTURE.md` §9)
- Default buffer sizes and protected-time defaults — the handbook mandates their existence, not their values.
