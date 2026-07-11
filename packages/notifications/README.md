# packages/notifications — Notification Engine

**Single responsibility:** Route proactive outputs according to urgency, quiet hours, user preferences, batching rules, and **interruption value** (Volume IV). Owns push delivery — no other package sends notifications.

**Inputs:** Notification requests from orchestrators (morning briefing content, priority changes, deadline/capacity risks, leave-soon alerts, end-of-day prompts, weekly reflections, conflict alerts). **Outputs:** Delivered (or deliberately withheld/batched) notifications; delivery state persisted via `store`.

**May talk to:** The push provider, `store` (delivery state, preferences), `contracts`, `trust`. **May NOT talk to:** engines, `signals`, `reasoning` — content is composed upstream; this package decides *whether, when, and how* it reaches the user.

**Rules it must honor**
- **Earn the right to interrupt** (Volume I, Ch. 4, Principle 5): every notification must save time, reduce stress, prevent a mistake, protect a commitment, create joy, or improve wellbeing. If it does none of these, it is not sent.
- Permitted set (Volume III): morning briefing (signature), new high-impact task, priority change, deadline/capacity risk, leave-soon alert, end-of-day reconciliation, weekly reflection, rare interest-based opportunity.
- **Never generic engagement nudges**, streaks, or artificial urgency (Volume III rules; Volume I, Ch. 9).
- Batch low-urgency information into briefings; respect quiet hours; users control categories and frequency; avoid last-minute automatic changes (Volume III).
- Every notification answers "why couldn't this wait?" (Volume I, Ch. 5, Principle 6). **Silence is often the better product decision.**

**For implementing agents**
- Do: implement withholding/batching as first-class outcomes with recorded reasons, not as failures.
- Do: route everything through the category + quiet-hours + preference filter — no bypass path, even for "urgent" callers.
- Don't: let another package acquire a push-provider dependency; this is the only exit point.
- Don't: add a notification type not in the Volume III permitted set without surfacing it as a spec question.

**OPEN QUESTIONS** (also in `ARCHITECTURE.md` §9)
- Push provider: Firebase Cloud Messaging vs Expo Notifications — Volume IV allows either.
- Default quiet hours — unspecified.
