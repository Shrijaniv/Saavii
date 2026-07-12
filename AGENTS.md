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
- **Only `packages/store` touches the database.** No Prisma imports, SQL, or Supabase data clients anywhere else. Memory node/edge tables are reached only through `packages/memory`'s API. Persistence for boundary systems is orchestrator-mediated: `memory` is the only boundary package that calls `store`; orchestrators load inputs for `signals` and `notifications` and persist what they return.
- **Each external boundary has exactly one owner.** `signals` owns external data-source integrations (Canvas, Google Calendar, Gmail — including the calendar mirror-out). `reasoning` owns the model provider (proposals only, never durable writes). `notifications` owns the push provider. `trust` owns the auth provider and audit sinks. No other package calls any external service, and no boundary system calls a provider it doesn't own.
- **Surface spec conflicts; never resolve them silently.** If the handbook, `ARCHITECTURE.md`, a folder README, or your task instructions disagree with each other, stop and report the conflict. The same applies when the spec is silent on something you need: record it as an **OPEN QUESTION** in the owning folder's README and in `ARCHITECTURE.md` §9 — do not invent an answer.

## When implementation begins

The change that introduces package manifests must also introduce the automated architecture checks described in `ARCHITECTURE.md` §6 "Enforcement" (forbidden-import / dependency rules in CI). Until those checks exist, this document and the folder READMEs are the only guard — which is exactly why they must be read every session.

## Testing

Every code change ships with **concrete unit tests for the behavior it adds or changes** — no untested implementation code, and no placeholder or tautological tests to satisfy the letter of this rule.

- The architecture makes this cheap where it matters most: pure engines (`priority`, `capacity`, `planning`, `execution`, `conflicts`, `insights`) are deterministic functions with no I/O, so test them directly with real inputs and asserted outputs — **no mocks**. If an engine needs a mock, it has an illegal dependency; fix the boundary, not the test.
- Test the contract the folder README states: explanations present on every recommendation (Volume I, Ch. 4, Principle 7), protected time never silently consumed, reconciliation fields never dropped, idempotent ingestion under replay.
- Boundary systems and orchestrators: test your logic (normalization, validation gates, routing rules, sequencing) against faked provider responses; don't test the provider itself.
- A bug fix starts with a test that reproduces the bug and fails before the fix.

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
- [ ] Every behavior I added or changed has a concrete unit test, and the full test suite passes.
- [ ] Everything the spec didn't answer is recorded as an OPEN QUESTION, not guessed.
- [ ] Folder READMEs and `ARCHITECTURE.md` are updated if my change altered a contract, and the change contradicts nothing in `docs/handbook/`.
