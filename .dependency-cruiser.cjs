/**
 * Automated architecture checks — the enforcement layer required by
 * ARCHITECTURE.md §6 "Enforcement". Encodes the §6 communication matrix and
 * the §4 "three kinds of code" rule as forbidden-dependency rules.
 *
 * These rules are the contract. If a legitimate change conflicts with one,
 * that's a spec conflict: surface it (see AGENTS.md), don't weaken the rule.
 */
module.exports = {
  forbidden: [
    // ── Pure engines (§4): no dependencies except packages/contracts ──
    {
      name: 'pure-engines-only-contracts',
      comment:
        'priority/capacity/planning/execution/conflicts/insights are pure engines: they may depend only on packages/contracts (ARCHITECTURE.md §4).',
      severity: 'error',
      from: { path: '^packages/(priority|capacity|planning|execution|conflicts|insights)/' },
      to: { path: '^(packages/(?!contracts/)|apps/|workers/)' },
    },
    {
      name: 'pure-engines-no-node-core',
      comment:
        'Pure engines do no I/O — no Node core modules (fs, net, http, child_process, …) (ARCHITECTURE.md §4).',
      severity: 'error',
      from: { path: '^packages/(priority|capacity|planning|execution|conflicts|insights)/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'pure-engines-no-npm-io',
      comment:
        'Pure engines may not pull in any npm package (their only legal import is @saavii/contracts, matched by the workspace rule above).',
      severity: 'error',
      from: { path: '^packages/(priority|capacity|planning|execution|conflicts|insights)/' },
      to: { path: 'node_modules/(?!@saavii/contracts/)' },
    },

    // ── contracts (§6): depends on nothing ──
    {
      name: 'contracts-depends-on-nothing',
      comment: 'packages/contracts is types only and depends on nothing (ARCHITECTURE.md §6).',
      severity: 'error',
      from: { path: '^packages/contracts/' },
      to: { path: '^(packages/(?!contracts/)|apps/|workers/|node_modules/)' },
    },

    // ── Boundary systems: allowed package dependencies only (§6 matrix) ──
    {
      name: 'store-no-domain-imports',
      comment: 'packages/store talks to PostgreSQL only — no business logic, no other packages except contracts (ARCHITECTURE.md §6).',
      severity: 'error',
      from: { path: '^packages/store/' },
      to: { path: '^(packages/(?!(contracts|store)/)|apps/|workers/)' },
    },
    {
      name: 'memory-only-store-contracts-trust',
      comment: 'packages/memory may call store (the documented §4 exception), contracts, and trust — nothing else.',
      severity: 'error',
      from: { path: '^packages/memory/' },
      to: { path: '^(packages/(?!(contracts|store|trust|memory)/)|apps/|workers/)' },
    },
    {
      name: 'signals-restrictions',
      comment: 'packages/signals may call contracts and trust only; NOT store — orchestrators mediate persistence (ARCHITECTURE.md §4/§6).',
      severity: 'error',
      from: { path: '^packages/signals/' },
      to: { path: '^(packages/(?!(contracts|trust|signals)/)|apps/|workers/)' },
    },
    {
      name: 'notifications-restrictions',
      comment: 'packages/notifications may call contracts and trust only; NOT store — orchestrators pass preferences in and persist outcomes (ARCHITECTURE.md §4/§6).',
      severity: 'error',
      from: { path: '^packages/notifications/' },
      to: { path: '^(packages/(?!(contracts|trust|notifications)/)|apps/|workers/)' },
    },
    {
      name: 'reasoning-restrictions',
      comment: 'packages/reasoning returns proposals only: contracts is its sole package dependency — no durable side effects (CLAUDE.md constraint 3).',
      severity: 'error',
      from: { path: '^packages/reasoning/' },
      to: { path: '^(packages/(?!(contracts|reasoning)/)|apps/|workers/)' },
    },
    {
      name: 'trust-domain-ignorant',
      comment: 'packages/trust depends on nothing domain-specific — contracts only (ARCHITECTURE.md §6).',
      severity: 'error',
      from: { path: '^packages/trust/' },
      to: { path: '^(packages/(?!(contracts|trust)/)|apps/|workers/)' },
    },

    // ── Direction of dependencies ──
    {
      name: 'packages-never-import-surfaces',
      comment: 'Packages never depend on apps or workers — orchestrators call packages, not vice versa (ARCHITECTURE.md §4).',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^(apps/|workers/)' },
    },
    {
      name: 'mobile-no-backend',
      comment: 'apps/mobile talks to apps/api over HTTP only; the only backend package it may import is contracts (types).',
      severity: 'error',
      from: { path: '^apps/mobile/' },
      to: { path: '^(packages/(?!contracts/)|workers/|apps/api/)' },
    },
    {
      name: 'api-no-mobile',
      severity: 'error',
      from: { path: '^apps/api/' },
      to: { path: '^apps/mobile/' },
    },

    // ── Vendor SDK ownership (AGENTS.md "each external boundary has exactly one owner") ──
    {
      name: 'only-store-uses-prisma',
      comment: 'Only packages/store may import Prisma — it is the sole database boundary (ARCHITECTURE.md §4).',
      severity: 'error',
      from: { pathNot: '^packages/store/' },
      to: { path: 'node_modules/(@prisma|prisma)([/]|$)' },
    },
    {
      name: 'only-trust-uses-supabase',
      comment: 'Only packages/trust may import Supabase Auth clients (decision 0003).',
      severity: 'error',
      from: { pathNot: '^packages/trust/' },
      to: { path: 'node_modules/@supabase/' },
    },
    {
      name: 'only-reasoning-uses-model-sdk',
      comment: 'Only packages/reasoning may import the model provider SDK.',
      severity: 'error',
      from: { pathNot: '^packages/reasoning/' },
      to: { path: 'node_modules/@anthropic-ai/' },
    },
    {
      name: 'only-notifications-uses-push-sdk',
      comment: 'Only packages/notifications may import a push provider SDK (either candidate — OPEN QUESTION #7).',
      severity: 'error',
      from: { pathNot: '^packages/notifications/' },
      to: { path: 'node_modules/(expo-server-sdk|firebase-admin)([/]|$)' },
    },
    {
      name: 'only-signals-uses-provider-apis',
      comment: 'Only packages/signals may import external data-source client libraries (Google APIs, Canvas clients).',
      severity: 'error',
      from: { pathNot: '^packages/signals/' },
      to: { path: 'node_modules/(googleapis|@googleapis)([/]|$)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
  },
};
