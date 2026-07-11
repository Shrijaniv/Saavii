# Volume V — Business, Roadmap & Build Plan

Part of the [Saavii Handbook](./README.md). Source: [Notion](https://app.notion.com/p/39ac77233acb81c18b96d6f8f70ff2d4).

## Business Model

### Pricing hypothesis

**Free**

- Core onboarding
- Limited connected signals
- Basic daily plan
- Limited assistant usage

**Student Pro — target $5/month**

- Canvas, Gmail, and Calendar intelligence
- Proactive morning briefing
- Automatic priorities
- Daily and weekly planning
- Adaptive replanning
- Progress and balance reviews
- Long-term memory controls

**Future Professional — $10–15/month**

- Workplace and project integrations
- Richer career intelligence
- Professional planning and reviews
- Advanced location and travel context

Pricing must be validated through retention and willingness-to-pay testing. The objective is not to subsidize heavy inference indefinitely.

## Go-to-market

### Initial audience

Organized but overloaded college students, beginning with STEM and internship-focused students who already use Canvas and Google tools.

### Acquisition channels

- University clubs and student organizations
- Campus ambassadors
- CS and productivity communities
- University Discords and Reddit communities
- Short-form demonstrations of the morning briefing and automatic replanning
- Referrals between friends and roommates

### Message

Do not lead with integrations or AI. Lead with:

> Saavii plans your work and protects time for your life.

### Product-led growth loop

A useful first plan → daily briefing habit → visible reduction in stress → weekly reflection → recommendation to a friend.

## MVP release criteria

The MVP is ready for a closed beta when a student can:

1. Create an account
2. Connect Calendar, Gmail, and Canvas
3. Confirm a class schedule and routines
4. Receive imported assignments
5. See explained automatic priorities
6. Receive a realistic daily plan
7. Mark work completed or partial
8. Complete end-of-day reconciliation
9. Receive an updated next-day plan
10. Ask a capacity question and receive feasible time windows
11. Control notifications and delete stored memories

## Development phases

> **Sequencing note.** Phases 3 and 4 together are the moat-critical core defined in Volume I, Chapter 11: the **plan** (the intention layer we own) and the **execution loop** (Plan → Do → Reconcile → Replan) that generates our proprietary, non-re-derivable data. Execution cannot precede planning, but it is co-equal in priority — neither ships without the other, and neither is cut to hit a beta date. A planner without reconciliation is a read-only overlay an incumbent can copy; the reconciliation loop is what compounds.

The three wedge elements from Volume I, Chapter 8 map to phases as follows: **instant Canvas ingestion** (activation) lands in Phases 2–3, the **"Can I?" capacity question** (hero feature) lands in Phase 3, and the **morning briefing** (daily habit) lands in Phase 5. All three must be present for the closed beta.

### Phase 1 — Foundation

- Mobile application shell
- Authentication
- Prisma and PostgreSQL schema
- Profiles, goals, classes, routines, interests
- Privacy and consent foundations

### Phase 2 — Signals

- Google Calendar OAuth and sync
- Gmail OAuth and scoped extraction
- Canvas token/OAuth integration and assignment sync
- Normalized event model and idempotent ingestion

### Phase 3 — Planning loop

- Task normalization
- Priority engine
- Capacity engine
- **The "Can I?" capacity query as a first-class, user-facing feature** (point-in-time and range: *"Can I go out Friday and still finish the project?"*)
- Daily and weekly planner
- Today and Calendar screens

### Phase 4 — Execution and adaptation *(moat-critical — see sequencing note)*

- Checkable blocks
- Partial completion
- End-of-day reconciliation *(the source of our proprietary capacity data — exists in no external API)*
- Adaptive replanning
- Conflict handling

### Phase 5 — Proactivity

- Morning briefing
- Notification rules
- Priority-change notifications
- Weekly review

### Phase 6 — Reasoning and memory

- Conversational assistant
- Structured tool use
- Memory proposals
- Relational Life Graph MVP
- Memory Review controls

### Phase 7 — Beta hardening

- Observability
- Security review
- Sync error recovery
- Deletion and export testing
- Cost instrumentation
- Accessibility
- Pilot cohort and feedback

## Future roadmap

### V1.5

- GitHub
- Google Drive
- Home/campus places
- Commute-aware planning
- Widgets and Siri Shortcuts

### V2

- Interest-based opportunity recommendations
- Campus events and clubs
- Restaurants, movies, concerts, and books
- Richer relationship intelligence
- Professional mode

### V3

- Health and wearable context
- Broader family and household planning
- Travel-aware life planning
- Multi-device ambient experience

## Key risks and mitigations

**Onboarding friction** — Mitigation: progressive onboarding, immediate first plan, optional advanced configuration.

**Incorrect plans** — Mitigation: deterministic logic, confidence, explanations, feedback, and conservative automation.

**Notification fatigue** — Mitigation: strict interruption criteria, batching, quiet hours, category controls.

**Privacy concerns** — Mitigation: minimal scopes, visible memory controls, clear promises, deletion, security audits.

**Integration fragility** — Mitigation: normalized adapters, idempotent sync, retries, monitoring, graceful degraded states.

**Integration access as a distribution gate** — The defensibility thesis in Volume I, Chapter 11 depends on reaching users before the category becomes a free default. Two integration walls threaten that head start directly. Canvas API access is granted per institution and is often restricted or gated behind LTI rather than open tokens, so launch campuses should be selected partly on whether student-level Canvas access actually works there. Gmail restricted-scope access requires Google's security assessment (CASA), which is slow and can be costly for a consumer app.

Mitigation: extract structured events from Gmail and discard message bodies (reducing scope burden and reinforcing the privacy position), validate Canvas access per target campus before committing GTM spend, and design onboarding to deliver value from Calendar + Canvas alone so Gmail is enhancing rather than blocking.

**AI cost** — Mitigation: structured context, model routing, caching, asynchronous summaries, and deterministic services.

## Initial cost framework

Early fixed costs may include Supabase, hosting, workflow orchestration, observability, developer accounts, and notification infrastructure. Variable costs include LLM tokens, Maps requests, and external API usage.

Before public launch, instrument cost per:

- Active user per day
- Morning briefing
- Conversation
- Sync cycle
- Weekly review

A $5 student plan is viable only when gross margin remains healthy under realistic daily usage. Model routing and context compression are therefore product requirements, not later optimizations.

## Final product test

Every release should answer:

- Does this reduce mental load?
- Does it improve the user's ability to follow through?
- Does it protect a balanced life?
- Does it preserve trust and control?
- Does it make Saavii more indispensable for the right reasons?
