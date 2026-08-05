/**
 * Module: trust
 * Responsibility: The Trust Layer — authentication, consent, audit, redaction,
 * and data rights. Cross-cutting; depends on nothing domain-specific
 * (ARCHITECTURE.md §6).
 */

export * from './audit.js';
export * from './auth.js';
export * from './consent.js';
export * from './data-rights.js';
export * from './redaction.js';
