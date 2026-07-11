# packages/trust — Trust Layer

**Single responsibility:** Cross-cutting controls (Volume IV): authentication, authorization, token security, encryption, consent, audit logs, data retention, export, and deletion.

**Inputs:** Auth/consent/audit calls from every other part of the system. **Outputs:** Verified identities and sessions, authorization decisions, consent state, audit records, executed export/deletion workflows.

**May talk to:** The auth provider (**Supabase Auth** — recorded decision, `ARCHITECTURE.md` §7) and audit sinks. **May NOT:** depend on any domain package — everyone may call `trust`; `trust` calls no one.

**What lives here**
- Supabase Auth client wiring, session/token verification, and the documented RLS policy. `apps/api` consumes auth middleware *from* this package; `apps/mobile` gets its sign-in flow contract from here.
- OAuth token handling for integrations: **encrypted at rest, isolated from application logs** (Volume IV, Security requirements).
- Consent registry: explicit **opt-in for location and sensitive memory categories** (Volume IV; Volume I, Ch. 10).
- Audit trails for important automated actions (Volume I, Ch. 10 "maintain auditability").
- User-level **export and deletion** workflows (Volume I, Ch. 10: complete account deletion, memory export).

**Rules it must honor**
- Least-privilege scopes for every integration (Volume IV; Volume I, Ch. 10 "request the minimum permissions required").
- No sensitive payloads in analytics (Volume IV).
- Privacy is the default, not a premium feature (Volume I, Ch. 2, "Privacy Is a Promise").
- **Saavii should never surprise the user with what it knows or why it acted** (Volume I, Ch. 10, Trust principle) — auditability serves this directly.

**For implementing agents**
- Do: make deletion real — user-level, cascading, verified — not a soft flag that lingers (archival is `memory`'s pattern for *history*, not a substitute for deletion requests).
- Do: keep this package domain-ignorant; it should compile without knowing what a "plan" is.
- Don't: let tokens, session secrets, or raw identifiers reach logs or analytics from anywhere — provide the redaction helpers other packages use.
- Don't: implement business authorization rules ("can this user edit this plan?") outside this layer's primitives.
