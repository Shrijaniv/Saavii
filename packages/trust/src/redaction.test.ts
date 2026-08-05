import { describe, expect, it } from 'vitest';

import { REDACTED, isSensitiveKey, redactSecrets } from './redaction.js';

describe('isSensitiveKey', () => {
  it.each([
    'accessToken',
    'refresh_token',
    'Authorization',
    'apiKey',
    'api_key',
    'clientSecret',
    'password',
    'cookie',
    'privateKey',
  ])('treats %s as sensitive', (key) => {
    expect(isSensitiveKey(key)).toBe(true);
  });

  it.each(['email', 'displayName', 'timezone', 'courseCode', 'startMinute'])(
    'leaves %s alone',
    (key) => {
      expect(isSensitiveKey(key)).toBe(false);
    },
  );
});

describe('redactSecrets', () => {
  it('redacts sensitive fields and keeps the rest readable', () => {
    const payload = {
      userId: 'user-1',
      email: 'student@university.edu',
      accessToken: 'ya29.super-secret',
    };

    expect(redactSecrets(payload)).toEqual({
      userId: 'user-1',
      email: 'student@university.edu',
      accessToken: REDACTED,
    });
  });

  it('redacts sensitive leaves nested inside objects and arrays', () => {
    const payload = {
      integrations: [
        { provider: 'GOOGLE_CALENDAR', refreshToken: 'secret-a' },
        { provider: 'CANVAS', apiKey: 'secret-b' },
      ],
    };

    const redacted = redactSecrets(payload);

    expect(redacted.integrations[0]?.refreshToken).toBe(REDACTED);
    expect(redacted.integrations[1]?.apiKey).toBe(REDACTED);
    expect(redacted.integrations[0]?.provider).toBe('GOOGLE_CALENDAR');
  });

  it('redacts a whole subtree when the container key is itself sensitive', () => {
    const payload = { provider: 'CANVAS', credentials: { refreshToken: 'a', scope: 'read' } };

    const redacted = redactSecrets(payload);

    // The safer reading: nothing under `credentials` survives, not even the
    // fields that look harmless.
    expect(redacted.credentials).toBe(REDACTED);
    expect(redacted.provider).toBe('CANVAS');
  });

  it('does not mutate the object it was given', () => {
    const payload = { accessToken: 'still-needed-by-the-caller' };

    redactSecrets(payload);

    expect(payload.accessToken).toBe('still-needed-by-the-caller');
  });

  it('passes primitives and null through untouched', () => {
    expect(redactSecrets('plain')).toBe('plain');
    expect(redactSecrets(42)).toBe(42);
    expect(redactSecrets(null)).toBeNull();
    expect(redactSecrets(undefined)).toBeUndefined();
  });

  it('preserves Date values as dates', () => {
    const decidedAt = new Date('2026-01-01T00:00:00Z');

    const redacted = redactSecrets({ decidedAt });

    expect(redacted.decidedAt).toBeInstanceOf(Date);
    expect(redacted.decidedAt.toISOString()).toBe(decidedAt.toISOString());
  });

  it('marks cycles instead of recursing forever', () => {
    const payload: Record<string, unknown> = { name: 'loop' };
    payload.self = payload;

    const redacted = redactSecrets(payload) as Record<string, unknown>;

    expect(redacted.name).toBe('loop');
    expect(redacted.self).toBe('[CIRCULAR]');
  });
});
