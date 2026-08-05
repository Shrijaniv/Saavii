import { describe, expect, it } from 'vitest';

import type { ConsentCategory, ConsentGrant } from '@saavii/contracts';

import {
  ConsentRequiredError,
  assertConsentGranted,
  grantedCategories,
  isConsentGranted,
  latestDecisionsFor,
} from './consent.js';

let sequence = 0;

function grant(
  category: ConsentCategory,
  decision: ConsentGrant['decision'],
  decidedAt: string,
  revokedAt: string | null = null,
): ConsentGrant {
  sequence += 1;
  return {
    id: `consent-${sequence}`,
    userId: 'user-1',
    category,
    decision,
    source: 'test',
    decidedAt: new Date(decidedAt),
    revokedAt: revokedAt === null ? null : new Date(revokedAt),
  };
}

describe('isConsentGranted', () => {
  it('denies when the user has never decided — absence is a denial', () => {
    expect(isConsentGranted('LOCATION', [])).toBe(false);
  });

  it('allows after an explicit grant', () => {
    const history = [grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z')];
    expect(isConsentGranted('LOCATION', history)).toBe(true);
  });

  it('denies after an explicit denial', () => {
    const history = [grant('LOCATION', 'DENIED', '2026-01-01T00:00:00Z')];
    expect(isConsentGranted('LOCATION', history)).toBe(false);
  });

  it('denies once a later revocation lands', () => {
    const history = [
      grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z'),
      grant('LOCATION', 'REVOKED', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z'),
    ];
    expect(isConsentGranted('LOCATION', history)).toBe(false);
  });

  it('allows again when the user re-grants after revoking', () => {
    const history = [
      grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z'),
      grant('LOCATION', 'REVOKED', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z'),
      grant('LOCATION', 'GRANTED', '2026-03-01T00:00:00Z'),
    ];
    expect(isConsentGranted('LOCATION', history)).toBe(true);
  });

  it('uses the newest decision regardless of array order', () => {
    const history = [
      grant('LOCATION', 'REVOKED', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z'),
      grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z'),
    ];
    expect(isConsentGranted('LOCATION', history)).toBe(false);
  });

  it('denies a grant row that carries a revocation timestamp', () => {
    const history = [grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z', '2026-01-15T00:00:00Z')];
    expect(isConsentGranted('LOCATION', history)).toBe(false);
  });

  it('resolves a timestamp tie to the more restrictive answer', () => {
    const history = [
      grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z'),
      grant('LOCATION', 'REVOKED', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
    ];
    expect(isConsentGranted('LOCATION', history)).toBe(false);
  });

  it('does not let one category satisfy another', () => {
    const history = [grant('RELATIONSHIP_MEMORY', 'GRANTED', '2026-01-01T00:00:00Z')];
    expect(isConsentGranted('LOCATION', history)).toBe(false);
    expect(isConsentGranted('RELATIONSHIP_MEMORY', history)).toBe(true);
  });
});

describe('latestDecisionsFor', () => {
  it('returns nothing for a category with no history', () => {
    expect(latestDecisionsFor('HEALTH', [grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z')])).toEqual(
      [],
    );
  });

  it('returns every decision sharing the newest timestamp', () => {
    const history = [
      grant('HEALTH', 'GRANTED', '2026-01-01T00:00:00Z'),
      grant('HEALTH', 'DENIED', '2026-05-01T00:00:00Z'),
      grant('HEALTH', 'GRANTED', '2026-05-01T00:00:00Z'),
    ];
    expect(latestDecisionsFor('HEALTH', history)).toHaveLength(2);
  });
});

describe('grantedCategories', () => {
  it('lists only currently granted categories, sorted', () => {
    const history = [
      grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z'),
      grant('BEHAVIORAL_LEARNING', 'GRANTED', '2026-01-01T00:00:00Z'),
      grant('HEALTH', 'GRANTED', '2026-01-01T00:00:00Z'),
      grant('HEALTH', 'REVOKED', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z'),
    ];
    expect(grantedCategories(history)).toEqual(['BEHAVIORAL_LEARNING', 'LOCATION']);
  });

  it('returns an empty list for a user who has decided nothing', () => {
    expect(grantedCategories([])).toEqual([]);
  });
});

describe('assertConsentGranted', () => {
  it('throws ConsentRequiredError naming the category when consent is missing', () => {
    expect(() => assertConsentGranted('LOCATION', [])).toThrowError(ConsentRequiredError);
    try {
      assertConsentGranted('LOCATION', []);
    } catch (error) {
      expect((error as ConsentRequiredError).category).toBe('LOCATION');
    }
  });

  it('passes silently when consent is granted', () => {
    const history = [grant('LOCATION', 'GRANTED', '2026-01-01T00:00:00Z')];
    expect(() => assertConsentGranted('LOCATION', history)).not.toThrow();
  });
});
