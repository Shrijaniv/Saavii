# packages/planning — Planning Engine

**Single responsibility:** A **deterministic constraint-based scheduler** (Volume IV) that produces the canonical plan: daily plans, weekly allocations, schedule blocks, confidence and warnings.

**Inputs (Volume IV):** hard constraints, task effort and deadlines, priorities (from `priority`, passed in), user preferences, capacity (from `capacity`, passed in), execution history, protected personal activities. **Outputs:** Plan objects — the intention layer. Persistence is the orchestrator's job (via `store`); calendar mirror-out happens **after** persistence, via `signals`.

**May talk to:** Nothing — **pure engine** (`ARCHITECTURE.md` §4). **May NOT:** perform any I/O — and especially may never call a calendar API.

**Rules it must honor**
- **The plan it produces is the system of record** once persisted (`CLAUDE.md` constraint 1). Nothing in this package may treat external calendar state as truth.
- Large tasks are **split into bounded work units**; the planner **reserves buffers** and avoids unrealistic back-to-back locations (Volume IV).
- **Plans are hypotheses; reality is truth** (Volume I, Ch. 4, Principle 3): replanning after reconciliation is normal operation, not an error path.
- Low-risk adjustments may be automatic **with clear notification**; significant changes require approval or advance notice (Volume II) — the plan output must therefore classify its own changes by impact.
- Every plan carries confidence and warnings (Volume IV), and important changes carry plain-language explanations (Volume I, Ch. 5, Principle 2).

**For implementing agents**
- Do: emit a change classification (low-risk vs significant) with every replan so orchestrators can route approval vs notification correctly.
- Do: schedule around meals, sleep, commute, and hobbies as real blocks (Volume II daily planning list).
- Don't: import provider SDKs, clocks, or randomness — determinism is the contract.
- Don't: drop protected personal blocks to fit more work (Volume I, Ch. 4, Principle 2).
