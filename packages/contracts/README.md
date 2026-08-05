# packages/contracts — Shared Types & Normalized Event Model

> Not a named Volume IV system. Exists to give the "normalized event model and idempotent ingestion" (Volume V, Phase 2) and cross-system types a single neutral home, so packages never invent duplicate shapes.

**Single responsibility:** Define the shapes systems exchange — normalized domain events, core entities (task, plan, schedule block, execution record, conflict, memory proposal), and structured proposal types returned by the Reasoning Engine. Types and schemas only.

**Inputs:** None. **Outputs:** TypeScript types/schemas consumed by every other package.

**May talk to:** Nothing — zero dependencies, ever. **May NOT:** contain logic, I/O, or runtime behavior beyond validation schemas.

**Rules it must honor**
- Every normalized event carries identity fields sufficient for **idempotent ingestion** (Volume V, Phase 2) and a `source` + timestamps.
- Memory proposal types carry `source`, `confidence`, and `sensitivity` so provenance survives from proposal to graph (Volume IV, Memory Service).
- Reasoning proposal types are the *only* channel by which LLM output reaches the rest of the system (`CLAUDE.md` constraint 3).
- **Action Protocol proposals use a versioned schema** (Volume II & IV "Action Protocol"; `ARCHITECTURE.md` §5). Every proposal carries: action type (e.g. `CREATE_BLOCK`, `MOVE_BLOCK`, `COMPLETE_BLOCK`, `UPDATE_PRIORITY_OVERRIDE`, `CREATE_MEMORY`, `LINK_ENTITIES`), parameters, source modality, original request, confidence, referenced entities, context identifiers, and schema version. Constraint strength (hard vs flexible) is part of the parameter vocabulary so "at 3 PM" and "around 3 PM" are distinguishable downstream.

**For implementing agents**
- Do: treat changes here as breaking for everyone — check each consumer's README before altering a shape.
- Do: keep event/entity/proposal families in separate modules (`events.ts`, `entities.ts`, `proposals.ts`).
- Don't: add helper functions with behavior. If it computes, it belongs in an engine.
- Don't: import from any other package.
