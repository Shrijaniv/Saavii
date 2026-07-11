# apps — Deployable surfaces

Things that *run*, as opposed to systems that *compute* (`packages/`).

- `mobile/` — React Native + Expo client, the primary MVP surface (Volume IV).
- `api/` — dedicated Node.js backend exposing the Volume IV API domains.

Apps contain no business logic: mobile renders and reports; api orchestrates packages. `apps/web` (Next.js dashboard) is deliberately deferred — Volume IV names mobile as primary.
