# workers/end-of-day — End-of-Day Worker

**Responsibility (Volume IV):** Find unchecked blocks, send review prompts, and prepare the next plan after user response or configured timeout behavior.

**Orchestrates:** `store` (find unchecked blocks) → `notifications` (reconciliation prompt) → user answers arrive via `apps/api` `/execution` → `execution` (reconciliation records, remaining-effort updates) → trigger `workers/planning` for the next day → `notifications` (concise summary — Volume III, End-of-day flow).

**Rules:**
- Reconciliation is the moat (`CLAUDE.md` constraint 2): this worker's flow is never cut or stubbed.
- Capture completed / partial / not started, with time or percentage for partials (Volume II).
- Tone: no shame for unchecked blocks — missed work is new information (Volume I, Ch. 4, Principle 3).

**OPEN QUESTION** (`ARCHITECTURE.md` §9): the handbook says "configured timeout behavior" for non-responding users but never specifies it — do we plan with assumptions, carry blocks forward, or wait for morning?
