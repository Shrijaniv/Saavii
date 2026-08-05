/**
 * Module: trust/audit
 * Responsibility: Build audit records for important automated actions.
 *
 * Volume I, Ch. 10: "Maintain auditability for important automated actions",
 * and the trust principle that "Saavii should never surprise the user with what
 * it knows or why it acted". Metadata is redacted on the way in, so an audit
 * trail can never become the place credentials leak.
 *
 * Pure construction — persisting records is the caller's job.
 */

import type { UserId } from '@saavii/contracts';

import { redactSecrets } from './redaction.js';

export interface AuditRecordInput {
  /** What happened, e.g. "consent.granted", "plan.replanned". */
  action: string;
  /** Who caused it: a user id, or a system identifier such as "worker:planning". */
  actor: string;
  /** Whose data it concerns. */
  subjectUserId: UserId;
  /** When it happened. Passed in rather than read from the clock so callers
   * stay deterministic and testable. */
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AuditRecord {
  action: string;
  actor: string;
  subjectUserId: UserId;
  occurredAt: Date;
  metadata: Record<string, unknown>;
}

export function buildAuditRecord(input: AuditRecordInput): AuditRecord {
  return {
    action: input.action,
    actor: input.actor,
    subjectUserId: input.subjectUserId,
    occurredAt: input.occurredAt,
    metadata: redactSecrets(input.metadata ?? {}),
  };
}
