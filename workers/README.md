# workers — Background Workflows (Inngest)

The five durable background workflows named in Volume IV, one folder each. Workers are **orchestrators** (`ARCHITECTURE.md` §4): they fetch via boundary packages, invoke pure engines, persist via `store`, and route user-facing output via `notifications`. No engine logic lives here; no worker bypasses a boundary package.

| Worker | Volume IV responsibility |
|---|---|
| `sync/` | Incrementally fetches changes and emits normalized domain events. |
| `planning/` | Runs after meaningful changes, each morning, and after execution reconciliation. |
| `end-of-day/` | Finds unchecked blocks, sends review prompts, prepares the next plan after user response or configured timeout. |
| `insight/` | Builds daily snapshots, weekly reflections, milestones, and behavioral patterns. |
| `memory/` | Processes **validated** memory proposals and maintains graph nodes, edges, provenance, confidence, and lifecycle. |

**Shared rules**
- Idempotency: a re-run must not duplicate events, plans, notifications, or memories (Volume V, Phase 2 ingestion; Volume V risk mitigation "idempotent sync").
- Retries and graceful degraded states are worker concerns (Volume V, Integration fragility mitigation).
- Workers own sequencing; packages own behavior. If a worker file contains a formula, it belongs in an engine.

Read each worker's own README before editing it.
