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
- Professional mode
- Health and wearable signals

### Long term

A cross-stage Life Operating System that evolves from student to professional, founder, parent, and beyond.
