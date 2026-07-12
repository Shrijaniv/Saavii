# packages/memory — Memory Service & Life Graph

**Single responsibility:** Expose the memory API — `propose`, `remember`, `update`, `link`, `unlink`, `archive`, `forget`, `search`, `explain provenance` (Volume IV) — over a graph of nodes and edges. Callers talk to this service, never to a particular graph database.

**Inputs:** **Validated** memory proposals (from `workers/memory`), queries from orchestrators. **Outputs:** Memories and graph traversals, always with provenance.

**May talk to:** `store` (persistence), `contracts`, `trust`. **May NOT talk to:** `reasoning` (proposals come *to* memory via the worker, never pulled), `signals`. Nobody may bypass this API to query node/edge tables directly.

**Data model (Volume IV):** node kinds include Person, Place, Organization, Goal, Interest, Habit, Project, Course, Event; edge kinds include FRIEND_OF, FAMILY_OF, WORKS_AT, STUDIES_AT, INTERESTED_IN, PURSUING, FREQUENTS, ASSOCIATED_WITH, SUPPORTS, CONFLICTS_WITH.

**Rules it must honor**
- **Every node and edge carries** source, confidence, creation time, update time, sensitivity, and lifecycle status (Volume IV; `CLAUDE.md` constraint 5).
- Prefer **archival over destructive deletion** when history is useful — but honor permanent deletion requests absolutely (Volume IV; Volume I, Ch. 10).
- Users can view, edit, export, and delete memories, and disable memory categories; sensitive categories are opt-in (Volume I, Ch. 10).
- MVP storage is PostgreSQL tables via `store`; a graph database can replace it later **without changing callers** — interface stability is the point.
- Non-re-derivable memory (corrections, preferences, stated constraints) is a defensibility asset (Volume I, Ch. 11, Pillar 2) — engineer to maximize and protect this slice.

**For implementing agents**
- Do: make `explain provenance` answer "what memories influenced this?" (Volume I, Ch. 5, Principle 9).
- Do: reject any proposal lacking source/confidence/sensitivity fields.
- Don't: accept raw LLM output — only validated proposals from `workers/memory`.
- Don't: leak storage details (table names, IDs) through the API surface.
