/**
 * Module: contracts/entities
 * Responsibility: Core domain entity types shared across systems.
 *
 * Phase 1 scope (Volume V): profiles, goals, classes, routines, interests, and
 * the privacy/consent foundations. Plans, tasks, schedule blocks, and execution
 * records arrive in Phases 3-4 and belong in this file when they do.
 *
 * Types only — no behavior (see packages/contracts/README.md).
 */

export type UserId = string;
export type EntityId = string;

/** Local wall-clock time as minutes from midnight. Weekly commitments recur in
 * the user's local time, so storing an absolute instant would drift across DST. */
export type MinuteOfDay = number;

export type Weekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

// ── Profile ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: UserId;
  email: string;
  displayName: string | null;
  university: string | null;
  /** IANA timezone, e.g. "America/Chicago". */
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Goals ───────────────────────────────────────────────────────────────────

export type GoalHorizon = 'SHORT_TERM' | 'SEMESTER' | 'LONG_TERM';
export type GoalStatus = 'ACTIVE' | 'ACHIEVED' | 'PAUSED' | 'ABANDONED';

export interface Goal {
  id: EntityId;
  userId: UserId;
  title: string;
  description: string | null;
  horizon: GoalHorizon;
  status: GoalStatus;
  targetDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Classes ─────────────────────────────────────────────────────────────────

export interface ClassMeeting {
  id: EntityId;
  weekday: Weekday;
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
  location: string | null;
}

export interface CourseClass {
  id: EntityId;
  userId: UserId;
  courseCode: string;
  title: string;
  /** Free-form term label, e.g. "Fall 2026". */
  term: string | null;
  meetings: ClassMeeting[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Routines ────────────────────────────────────────────────────────────────

/** The fixed-life scaffolding the planner must schedule around
 * (Volume II, "Daily and weekly planning"). */
export type RoutineKind = 'SLEEP' | 'GETTING_READY' | 'MEAL' | 'COMMUTE' | 'OTHER';

export interface Routine {
  id: EntityId;
  userId: UserId;
  kind: RoutineKind;
  label: string;
  weekdays: Weekday[];
  startMinute: MinuteOfDay;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Interests ───────────────────────────────────────────────────────────────

export type FrequencyUnit = 'WEEK' | 'MONTH';

/** Hobbies and personal interests carry a *desired frequency* (Volume III,
 * Profile) because protected personal time is a commitment, not leftover time
 * (Volume I, Ch. 4, Principle 2). */
export interface Interest {
  id: EntityId;
  userId: UserId;
  name: string;
  desiredTimesPerUnit: number;
  frequencyUnit: FrequencyUnit;
  typicalDurationMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Privacy and consent ─────────────────────────────────────────────────────

/**
 * Categories of data use that require explicit opt-in.
 * Volume I, Ch. 10: "Make location, relationship memory, and behavioral
 * learning opt-in." Volume IV repeats it as a security requirement.
 */
export type ConsentCategory =
  | 'LOCATION'
  | 'RELATIONSHIP_MEMORY'
  | 'BEHAVIORAL_LEARNING'
  | 'EMAIL_CONTENT'
  | 'HEALTH';

export type ConsentDecision = 'GRANTED' | 'DENIED' | 'REVOKED';

export interface ConsentGrant {
  id: EntityId;
  userId: UserId;
  category: ConsentCategory;
  decision: ConsentDecision;
  /** Where the decision came from, for the audit trail (Volume I, Ch. 10). */
  source: string;
  decidedAt: Date;
  revokedAt: Date | null;
}
