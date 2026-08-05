# Volume II — Product Requirements

Part of the [Saavii Handbook](./README.md). Source: [Notion](https://app.notion.com/p/39ac77233acb817b901acaf6afc743e6).

## Product Requirements Document

### Product summary

Saavii is an AI Life Operating System for students and, later, young professionals. The MVP turns academic obligations and personal constraints into a realistic daily and weekly plan, tracks execution, adapts unfinished work, and protects time for life outside work.

### Primary user

A college student who uses Canvas, Gmail, and Google Calendar and balances classes, assignments, commuting, meals, internship preparation, health, hobbies, and relationships.

### Core job to be done

> Help me understand what matters, decide what to do next, and fit it into a realistic life without feeling overwhelmed.

## MVP scope

### Required integrations

- Canvas
- Google Calendar
- Gmail

### Required capabilities

**Context synchronization** — Import assignments, due dates, points where available, classes, calendar commitments, and relevant email signals.

**Automatic priority intelligence** — Calculate priority from deadline urgency, points or grade weight, estimated effort, remaining effort, available capacity, dependencies, user goals, and execution history. Show a plain-language explanation. Users may override priority at any time.

**Daily and weekly planning** — Build time-blocked plans around classes, meetings, sleep, getting ready, commute, meals and cooking, high-priority work, hobbies and personal goals, and healthy buffers.

**Execution tracking** — Generated work blocks are checkable. Users can mark them completed, partially completed, or not started.

**End-of-day reconciliation** — Before planning the next day, ask about unchecked blocks, capture actual progress, and replan remaining effort.

**Adaptive replanning** — Reallocate incomplete work while respecting deadlines and avoiding last-minute surprise changes. Low-risk adjustments may happen automatically with clear notification. Significant changes require approval or advance notice.

**Capacity intelligence** — Answer questions such as: Do I have time to hang out with Shloka this week? Can I attend this event? Can I take another shift? Return feasible windows, tradeoffs, and the safest recommendation.

**Morning briefing** — Send a proactive notification designed to make Saavii the first application users open. Include priorities, schedule, risks, meaningful changes, capacity, and one clear recommended focus.

**Weekly reflection** — Summarize accomplishments, missed work, planning accuracy, goal progress, protected personal time, and next-week risks. Motivation must be evidence-based rather than generic.

**Profile and control** — Users can manage class schedules, goals, sleep, commute assumptions, meal routines, interests, planning preferences, integrations, notifications, and memories.

## User stories

- **Onboarding** — As a student, I want to connect my accounts, add my class schedule, goals, routines, and interests so Saavii can create a realistic first plan.
- **Daily direction** — As a student, I want to know exactly what to focus on today and why so I do not spend energy deciding.
- **New assignment** — As a student, I want a newly published Canvas assignment automatically prioritized and incorporated into my plan.
- **Priority explanation** — As a student, I want to know why an assignment is high priority and be able to override the recommendation.
- **Completion feedback** — As a student, I want to check off planned blocks so Saavii learns what I actually completed.
- **Missed work** — As a student, I want unfinished work automatically reorganized without shame or manual calendar repair.
- **Social capacity** — As a student, I want Saavii to recommend when I can meet a friend without risking my deadlines.
- **Shared coordination** — As a user, I want to selectively compare my availability with another person's Saavii plan so we can find mutually feasible times to study, meet, exercise, travel, or work together without exposing our private schedules.
- **Personal balance** — As a user, I want hobbies, exercise, relationships, and rest treated as valuable commitments rather than leftover time.
- **Memory control** — As a user, I want to see and remove what Saavii remembers about me.

## Out of scope for MVP

- Continuous background location tracking
- Autonomous messaging to other people
- Banking and financial planning
- Healthcare diagnosis
- Full workplace knowledge search
- Broad local recommendation discovery
- Native replacement for Siri
- Multi-agent swarms

## Post-MVP roadmap

### V1.5

- GitHub and Google Drive progress signals
- Home and campus locations
- Maps-based commute estimation
- Siri Shortcuts, widgets, and lock-screen actions
- Richer memory review

### V2

- Lifestyle and campus recommendations
- Events, clubs, concerts, movies, books, restaurants
- Relationship-aware reminders
- Privacy-preserving shared planning and coordination
- Professional mode
- Health and wearable signals

### Long term

A cross-stage Life Operating System that evolves from student to professional, founder, parent, and beyond.

## Future capability — Shared Planning and Coordination

Shared planning allows two or more people to coordinate outcomes without exposing their full lives.

Examples:

- When can Shloka and I study together for two hours?
- When can my roommate and I go grocery shopping?
- Which evening works for our project group?
- Can my partner and I take a weekend trip without either of us missing important work?

Saavii compares only the availability and constraints each participant has explicitly permitted it to use. It returns ranked mutual windows, tradeoffs, and a recommended option. It may then create a proposed shared block for all participants to approve.

### Privacy requirements

Users control what is shared:

- Free/busy only
- Selected categories
- Exact details for specific events
- One-time availability
- Ongoing trusted access

Sensitive details such as assignment names, medical appointments, private goals, emails, memories, or relationship context are never revealed by default.

### Product rule

> Coordinate outcomes without exposing lives.

### Scope boundary

This is not an MVP feature. Individual planning, execution reconciliation, capacity accuracy, consent controls, and memory review must be reliable before Saavii coordinates across multiple users.

## Action Protocol

Saavii uses a single structured Action Protocol for all user-initiated changes, regardless of whether the request comes from voice, chat, a button, a widget, a notification action, or a future automation.

The Reasoning Engine interprets natural language and produces an action proposal. It does not directly change durable state.

Examples of actions: `CREATE_BLOCK`, `MOVE_BLOCK`, `RESIZE_BLOCK`, `DELETE_BLOCK`, `COMPLETE_BLOCK`, `UPDATE_TASK_ESTIMATE`, `UPDATE_PRIORITY_OVERRIDE`, `CREATE_REMINDER`, `CREATE_RECURRING_ROUTINE`, `CREATE_MEMORY`, `UPDATE_MEMORY`, `DELETE_MEMORY`, `LINK_ENTITIES`, `UNLINK_ENTITIES`.

### Example

User says: "Add an hour break around 3 PM." The Reasoning Engine proposes:

```json
{
  "action": "CREATE_BLOCK",
  "blockType": "BREAK",
  "durationMinutes": 60,
  "preferredStart": "15:00",
  "flexibilityMinutes": 30,
  "constraintStrength": "PREFERRED"
}
```

The Planning Engine determines whether and where the block is feasible. An orchestrator validates permissions, requests approval when required, persists the accepted plan change, and mirrors it to connected calendars.

### Requirements

- Every action proposal must use a versioned schema.
- Every proposal must include source, confidence, and the original user request.
- Ambiguous references such as "this time" must be resolved using current screen, selected object, conversation, and timezone context.
- When required information cannot be inferred safely, Saavii asks a concise clarification.
- Exact requests are treated as hard constraints unless impossible.
- Approximate requests such as "around," "sometime," or "after" become flexible constraints.
- A proposed action never mutates durable state until validated.
- Low-risk actions may be applied automatically with immediate visibility.
- Actions that materially move, remove, or endanger existing commitments require approval or advance notice.

### User story

As a user, I want to speak naturally when changing my plan so I do not need to manually configure scheduling rules, while still receiving predictable and explainable results.
