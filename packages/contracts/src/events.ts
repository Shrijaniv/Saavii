/**
 * Module: contracts/events
 * Responsibility: The normalized domain event envelope emitted by the Signal
 * Layer.
 *
 * Every event carries identity fields sufficient for idempotent ingestion
 * (Volume V, Phase 2): re-fetching a provider must never duplicate events.
 * Per-source payload shapes arrive with their adapters in Phase 2.
 *
 * Types only — no behavior.
 */

import type { UserId } from './entities.js';

export type SignalSource = 'CANVAS' | 'GOOGLE_CALENDAR' | 'GMAIL' | 'USER_ACTION';

export interface NormalizedEvent<TPayload = unknown> {
  /** Stable per (source, external object, version of that object). Replaying a
   * sync produces the same key, which is what makes ingestion idempotent. */
  idempotencyKey: string;
  source: SignalSource;
  userId: UserId;
  /** When the change happened in the source system, when it says so. */
  occurredAt: Date | null;
  /** When Saavii observed it. */
  observedAt: Date;
  payload: TPayload;
}

/** Opaque cursor a sync run resumes from. Orchestrators load it and persist the
 * updated value; adapters hold no state of their own (ARCHITECTURE.md §4). */
export interface SyncCursor {
  source: SignalSource;
  userId: UserId;
  value: string | null;
  updatedAt: Date;
}
