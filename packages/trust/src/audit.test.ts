import { describe, expect, it } from 'vitest';

import { buildAuditRecord } from './audit.js';
import { REDACTED } from './redaction.js';

const occurredAt = new Date('2026-03-01T09:00:00Z');

describe('buildAuditRecord', () => {
  it('records what happened, who did it, and to whom', () => {
    const record = buildAuditRecord({
      action: 'consent.granted',
      actor: 'user-1',
      subjectUserId: 'user-1',
      occurredAt,
    });

    expect(record).toEqual({
      action: 'consent.granted',
      actor: 'user-1',
      subjectUserId: 'user-1',
      occurredAt,
      metadata: {},
    });
  });

  it('redacts credentials that would otherwise land in the audit trail', () => {
    const record = buildAuditRecord({
      action: 'integration.connected',
      actor: 'worker:sync',
      subjectUserId: 'user-1',
      occurredAt,
      metadata: { provider: 'CANVAS', accessToken: 'canvas-secret' },
    });

    expect(record.metadata.provider).toBe('CANVAS');
    expect(record.metadata.accessToken).toBe(REDACTED);
  });

  it('uses the supplied timestamp rather than the current clock', () => {
    const record = buildAuditRecord({
      action: 'plan.replanned',
      actor: 'worker:planning',
      subjectUserId: 'user-1',
      occurredAt,
    });

    expect(record.occurredAt).toBe(occurredAt);
  });
});
