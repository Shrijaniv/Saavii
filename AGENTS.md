# AGENTS.md — Working rules for implementation agents

You are implementing against a documented scaffold. The documentation is the spec. Follow these rules exactly.

## Before you touch anything

1. **Read `CLAUDE.md`.** It contains the five non-negotiable constraints. Every one of them applies to every change.
2. **Read `ARCHITECTURE.md`.** It is the technical contract: the system map, the three kinds of code, the data flow, and the communication matrix. Your change must be legal under all four.
3. **Read the `README.md` of every folder you are about to edit.** It states that module's single responsibility, its inputs/outputs, who it may and may not talk to, and module-specific do/don't rules.
4. If the folder doc cites a handbook volume for a behavior you're implementing, read that section of `docs/handbook/` too.

## Hard rules — violating any of these means your change is wrong

- **The plan is canonical.** Never write code that treats Google Calendar (or any external system) as the source of truth. Calendar data comes in as constraints; plan blocks go out as a mirror. User edits to mirrored blocks re-enter as signals.
- **The LLM never mutates durable state.** Anything in `packages/reasoning` returns structured proposals. If you find yourself persisting, notifying, or calling an external API from a reasoning path — stop, return a proposal, and let a validated service in an orchestrator execute it.
- **Keep the execution loop intact.** Plan → Do → Reconcile → Replan. Do not cut, stub out, or degrade reconciliation to ship something else. Reconciliation records are the company's proprietary data (Volume I, Chapter 11, Pillar 2).
- **Pure engines stay pure.** `priority`, `capacity`, `planning`, `execution`, `conflicts`, `insights` do no I/O. Data goes in as arguments; results come out as return values. Orchestrators (`apps/api`, `workers/*`) do the fetching and persisting.
- **Only `packages/store` touches the database.** No Prisma imports, SQL, or Supabase data clients anywhere else. Memory node/edge tables are reached only through `packages/memory`'s API.
- **Only `packages/signals` talks to external providers; only `packages/notifications` sends pushes; only `packages/trust` talks to the auth provider.**
- **Surface spec conflicts; never resolve them silently.** If the handbook, `ARCHITECTURE.md`, a folder README, or your task instructions disagree with each other, stop and report the conflict. The same applies when the spec is silent on something you need: record it as an **OPEN QUESTION** in the owning folder's README and in `ARCHITECTURE.md` §9 — do not invent an answer.

## Style expectations

- Every recommendation-producing path must also produce a plain-language explanation (Volume I, Chapter 4, Principle 7). An unexplained priority, plan change, or notification is a bug.
- Never write user-facing copy that shames the user for missed work (Volume I, Chapter 4, Principle 3).
- No engagement mechanics: no streaks, no generic nudges, no artificial urgency (Volume I, Chapter 9; Volume III notification rules).

## Done checklist — pass every item before considering a change complete

- [ ] I read `CLAUDE.md` and `ARCHITECTURE.md` in this session.
- [ ] I read the `README.md` of every folder I changed.
- [ ] Nothing I wrote treats an external calendar or provider as the source of truth.
- [ ] No LLM output mutates durable state without passing through a validated service in an orchestrator.
- [ ] The execution loop (Plan → Do → Reconcile → Replan) is at least as strong as before my change.
- [ ] Pure engines gained no I/O; boundary systems gained no second kind of side effect.
- [ ] Every new cross-package dependency is legal under the `ARCHITECTURE.md` §6 communication matrix.
- [ ] Database access, external API calls, push sends, and auth calls all go through their designated boundary package.
- [ ] Everything the spec didn't answer is recorded as an OPEN QUESTION, not guessed.
- [ ] Folder READMEs and `ARCHITECTURE.md` are updated if my change altered a contract, and the change contradicts nothing in `docs/handbook/`.
