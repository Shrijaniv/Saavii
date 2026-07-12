# workers/insight — Insight Worker

**Responsibility (Volume IV):** Build daily snapshots, weekly reflections, milestones, and behavioral patterns.

**Orchestrates:** `store` (execution history, plan accuracy, goal + protected-time data) → `insights` (summaries, milestones, trends, evidence-based encouragement) → persist via `store` → weekly reflection delivery via `notifications`.

**Rules:**
- Encouragement is evidence-based, never generic (Volume II, Weekly reflection).
- Feeds the Progress surface — a reflection surface, not a guilt dashboard (Volume III).
- No engagement-bait output (Volume I, Ch. 9).

**For implementing agents:** assemble inputs here, compute in `insights` — if this worker starts computing trends itself, the logic is in the wrong layer.
