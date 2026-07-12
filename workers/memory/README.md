# workers/memory — Memory Worker

**Responsibility (Volume IV):** Process **validated** memory proposals and maintain graph nodes, edges, provenance, confidence, and lifecycle.

**Orchestrates:** consume proposals produced by `reasoning` (via `/chat` or signal processing) → **validation gate** → `memory` service (remember/update/link/archive/forget) → ambiguous cases routed to the user for confirmation via `notifications`.

**The validation gate (Volume III, Memory update flow):**
- Explicit and low-risk → store directly.
- Ambiguous or sensitive → ask the user for confirmation first.
- Everything stored becomes visible in Memory Review (Volume III, Profile).

**Rules:**
- This worker is the ONLY path from LLM output to the Life Graph (`CLAUDE.md` constraint 3). `reasoning` proposes; this worker validates; `memory` persists.
- Reject proposals missing source/confidence/sensitivity (Volume IV provenance requirements).
- Sensitive categories require opt-in consent (`trust`) before storage (Volume I, Ch. 10).
