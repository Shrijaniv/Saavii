# packages/conflicts — Conflict Engine

**Single responsibility:** Treat conflicting signals as **first-class data** (Volume IV). Detect deadline mismatches, priority overrides, schedule overlaps, source changes, and user-intent conflicts.

**Inputs:** Normalized events, tasks, plan blocks, user overrides — passed in by callers. **Outputs:** Conflict records with consequences and a recommended resolution option.

**May talk to:** Nothing — **pure engine** (`ARCHITECTURE.md` §4): detection and recommendation only. Persistence via orchestrators + `store`; user-facing routing via orchestrators + `notifications`.

**Rules it must honor**
- **Important conflicts are never silently resolved** (Volume IV). The resolution flow is: show the conflicting signals, explain consequences, recommend an option, and let the user **accept, override, or defer** (Volume III, Conflict resolution flow).
- Recommendations come with plain-language reasoning (Volume I, Ch. 5, Principle 2).
- A user override is itself a signal this engine must respect in future detections (Volume IV lists priority overrides among conflict sources).

**For implementing agents**
- Do: classify conflicts by importance — only unimportant ones may be auto-resolved, and even then the resolution is recorded.
- Do: keep each conflict record traceable to the specific signals that clashed.
- Don't: pick a winner between two sources inside this engine for important conflicts — that decision belongs to the user.
- Don't: drop deferred conflicts; deferral is a state, not deletion.
