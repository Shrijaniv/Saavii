# packages/priority — Priority Engine

**Single responsibility:** Produce an **explainable** priority score for each task (Volume IV) from: deadline urgency, academic weight (points/grade), estimated effort, remaining work, dependencies, capacity risk, goal alignment, and user overrides.

**Inputs:** Tasks plus the context above, passed in by callers. **Outputs:** Priority score + a plain-language reason, per task.

**May talk to:** Nothing — this is a **pure engine** (`ARCHITECTURE.md` §4). **May NOT:** perform any I/O; callers fetch data via `store` and pass it in.

**Rules it must honor**
- **Priority numbers are internal. Users see labels and reasons** (Volume IV).
- **Users may override priority at any time** (Volume II) — overrides are an input to the score, and an override in force must be respected, not fought.
- Every output includes a human-readable explanation; an unexplained priority is a bug (Volume I, Ch. 4, Principle 7; Ch. 5, Principle 2).
- Grade-weighted prioritization is the activation moment (Volume I, Ch. 8): "worth 25% vs worth 2%" must be visible in the reasoning.

**For implementing agents**
- Do: keep it a deterministic function — same inputs, same output, unit-testable without mocks.
- Do: surface *what changed* when a priority shifts, so notifications can explain it.
- Don't: call the LLM here. Effort *estimation support* may come from `reasoning` upstream, passed in as an input.
- Don't: expose raw scores through any API — labels + reasons only.

**OPEN QUESTIONS** (also in `ARCHITECTURE.md` §9)
- The formula/weights: Volume IV lists the factors but specifies no formula.
