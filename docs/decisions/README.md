# docs/decisions — Decision records

Records for choices the handbook (`docs/handbook/`) deliberately leaves open. When `ARCHITECTURE.md` §7 marks something as settled without a handbook citation, the authority is a record in this folder — every settled decision traces to one or the other, never to nothing.

**Rules**
- One record per decision, numbered sequentially: `NNNN-short-slug.md`.
- Each record states: status, date, who decided, the context (what the handbook says or doesn't say), the decision, and its consequences.
- A record is never edited to change a decision — supersede it with a new record and cross-reference both.
- Implementing agents: if you need a decision that has no record here and no handbook answer, that is an **OPEN QUESTION** (`ARCHITECTURE.md` §9) — surface it, don't invent it.

## Index

| # | Decision | Status |
|---|---|---|
| [0001](./0001-dedicated-node-api.md) | Dedicated Node.js service for `apps/api` | Accepted |
| [0002](./0002-npm-workspaces.md) | npm workspaces for monorepo tooling | Accepted |
| [0003](./0003-supabase-split.md) | Supabase split by responsibility: Postgres → `store`, Auth → `trust` | Accepted |
