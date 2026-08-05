# Volume III — Experience & Design

Part of the [Saavii Handbook](./README.md). Source: [Notion](https://app.notion.com/p/39ac77233acb8142b1f0e87aaebdd5e4).

## Experience and Design Specification

### UX objective

Saavii should feel calm, supportive, proactive, and trustworthy. The interface should reduce decisions rather than expose the complexity of the underlying system.

## Information architecture

Primary mobile navigation:

1. Today
2. Calendar
3. Chat
4. Progress
5. Profile

## Onboarding flow

Welcome → Student profile → Connect Google Calendar → Connect Gmail → Connect Canvas → Add or confirm class schedule → Add wake/sleep and meal routines → Add commute assumptions → Select goals → Select hobbies and interests with desired frequency → Notification preferences → Privacy explanation → Build first plan → Today screen

### Onboarding principles

- Show value before requesting broad permissions.
- Explain why each integration is needed.
- Allow skipped optional steps.
- Generate the first useful plan immediately.
- Avoid a long configuration form; infer and refine over time.

## Screen specifications

### Today

The primary product surface. Sections:

- Contextual greeting
- "What changed" summary
- Today's available capacity
- Top priority with explanation
- Time-blocked schedule
- Checkable work blocks
- Plan confidence
- One-tap actions: complete, partial, skip, reschedule, explain

### Calendar

A combined timeline of fixed reality and generated work:

- Classes
- External meetings
- Meals
- Commute
- Personal commitments
- Saavii-generated work blocks
- Buffers

Only actionable work blocks receive completion controls. Fixed commitments remain visually distinct.

### Chat and voice

A conversational command and reasoning layer, not the home page.

Core prompts:

- What should I do today?
- Am I on track?
- Why is this my priority?
- Can I hang out with Shloka this week?
- When can Shloka and I study together?
- Move this to tomorrow.
- Remember that Shloka is my best friend.
- Forget that location.

Responses should include actionable cards when relevant rather than long prose.

### Progress

A reflection surface, not a guilt dashboard. Include:

- Completed work
- Personal time protected
- Study and focus time
- Planning accuracy
- Milestones
- Learned patterns
- Weekly happiness and stress check-in
- Evidence-based encouragement

### Profile

A control panel for the user's life model. Sections:

- Identity and university
- Goals
- Class schedule
- Routines
- Interests and desired frequency
- People and relationships
- Places
- Planning preferences
- Integrations
- Notification settings
- Privacy and data controls
- Memory review

## Key interaction flows

**New assignment** — Canvas update → assignment normalized → priority calculated → plan impact computed → user notified with reason → schedule updated or approval requested when impact is significant.

**End of day** — Review unchecked blocks → ask completed/partial/not started → capture time or percentage → update remaining effort → replan tomorrow → show concise summary.

**Capacity question** — Understand requested activity and duration → retrieve workload and fixed commitments → preserve buffers and protected activities → return ranked available windows → explain safest option → optionally create calendar block.

**Shared coordination** — Identify participants and requested activity → verify each participant's sharing grant → derive privacy-safe availability windows from each canonical plan → intersect feasible windows → account for duration, location, travel, deadlines, energy preferences, and protected time → rank options → explain tradeoffs without revealing private details → collect participant approval → create a shared plan block and replan each participant independently if needed.

**Conflict resolution** — Show the conflicting signals, explain consequences, recommend an option, and let the user accept, override, or defer.

**Memory update** — Conversation produces a memory proposal → validate confidence and sensitivity → store directly when explicit and low-risk or ask for confirmation when ambiguous → make it visible in Memory Review.

## Notification philosophy

**Signature notification: Morning Briefing** — Must provide immediate value and a clear next action.

**Other permitted notifications:**

- New high-impact task
- Priority change
- Deadline or capacity risk
- Leave-soon alert
- End-of-day reconciliation
- Weekly reflection
- Rare interest-based opportunity

**Rules:**

- Batch low-urgency information into briefings.
- Never use generic engagement nudges.
- Respect quiet hours.
- Let users control categories and frequency.
- Avoid last-minute automatic changes.

## Voice and native access

Saavii should have its own application as the visual home for planning, progress, and memory controls. It should also be accessible without opening the app through:

- Push notifications
- Widgets
- Lock-screen actions
- Siri Shortcuts and App Intents
- Action-button shortcut where supported

The product should feel present throughout the day without attempting to replace the operating system's native assistant.

## Future shared-planning experience

Shared planning should feel like asking Saavii to coordinate, not like opening another scheduling poll.

### Entry points

- Chat or voice request
- Share-plan action from Calendar
- Invite from a person or group
- Temporary coordination link for a non-Saavii participant

### Candidate-time card

Each suggested option should show:

- Date, time, duration, and location
- Participant availability status
- A concise reason it is recommended
- Tradeoffs, if any
- Actions to propose, approve, decline, or suggest another time

### Privacy UX

Before sharing, Saavii must clearly show what the other participant can learn. The default is free/busy availability only. Private event names, tasks, goals, memories, and reasons for unavailability remain hidden.

The product language should say "unavailable" rather than exposing why someone is unavailable. Participants can grant more detail for a specific coordination request, but never through an implied or bundled permission.
