/**
 * Module: trust/consent
 * Responsibility: Decide whether a sensitive data category may be used, from a
 * user's recorded consent history.
 *
 * Every category in `ConsentCategory` is opt-in: location, relationship memory,
 * and behavioural learning by name (Volume I, Ch. 10), and email content and
 * health by the same standard. The rule this file enforces is that **absence of
 * a grant is a denial** — "privacy is the default, not a premium feature"
 * (Volume I, Ch. 2).
 *
 * Pure decision logic: history in, decision out. Reading and writing that
 * history is the caller's job (packages/store).
 */

import type { ConsentCategory, ConsentGrant } from '@saavii/contracts';

/**
 * The most recent decisions for a category, or an empty array if the user has
 * never decided. More than one entry means several decisions share the newest
 * timestamp.
 */
export function latestDecisionsFor(
  category: ConsentCategory,
  history: readonly ConsentGrant[],
): ConsentGrant[] {
  const forCategory = history.filter((grant) => grant.category === category);
  if (forCategory.length === 0) return [];

  const newest = forCategory.reduce(
    (max, grant) => Math.max(max, grant.decidedAt.getTime()),
    Number.NEGATIVE_INFINITY,
  );
  return forCategory.filter((grant) => grant.decidedAt.getTime() === newest);
}

/**
 * Whether `category` may be used right now.
 *
 * Denies unless the newest decision is an un-revoked `GRANTED`. When several
 * decisions share the newest timestamp — a clock tie, or a batch write — every
 * one of them must be a grant, so an ambiguous history resolves to the more
 * restrictive answer rather than an accidental yes.
 */
export function isConsentGranted(
  category: ConsentCategory,
  history: readonly ConsentGrant[],
): boolean {
  const latest = latestDecisionsFor(category, history);
  if (latest.length === 0) return false;
  return latest.every((grant) => grant.decision === 'GRANTED' && grant.revokedAt === null);
}

/** Every category the user has currently opted into. */
export function grantedCategories(history: readonly ConsentGrant[]): ConsentCategory[] {
  const categories = new Set(history.map((grant) => grant.category));
  return [...categories].filter((category) => isConsentGranted(category, history)).sort();
}

/** Raised when a caller reaches for a category the user has not opted into. */
export class ConsentRequiredError extends Error {
  readonly category: ConsentCategory;

  constructor(category: ConsentCategory) {
    super(`Consent required for category ${category}`);
    this.name = 'ConsentRequiredError';
    this.category = category;
  }
}

/**
 * Guard for call sites that must not proceed without consent. Prefer this over
 * an `if` so the failure is loud and uniform.
 */
export function assertConsentGranted(
  category: ConsentCategory,
  history: readonly ConsentGrant[],
): void {
  if (!isConsentGranted(category, history)) {
    throw new ConsentRequiredError(category);
  }
}
