/**
 * Module: store/mappers
 * Responsibility: Translate persisted rows into domain types from @saavii/contracts.
 *
 * Pure functions over structural row shapes — no Prisma import, no I/O — so they
 * are unit-testable without a database. Callers in repositories.ts pass real
 * Prisma rows, and TypeScript checks them structurally against these shapes, so
 * schema drift surfaces at compile time rather than at runtime.
 */

import type {
  ClassMeeting,
  ConsentGrant,
  CourseClass,
  Goal,
  Interest,
  Routine,
  UserProfile,
} from '@saavii/contracts';

export interface UserProfileRow {
  id: string;
  email: string;
  displayName: string | null;
  university: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalRow {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  horizon: Goal['horizon'];
  status: Goal['status'];
  targetDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassMeetingRow {
  id: string;
  weekday: ClassMeeting['weekday'];
  startMinute: number;
  endMinute: number;
  location: string | null;
}

export interface CourseClassRow {
  id: string;
  userId: string;
  courseCode: string;
  title: string;
  term: string | null;
  meetings: ClassMeetingRow[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineRow {
  id: string;
  userId: string;
  kind: Routine['kind'];
  label: string;
  weekdays: Routine['weekdays'];
  startMinute: number;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterestRow {
  id: string;
  userId: string;
  name: string;
  desiredTimesPerUnit: number;
  frequencyUnit: Interest['frequencyUnit'];
  typicalDurationMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentGrantRow {
  id: string;
  userId: string;
  category: ConsentGrant['category'];
  decision: ConsentGrant['decision'];
  source: string;
  decidedAt: Date;
  revokedAt: Date | null;
}

export function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    university: row.university,
    timezone: row.timezone,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    horizon: row.horizon,
    status: row.status,
    targetDate: row.targetDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toClassMeeting(row: ClassMeetingRow): ClassMeeting {
  return {
    id: row.id,
    weekday: row.weekday,
    startMinute: row.startMinute,
    endMinute: row.endMinute,
    location: row.location,
  };
}

export function toCourseClass(row: CourseClassRow): CourseClass {
  return {
    id: row.id,
    userId: row.userId,
    courseCode: row.courseCode,
    title: row.title,
    term: row.term,
    meetings: row.meetings.map(toClassMeeting),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    userId: row.userId,
    kind: row.kind,
    label: row.label,
    weekdays: [...row.weekdays],
    startMinute: row.startMinute,
    durationMinutes: row.durationMinutes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toInterest(row: InterestRow): Interest {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    desiredTimesPerUnit: row.desiredTimesPerUnit,
    frequencyUnit: row.frequencyUnit,
    typicalDurationMinutes: row.typicalDurationMinutes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toConsentGrant(row: ConsentGrantRow): ConsentGrant {
  return {
    id: row.id,
    userId: row.userId,
    category: row.category,
    decision: row.decision,
    source: row.source,
    decidedAt: row.decidedAt,
    revokedAt: row.revokedAt,
  };
}
