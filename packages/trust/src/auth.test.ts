import { describe, expect, it } from 'vitest';

import { bearerTokenFrom } from './auth.js';

describe('bearerTokenFrom', () => {
  it('extracts the token from a well-formed header', () => {
    expect(bearerTokenFrom('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('accepts any capitalisation of the scheme', () => {
    expect(bearerTokenFrom('bearer abc')).toBe('abc');
    expect(bearerTokenFrom('BEARER abc')).toBe('abc');
  });

  it('tolerates surrounding whitespace', () => {
    expect(bearerTokenFrom('  Bearer   abc  ')).toBe('abc');
  });

  it.each([
    ['missing header', undefined],
    ['null header', null],
    ['empty string', ''],
    ['scheme with no token', 'Bearer'],
    ['scheme with only spaces', 'Bearer   '],
    ['a different scheme', 'Basic abc'],
    ['a bare token', 'abc.def.ghi'],
    ['two tokens', 'Bearer abc def'],
  ])('returns null for %s', (_label, header) => {
    expect(bearerTokenFrom(header)).toBeNull();
  });
});
