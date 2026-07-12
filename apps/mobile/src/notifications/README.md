# notifications (client)

Client-side push handling: registration, categories, deep links into Today/reconciliation flows, and the notification-preference + quiet-hours settings UI. Which notifications exist and when they fire is decided server-side by `packages/notifications` — the client never invents local notifications outside the Volume III permitted set.

OPEN QUESTION (`ARCHITECTURE.md` §9): FCM vs Expo Notifications.
