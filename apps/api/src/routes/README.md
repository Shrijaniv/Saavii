# routes

One module per Volume IV API domain: profile, goals, classes, interests, integrations, sync, tasks, plans, execution, capacity, conflicts, memories, briefings, notifications, chat.

Routes are thin: validate → authorize (`trust` middleware) → orchestrate packages → respond. No engine logic, no Prisma imports, no provider SDKs here.
