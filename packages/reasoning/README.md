# packages/reasoning — Reasoning Engine

**Single responsibility:** LLM-backed interpretation (Volume IV): intent classification, tool selection, memory extraction proposals, effort estimation support, explanation generation, cross-context summaries, conversation.

**Inputs:** Context assembled and passed in by callers (orchestrators). **Outputs:** **Structured proposals only** (`contracts` proposal types) — never actions, never writes.

**May talk to:** The model API (Claude), `contracts`. **May NOT talk to:** `store` (write), `memory` (write), `signals`, `notifications` — **no durable side effects, ever** (`CLAUDE.md` constraint 3; Volume IV: "The model must not directly mutate durable state. It returns structured proposals that validated services execute.").

**Rules it must honor**
- **Model routing for cost** (Volume V): smaller models for classification and extraction; larger models reserved for complex synthesis. Keep the LLM out of frequent deterministic loops entirely.
- **Structured redaction before model calls where possible** (Volume IV, Security requirements).
- Every proposal carries provenance fields (source, confidence) so downstream validation can judge it.
- Explanations it generates must be plain-language and specific (Volume I, Ch. 4, Principle 7).

**For implementing agents**
- Do: return a proposal for anything with consequences — an orchestrator plus a validated service executes it.
- Do: keep prompts and routing logic here, versioned and inspectable.
- Don't: persist, notify, schedule, or call any external system other than the model API. If you're writing a database import in this package, you have already gone wrong.
- Don't: let conversation paths bypass proposal types "just this once."

**OPEN QUESTIONS** (also in `ARCHITECTURE.md` §9)
- Model routing thresholds and specific model IDs — Volume IV/V name the strategy, not the models.
