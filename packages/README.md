# packages — Core systems

One package per Volume IV core system, so system boundaries are directory boundaries. The full map, the "three kinds of code" rule, and the communication matrix live in `/ARCHITECTURE.md` §3–§6 — read them before adding any cross-package import.

Boundary systems (side effects allowed, one kind each): `signals`, `store`, `memory`, `notifications`, `trust`, `reasoning` (LLM calls only, no durable writes).
Pure engines (no I/O): `priority`, `capacity`, `planning`, `execution`, `conflicts`, `insights`.
Shared types: `contracts` (depends on nothing; everyone depends on it).
