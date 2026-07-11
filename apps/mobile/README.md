# apps/mobile — Saavii Client (React Native + Expo)

**Single responsibility:** The user-facing client and **primary MVP surface** (Volume IV). Implements the Volume III experience spec: five-tab navigation, onboarding, the Today surface, and memory/privacy controls.

**Inputs:** `apps/api` responses; push notifications. **Outputs:** User actions (block completions, reconciliation answers, capacity questions, overrides, memory edits) sent to `apps/api`.

**May talk to:** `apps/api` over HTTP only; `packages/contracts` for shared types. **May NOT talk to:** any backend package directly — no store, no engines, no signals. The client renders state and reports actions; it computes nothing authoritative.

**Rules it must honor**
- **UX objective (Volume III):** calm, supportive, proactive, trustworthy. The interface reduces decisions rather than exposing system complexity.
- Navigation is exactly the Volume III IA: **Today, Calendar, Chat, Progress, Profile** — Today is the home surface, Chat is a command layer, *not* the home page.
- Every recommendation shown carries its explanation (Volume I, Ch. 4, Principle 7); every important change is inspectable (Ch. 5, Principle 9).
- No shame states for missed work (Volume I, Ch. 4, Principle 3); no engagement mechanics (streaks, celebration spam — Ch. 5, Principle 11).
- One-tap actions on work blocks: complete, partial, skip, reschedule, explain (Volume III, Today).

**Structure**

| Folder | Maps to |
|---|---|
| `src/navigation/` | Volume III information architecture (5 tabs). |
| `src/screens/onboarding/` | Volume III onboarding flow, in its specified order. |
| `src/screens/today/` · `calendar/` · `chat/` · `progress/` · `profile/` | Volume III screen specifications, one folder each. |
| `src/components/` | Shared UI: action cards, block controls, explanation surfaces. |
| `src/notifications/` | Client-side push handling, categories, deep links, quiet-hours settings UI. |

**For implementing agents**
- Do: read the matching Volume III screen spec before building any screen — the section lists are the requirements.
- Do: render explanations and confidence wherever the API provides them.
- Don't: implement priority/capacity/planning math client-side, even as a "preview" — ask the API.
- Don't: add a sixth tab, move Chat to home, or invent screens the spec doesn't name without surfacing it first.
