# packages/insights — Insight Engine

**Single responsibility:** Generate daily and weekly summaries, milestones, risks, trends, and **evidence-based encouragement** (Volume IV).

**Inputs:** Execution history, plan accuracy data, goal progress, protected-time completion, snapshots — passed in by callers (assembled by `workers/insight` from `store`). **Outputs:** Insight objects: daily snapshots, weekly reflections, milestones, learned patterns, risk callouts.

**May talk to:** Nothing — **pure engine** (`ARCHITECTURE.md` §4). **May NOT:** perform any I/O.

**Rules it must honor**
- **Motivation must be evidence-based rather than generic** (Volume II, Weekly reflection). Every encouraging statement cites what actually happened.
- The Progress surface this feeds is **a reflection surface, not a guilt dashboard** (Volume III): completed work, personal time protected, planning accuracy, milestones, learned patterns, happiness/stress check-in.
- Weekly reflection covers: accomplishments, missed work, planning accuracy, goal progress, protected personal time, next-week risks (Volume II).
- No engagement mechanics: no streaks, no artificial celebration of volume (Volume I, Ch. 9 "metrics we do not optimize blindly"; Ch. 5, Principle 11 — calm, not noisy).

**For implementing agents**
- Do: quantify ("you protected 4 of 5 planned gym sessions"), don't cheerlead ("great job!").
- Do: surface planning-accuracy trends — they feed both the user's trust and the capacity model.
- Don't: frame missed work as failure; frame it as information (Volume I, Ch. 4, Principle 3).
- Don't: generate insights whose only purpose is to prompt an app open.
