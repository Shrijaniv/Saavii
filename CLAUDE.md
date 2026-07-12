# CLAUDE.md — Non-negotiable constraints

Read this before doing anything in this repository. These constraints are distilled from the canonical handbook in `docs/handbook/` and are **not open for reinterpretation**. If work you are asked to do would violate one of them, stop and surface the conflict — never resolve it silently.

## The five constraints

1. **The PLAN is the canonical system of record** (the "intention layer"). External calendars — Google Calendar included — are DOWNSTREAM two-way sync targets, never the source of truth. Calendar events flow *in* as constraints; Saavii's schedule blocks flow *out* as a mirror. The authoritative record of what the user intends to do, and whether it happened, lives in Saavii's Operational Store.
   *Source: Volume IV "The plan is canonical"; Volume I, Chapter 11, Pillar 1.*

2. **The execution loop — Plan → Do → Reconcile → Replan — is the core moat.** The daily reconciliation record is proprietary data that exists in no external API. It is co-equal in priority with planning and is **never cut**, weakened, or skipped to hit a date. A planner without reconciliation is a read-only overlay a competitor can copy.
   *Source: Volume I, Chapter 11, Pillar 2; Volume V sequencing note (Phases 3–4).*

3. **Deterministic software owns scheduling, state, permissions, and critical actions.** The LLM (Reasoning Engine) only returns structured proposals that validated services execute. The model **never directly mutates durable state** — no writes to the store, the plan, the Life Graph, or notifications from inside a reasoning path.
   *Source: Volume IV "Architectural principle" and "Reasoning Engine".*

4. **Defensibility comes from data we GENERATE, not data we read.** Reading Gmail/Canvas/Calendar is table stakes — every competitor can do it. The proprietary layer is what we build on top: the plan, reconciliation records, the personalized capacity model, and non-re-derivable memory. Features that only read external data are not defensibility and must not be treated as such.
   *Source: Volume I, Chapter 11, First Principle.*

5. **Privacy is a product guarantee.** Minimal OAuth scopes. Structured events over raw bodies (extract from Gmail, discard message bodies). User-controlled memory: view / edit / export / delete, with opt-in for sensitive categories. Provenance (source, confidence, timestamps, sensitivity, lifecycle) on every memory node and edge.
   *Source: Volume I, Chapter 10; Volume IV "Memory Service" and "Security requirements".*

## Repository rules

- `docs/handbook/` is the single source of truth. `ARCHITECTURE.md` is the authoritative technical contract derived from it; every folder README conforms to `ARCHITECTURE.md`.
- Read the local folder `README.md` before editing anything in that folder.
- `AGENTS.md` contains the working rules and the checklist a change must pass.
- Where the handbook is silent, docs mark it **OPEN QUESTION**. Do not invent answers; add to the open questions instead.
- If anything you are about to produce contradicts the handbook or this file, **stop and surface the contradiction** to the user.

## Handbook pointers

| Topic | Where |
|---|---|
| Vision, manifesto, philosophy, product principles | `docs/handbook/README.md` (Volume I, Chapters 1–5) |
| Positioning, wedge, metrics, privacy, defensibility | `docs/handbook/volume-1-strategy-positioning.md` |
| MVP scope, capabilities, user stories | `docs/handbook/volume-2-product-requirements.md` |
| Screens, flows, notifications, UX rules | `docs/handbook/volume-3-experience-design.md` |
| Core systems, stack, workers, APIs, security | `docs/handbook/volume-4-technical-architecture.md` |
| Pricing, GTM, release criteria, phases, risks | `docs/handbook/volume-5-business-roadmap.md` |
