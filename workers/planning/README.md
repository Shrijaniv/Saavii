# workers/planning — Planning Worker

**Responsibility (Volume IV):** Rebuild plans after meaningful changes, each morning, and after execution reconciliation.

**Orchestrates:** fetch context via `store` → `priority` (scores + reasons) → `capacity` (available time) → `planning` (plan + confidence + warnings + change classification) → persist plan via `store` → calendar mirror-out (pass the persisted blocks to `signals`) → user-facing change notices via `notifications` (preferences passed in; delivery outcomes persisted back via `store`).

**Rules:**
- The persisted plan is canonical (`CLAUDE.md` constraint 1); mirror-out happens only after persistence.
- Low-risk changes: apply automatically with clear notification. Significant changes: require approval or advance notice (Volume II, Adaptive replanning). The engine classifies; this worker routes.
- Avoid last-minute surprise changes (Volume II; Volume III notification rules).

**For implementing agents:** this worker sequences engines — it never contains scheduling or priority logic itself.
