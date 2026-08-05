# Volume IV — Technical Architecture

Part of the [Saavii Handbook](./README.md). Source: [Notion](https://app.notion.com/p/39ac77233acb813d9588e4fff7e45dd4).

## Technical Architecture

### Architectural principle

Saavii is a life-state system that uses AI for interpretation. It is not an LLM wrapper. Deterministic software owns scheduling, state, permissions, and critical actions.

#### The plan is canonical

Saavii's system of record is the **plan** — the intention layer described in Volume I, Chapter 11. External calendars are treated as **downstream two-way sync targets, not the source of truth.** Google Calendar events flow *in* as constraints via the Signal Layer, and Saavii's schedule blocks flow *out* to the user's calendar as a mirror. The authoritative representation of what the user intends to do, and whether it happened, lives in Saavii's Operational Store — never in the calendar. This is a deliberate defensibility decision: an incumbent overlay on the calendar has nothing to attach to when the plan itself lives here.

## Core systems

### Signal Layer

Connects external systems, detects changes, and emits normalized events.

Initial signals:

- Canvas
- Google Calendar (inbound as constraints; Saavii's plan blocks are mirrored back out as a sync target)
- Gmail
- User actions and conversations

Future signals:

- GitHub
- Google Drive
- Maps
- Health and wearable data
- Campus event sources

### Operational Store

PostgreSQL stores transactional and frequently changing data:

- Users and profiles
- Integrations
- Classes
- Tasks
- External events
- Plans and schedule blocks
- Execution records
- Conflicts
- Notifications
- Daily and capacity snapshots
- Insights

### Memory Service and Life Graph

The application talks to a Memory Service rather than directly to a particular graph database.

MVP implementation may use PostgreSQL tables for nodes and edges. A graph database can be introduced later without changing callers.

Graph node examples: Person, Place, Organization, Goal, Interest, Habit, Project, Course, Event.

Graph edge examples: FRIEND_OF, FAMILY_OF, WORKS_AT, STUDIES_AT, INTERESTED_IN, PURSUING, FREQUENTS, ASSOCIATED_WITH, SUPPORTS, CONFLICTS_WITH.

Every node and edge should carry source, confidence, creation time, update time, sensitivity, and lifecycle status. Prefer archival over destructive deletion when history is useful, while honoring permanent deletion requests.

Memory operations: propose, remember, update, link, unlink, archive, forget, search, explain provenance.

### Reasoning Engine

Uses Claude or another capable model for:

- Intent classification
- Tool selection
- Memory extraction proposals
- Effort estimation support
- Explanation generation
- Cross-context summaries
- Conversation

The model must not directly mutate durable state. It returns structured proposals that validated services execute.

### Priority Engine

Produces an explainable priority score using deadline urgency, academic weight, effort, remaining work, dependencies, capacity risk, goal alignment, and user overrides.

Priority numbers are internal. Users see labels and reasons.

### Capacity Engine

Calculates free capacity after fixed commitments, routines, travel assumptions, buffers, protected personal time, and unscheduled required work.

It supports point-in-time and range queries such as "Can I do this this week?"

### Planning Engine

A deterministic constraint-based scheduler.

The Planning Engine remains single-user and owns only one person's canonical plan. Shared coordination must not give one user's planner direct access to another user's private life state.

Inputs: hard constraints, task effort and deadlines, priorities, user preferences, capacity, execution history, protected personal activities.

Outputs: daily plans, weekly allocations, schedule blocks, confidence and warnings.

Large tasks are split into bounded work units. The planner reserves buffers and avoids unrealistic back-to-back locations.

### Execution Engine

Tracks planned versus actual behavior and triggers replanning.

States: planned, completed, partial, missed, rescheduled, cancelled.

Plans are hypotheses; execution records are truth.

### Conflict Engine

Treats conflicting signals as first-class data. It detects deadline mismatches, priority overrides, schedule overlaps, source changes, and user-intent conflicts.

Important conflicts are never silently resolved.

### Insight Engine

Generates daily and weekly summaries, milestones, risks, trends, and evidence-based encouragement.

### Notification Engine

Routes proactive outputs according to urgency, quiet hours, user preferences, batching rules, and interruption value.

### Trust Layer

Cross-cutting controls for authentication, authorization, token security, encryption, consent, audit logs, data retention, export, and deletion.

For shared planning, the Trust Layer also owns availability grants, participant consent, revocation, disclosure policy, and auditability. A coordination request may consume only the minimum privacy-safe projection each participant has authorized.

## Reference technology stack

### Client

- React Native with Expo for iOS and Android
- TypeScript
- Native push notifications
- Widgets and App Intents added incrementally

A web dashboard may use Next.js, but mobile should be the primary MVP surface.

### Backend

- TypeScript service layer
- Next.js API routes or a dedicated Node backend
- PostgreSQL on Supabase
- Prisma ORM
- Supabase Auth
- Inngest for durable background workflows
- Firebase Cloud Messaging or Expo Notifications
- Claude for reasoning and structured tool use

### Integrations

Use direct production APIs for OAuth, synchronization, batching, and reliability. MCP may be supported as an internal tool abstraction but should not be relied on for event delivery or persistent synchronization.

### Canvas synchronization

Student accounts may not have access to institution-level Live Events. MVP uses incremental polling with change detection. Poll frequently enough to feel event-driven while respecting rate limits. If a deployment supports webhooks or Live Events, consume them as an optimization.

### Future Coordination Engine

A future Coordination Engine compares privacy-safe availability projections from multiple users and proposes shared time blocks. It does not read another user's raw plan, tasks, memories, or calendar details.

Inputs:

- Participant IDs
- Requested activity, duration, time range, and location constraints
- Per-participant availability projections
- Sharing policies and one-time grants
- Travel and buffer assumptions

Outputs:

- Ranked coordination candidates
- Participant-specific tradeoffs
- Explanation safe for all recipients
- Proposed shared plan block

The engine is deterministic. It creates proposals only; each participant's orchestrator validates consent and independently applies approved changes to that participant's canonical plan.

Future coordination entities: `CoordinationRequest`, `CoordinationParticipant`, `AvailabilityGrant`, `SharingPolicy`, `AvailabilityProjection`, `CoordinationCandidate`, `SharedPlan`, `ParticipantResponse`.

Privacy boundary:

```
User A canonical plan → privacy projection ─┐
                                            ├→ Coordination Engine → shared candidates
User B canonical plan → privacy projection ─┘
```

The Coordination Engine receives availability intervals and permitted constraints, not the underlying reasons. The governing rule is: **coordinate outcomes without exposing lives.**

## Background workflows

- **Sync worker** — Incrementally fetches changes and emits normalized domain events.
- **Planning worker** — Runs after meaningful changes, each morning, and after execution reconciliation.
- **End-of-day worker** — Finds unchecked blocks, sends review prompts, and prepares the next plan after user response or configured timeout behavior.
- **Insight worker** — Builds daily snapshots, weekly reflections, milestones, and behavioral patterns.
- **Memory worker** — Processes validated memory proposals and maintains graph nodes, edges, provenance, confidence, and lifecycle.

## API domains

- `/profile`
- `/goals`
- `/classes`
- `/interests`
- `/integrations`
- `/sync`
- `/tasks`
- `/plans`
- `/execution`
- `/capacity`
- `/conflicts`
- `/memories`
- `/briefings`
- `/notifications`
- `/chat`

Future coordination API domains:

- `/sharing-policies`
- `/availability-grants`
- `/coordination-requests`
- `/coordination-candidates`
- `/shared-plans`

## Security requirements

- OAuth tokens encrypted and isolated from application logs.
- Least-privilege scopes.
- Row-level access controls.
- No sensitive payloads in analytics.
- Structured redaction before model calls where possible.
- User-level data deletion workflows.
- Memory provenance and audit trails.
- Explicit opt-in for location and sensitive memory categories.
- Free/busy-only sharing by default for coordination.
- Per-person and per-request sharing scopes with revocation.
- No cross-user raw-plan, task, email, memory, or private-event access.
- Auditable participant approval before a shared block becomes canonical for any user.

## Cost strategy

Keep the LLM out of frequent deterministic loops. Cache normalized signals and derived context. Use smaller models for classification and extraction, reserving larger models for complex synthesis.

Expected early fixed infrastructure is modest; variable cost is primarily model usage, email/calendar sync volume, maps requests, and notifications. A detailed financial model should be updated after measuring real context sizes and interaction frequency.

## Action Protocol

The Action Protocol is the formal contract between the Reasoning Engine and deterministic services.

```
Voice / Chat / UI / Widget / Automation
                ↓
        Reasoning Engine
                ↓
      Structured Action Proposal
                ↓
     Validation & Orchestration
                ↓
        Planning / Memory
                ↓
        Execution Engine
                ↓
      Persistence & Integrations
```

The LLM never writes directly to databases or external integrations. It produces structured proposals only.

Every proposal contains:

- Action type
- Parameters
- Source modality
- Original request
- Confidence
- Referenced entities
- Context identifiers
- Schema version

This protocol allows every interaction surface to share the same backend behavior while keeping deterministic systems independent of natural language.
