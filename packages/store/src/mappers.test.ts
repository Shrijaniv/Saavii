import { describe, expect, it } from 'vitest';

import {
  toConsentGrant,
  toCourseClass,
  toGoal,
  toInterest,
  toRoutine,
  toUserProfile,
  type ConsentGrantRow,
  type CourseClassRow,
  type GoalRow,
  type InterestRow,
  type RoutineRow,
  type UserProfileRow,
} from './mappers.js';

const createdAt = new Date('2026-01-01T00:00:00Z');
const updatedAt = new Date('2026-01-02T00:00:00Z');

describe('toUserProfile', () => {
  it('maps every field and preserves optional nulls', () => {
    const row: UserProfileRow = {
      id: 'user-1',
      email: 'student@university.edu',
      displayName: null,
      university: null,
      timezone: 'America/Chicago',
      createdAt,
      updatedAt,
    };

    expect(toUserProfile(row)).toEqual({
      id: 'user-1',
      email: 'student@university.edu',
      displayName: null,
      university: null,
      timezone: 'America/Chicago',
      createdAt,
      updatedAt,
    });
  });
});

describe('toGoal', () => {
  it('carries horizon, status, and a null target date through unchanged', () => {
    const row: GoalRow = {
      id: 'goal-1',
      userId: 'user-1',
      title: 'Land a summer internship',
      description: null,
      horizon: 'SEMESTER',
      status: 'ACTIVE',
      targetDate: null,
      createdAt,
      updatedAt,
    };

    const goal = toGoal(row);

    expect(goal.horizon).toBe('SEMESTER');
    expect(goal.status).toBe('ACTIVE');
    expect(goal.targetDate).toBeNull();
  });
});

describe('toCourseClass', () => {
  it('maps nested meetings, preserving the order the query returned', () => {
    const row: CourseClassRow = {
      id: 'class-1',
      userId: 'user-1',
      courseCode: 'CS 340',
      title: 'Databases',
      term: 'Fall 2026',
      meetings: [
        { id: 'm-1', weekday: 'MONDAY', startMinute: 540, endMinute: 590, location: 'Hall A' },
        { id: 'm-2', weekday: 'WEDNESDAY', startMinute: 540, endMinute: 590, location: null },
      ],
      createdAt,
      updatedAt,
    };

    const course = toCourseClass(row);

    expect(course.meetings).toHaveLength(2);
    expect(course.meetings.map((m) => m.weekday)).toEqual(['MONDAY', 'WEDNESDAY']);
    expect(course.meetings[1]?.location).toBeNull();
  });

  it('returns an empty meetings array when a class has no scheduled meetings', () => {
    const row: CourseClassRow = {
      id: 'class-2',
      userId: 'user-1',
      courseCode: 'CS 101',
      title: 'Independent Study',
      term: null,
      meetings: [],
      createdAt,
      updatedAt,
    };

    expect(toCourseClass(row).meetings).toEqual([]);
  });
});

describe('toRoutine', () => {
  it('copies the weekdays array rather than aliasing the row', () => {
    const weekdays: RoutineRow['weekdays'] = ['MONDAY', 'TUESDAY'];
    const row: RoutineRow = {
      id: 'routine-1',
      userId: 'user-1',
      kind: 'SLEEP',
      label: 'Sleep',
      weekdays,
      startMinute: 1380,
      durationMinutes: 480,
      createdAt,
      updatedAt,
    };

    const routine = toRoutine(row);
    weekdays.push('WEDNESDAY');

    expect(routine.weekdays).toEqual(['MONDAY', 'TUESDAY']);
  });
});

describe('toInterest', () => {
  it('preserves the desired frequency that protects personal time', () => {
    const row: InterestRow = {
      id: 'interest-1',
      userId: 'user-1',
      name: 'Tennis',
      desiredTimesPerUnit: 2,
      frequencyUnit: 'WEEK',
      typicalDurationMinutes: 90,
      createdAt,
      updatedAt,
    };

    const interest = toInterest(row);

    expect(interest.desiredTimesPerUnit).toBe(2);
    expect(interest.frequencyUnit).toBe('WEEK');
    expect(interest.typicalDurationMinutes).toBe(90);
  });
});

describe('toConsentGrant', () => {
  it('keeps the provenance fields the audit trail depends on', () => {
    const decidedAt = new Date('2026-02-01T12:00:00Z');
    const row: ConsentGrantRow = {
      id: 'consent-1',
      userId: 'user-1',
      category: 'LOCATION',
      decision: 'GRANTED',
      source: 'onboarding',
      decidedAt,
      revokedAt: null,
    };

    expect(toConsentGrant(row)).toEqual({
      id: 'consent-1',
      userId: 'user-1',
      category: 'LOCATION',
      decision: 'GRANTED',
      source: 'onboarding',
      decidedAt,
      revokedAt: null,
    });
  });
});
