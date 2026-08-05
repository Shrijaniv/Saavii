# workflows — CI/CD pipeline

Decision record: `docs/decisions/0006-delivery-pipeline.md`.

```
pull request ──► Checks (typecheck → boundaries → tests)     [ci.yml]
                                                     merge only when green
push to main ──► Checks (same three, re-run) ──► deploy-backend ┐
                                            └──► deploy-mobile  ┘  [deploy.yml]
                                                 gated: DEPLOY_ENABLED + 'production' environment
```

**Stages**

- `ci.yml` (**Checks**) — the quality gate: typecheck, architecture-boundary checks (`ARCHITECTURE.md` §6), tests. Runs on every PR, and is re-run by the Deploy pipeline via `workflow_call` so nothing ships from a stale green.
- `deploy.yml` (**Deploy**) — runs on every push to `main` (and manually via `workflow_dispatch`). Deploy jobs run only after Checks pass, only when the repository variable `DEPLOY_ENABLED` is `'true'`, and only under the `production` GitHub environment. Until a hosting target is chosen (open question #10), the deploy steps fail loudly by design — flipping the gate without configuring a target must not silently "succeed".

**To enable production deploys, in order**

1. Decide hosting for `apps/api` + `workers/` and the mobile build pipeline (likely Expo EAS); record as `docs/decisions/` entries.
2. Replace the placeholder deploy steps with the real ones; add secrets to the `production` environment, never to the repo.
3. In Settings → Environments → `production`, add required reviewers if deploys should need human approval.
4. Set the repository variable `DEPLOY_ENABLED` to `true`.

**Branch protection (do this in Settings → Branches):** protect `main`, require the `Checks / check` status to pass before merging, and disallow direct pushes. The pipeline can only guarantee "checked before production" if unchecked code cannot reach `main`.
