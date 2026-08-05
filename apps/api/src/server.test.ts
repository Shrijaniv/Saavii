import { beforeEach, describe, expect, it } from 'vitest';

import type { ConsentGrant, CourseClass, Goal, Interest, Routine, UserProfile } from '@saavii/contracts';
import type { Store } from '@saavii/store';
import type { AuthenticatedUser, SessionVerifier } from '@saavii/trust';

import { buildServer } from './server.js';

const VALID_TOKEN = 'valid-token';
const AUTHED: AuthenticatedUser = { id: 'user-1', email: 'student@university.edu' };
const AUTH_HEADER = { authorization: `Bearer ${VALID_TOKEN}` };

/** Accepts exactly one token, so tests can prove routes are gated. */
const sessionVerifier: SessionVerifier = {
  async verify(token) {
    return token === VALID_TOKEN ? AUTHED : null;
  },
};

interface FakeState {
  profiles: Map<string, UserProfile>;
  goals: Goal[];
  classes: CourseClass[];
  routines: Routine[];
  interests: Interest[];
  consent: ConsentGrant[];
}

const now = new Date('2026-01-01T00:00:00Z');

/**
 * In-memory Store. Every repository filters by userId so a handler that forgot
 * to scope its query to the authenticated user fails these tests.
 */
function createFakeStore(state: FakeState): Store {
  let sequence = 0;
  const nextId = (prefix: string) => `${prefix}-${(sequence += 1)}`;

  return {
    profiles: {
      async findById(userId) {
        return state.profiles.get(userId) ?? null;
      },
      async upsert(input) {
        const profile: UserProfile = {
          id: input.id,
          email: input.email,
          displayName: input.displayName ?? null,
          university: input.university ?? null,
          timezone: input.timezone,
          createdAt: state.profiles.get(input.id)?.createdAt ?? now,
          updatedAt: now,
        };
        state.profiles.set(input.id, profile);
        return profile;
      },
    },
    goals: {
      async listByUser(userId) {
        return state.goals.filter((goal) => goal.userId === userId);
      },
      async create(input) {
        const goal: Goal = {
          id: nextId('goal'),
          userId: input.userId,
          title: input.title,
          description: input.description ?? null,
          horizon: input.horizon,
          status: 'ACTIVE',
          targetDate: input.targetDate ?? null,
          createdAt: now,
          updatedAt: now,
        };
        state.goals.push(goal);
        return goal;
      },
    },
    classes: {
      async listByUser(userId) {
        return state.classes.filter((course) => course.userId === userId);
      },
    },
    routines: {
      async listByUser(userId) {
        return state.routines.filter((routine) => routine.userId === userId);
      },
    },
    interests: {
      async listByUser(userId) {
        return state.interests.filter((interest) => interest.userId === userId);
      },
      async create(input) {
        const interest: Interest = {
          id: nextId('interest'),
          userId: input.userId,
          name: input.name,
          desiredTimesPerUnit: input.desiredTimesPerUnit,
          frequencyUnit: input.frequencyUnit,
          typicalDurationMinutes: input.typicalDurationMinutes ?? null,
          createdAt: now,
          updatedAt: now,
        };
        state.interests.push(interest);
        return interest;
      },
    },
    consent: {
      async listByUser(userId) {
        return state.consent.filter((entry) => entry.userId === userId);
      },
      async record(input) {
        const entry: ConsentGrant = {
          id: nextId('consent'),
          userId: input.userId,
          category: input.category,
          decision: input.decision,
          source: input.source,
          decidedAt: new Date(now.getTime() + state.consent.length * 1000),
          revokedAt: input.decision === 'REVOKED' ? now : null,
        };
        state.consent.push(entry);
        return entry;
      },
    },
  };
}

let state: FakeState;
let app: ReturnType<typeof buildServer>;

beforeEach(() => {
  state = {
    profiles: new Map(),
    goals: [],
    classes: [],
    routines: [],
    interests: [],
    consent: [],
  };
  app = buildServer({ store: createFakeStore(state), sessionVerifier });
});

describe('authentication', () => {
  it('serves /health without a session', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('rejects a domain route with no Authorization header', async () => {
    const response = await app.inject({ method: 'GET', url: '/goals' });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe('unauthorized');
  });

  it('rejects a token the verifier does not recognise', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/goals',
      headers: { authorization: 'Bearer nope' },
    });

    expect(response.statusCode).toBe(401);
  });

  it('rejects a malformed Authorization header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/goals',
      headers: { authorization: VALID_TOKEN },
    });

    expect(response.statusCode).toBe(401);
  });
});

describe('GET /profile', () => {
  it('returns 404 before the profile exists', async () => {
    const response = await app.inject({ method: 'GET', url: '/profile', headers: AUTH_HEADER });

    expect(response.statusCode).toBe(404);
  });

  it('returns the authenticated user profile once created', async () => {
    state.profiles.set('user-1', {
      id: 'user-1',
      email: AUTHED.email,
      displayName: 'Shri',
      university: 'State University',
      timezone: 'America/Chicago',
      createdAt: now,
      updatedAt: now,
    });

    const response = await app.inject({ method: 'GET', url: '/profile', headers: AUTH_HEADER });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: 'user-1', timezone: 'America/Chicago' });
  });
});

describe('PUT /profile', () => {
  it('creates the profile from the request body', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/profile',
      headers: AUTH_HEADER,
      payload: { displayName: 'Shri', university: 'State University', timezone: 'America/Chicago' },
    });

    expect(response.statusCode).toBe(200);
    expect(state.profiles.get('user-1')).toMatchObject({
      displayName: 'Shri',
      timezone: 'America/Chicago',
    });
  });

  it('takes identity from the session, not the body', async () => {
    await app.inject({
      method: 'PUT',
      url: '/profile',
      headers: AUTH_HEADER,
      payload: { id: 'someone-else', email: 'attacker@example.com', timezone: 'UTC' },
    });

    expect(state.profiles.has('someone-else')).toBe(false);
    expect(state.profiles.get('user-1')?.email).toBe(AUTHED.email);
  });

  it('rejects a body with no timezone', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/profile',
      headers: AUTH_HEADER,
      payload: { displayName: 'Shri' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('invalid_request');
  });
});

describe('/goals', () => {
  it('lists only the authenticated user goals', async () => {
    state.goals.push(
      {
        id: 'goal-mine',
        userId: 'user-1',
        title: 'Land an internship',
        description: null,
        horizon: 'SEMESTER',
        status: 'ACTIVE',
        targetDate: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'goal-theirs',
        userId: 'user-2',
        title: 'Not mine',
        description: null,
        horizon: 'SEMESTER',
        status: 'ACTIVE',
        targetDate: null,
        createdAt: now,
        updatedAt: now,
      },
    );

    const response = await app.inject({ method: 'GET', url: '/goals', headers: AUTH_HEADER });

    expect(response.json().goals).toHaveLength(1);
    expect(response.json().goals[0].id).toBe('goal-mine');
  });

  it('creates a goal and returns 201', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/goals',
      headers: AUTH_HEADER,
      payload: { title: 'Run a half marathon', horizon: 'LONG_TERM' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      title: 'Run a half marathon',
      horizon: 'LONG_TERM',
      status: 'ACTIVE',
      userId: 'user-1',
    });
  });

  it('rejects a goal with no title', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/goals',
      headers: AUTH_HEADER,
      payload: { horizon: 'SEMESTER' },
    });

    expect(response.statusCode).toBe(400);
    expect(state.goals).toHaveLength(0);
  });

  it('rejects an unknown horizon', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/goals',
      headers: AUTH_HEADER,
      payload: { title: 'Vague', horizon: 'SOMEDAY' },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe('/classes', () => {
  it('returns classes with their meetings', async () => {
    state.classes.push({
      id: 'class-1',
      userId: 'user-1',
      courseCode: 'CS 340',
      title: 'Databases',
      term: 'Fall 2026',
      meetings: [
        { id: 'm-1', weekday: 'MONDAY', startMinute: 540, endMinute: 590, location: 'Hall A' },
      ],
      createdAt: now,
      updatedAt: now,
    });

    const response = await app.inject({ method: 'GET', url: '/classes', headers: AUTH_HEADER });

    expect(response.statusCode).toBe(200);
    expect(response.json().classes[0].meetings).toHaveLength(1);
  });
});

describe('/interests', () => {
  it('defaults the frequency unit to WEEK', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/interests',
      headers: AUTH_HEADER,
      payload: { name: 'Tennis', desiredTimesPerUnit: 2 },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ name: 'Tennis', frequencyUnit: 'WEEK' });
  });

  it('rejects a desired frequency below one', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/interests',
      headers: AUTH_HEADER,
      payload: { name: 'Tennis', desiredTimesPerUnit: 0 },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe('/profile/routines', () => {
  it('returns the user routines', async () => {
    state.routines.push({
      id: 'routine-1',
      userId: 'user-1',
      kind: 'SLEEP',
      label: 'Sleep',
      weekdays: ['MONDAY', 'TUESDAY'],
      startMinute: 1380,
      durationMinutes: 480,
      createdAt: now,
      updatedAt: now,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/profile/routines',
      headers: AUTH_HEADER,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().routines[0].kind).toBe('SLEEP');
  });
});

describe('/profile/consent', () => {
  it('reports nothing granted before the user opts in', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profile/consent',
      headers: AUTH_HEADER,
    });

    expect(response.json()).toEqual({ granted: [], history: [] });
  });

  it('records a grant and reflects it in the granted list', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/profile/consent',
      headers: AUTH_HEADER,
      payload: { category: 'LOCATION', decision: 'GRANTED', source: 'onboarding' },
    });
    expect(created.statusCode).toBe(201);

    const response = await app.inject({
      method: 'GET',
      url: '/profile/consent',
      headers: AUTH_HEADER,
    });

    expect(response.json().granted).toEqual(['LOCATION']);
  });

  it('drops the category from the granted list after a revocation', async () => {
    await app.inject({
      method: 'POST',
      url: '/profile/consent',
      headers: AUTH_HEADER,
      payload: { category: 'LOCATION', decision: 'GRANTED' },
    });
    await app.inject({
      method: 'POST',
      url: '/profile/consent',
      headers: AUTH_HEADER,
      payload: { category: 'LOCATION', decision: 'REVOKED' },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/profile/consent',
      headers: AUTH_HEADER,
    });

    expect(response.json().granted).toEqual([]);
    expect(response.json().history).toHaveLength(2);
  });

  it('rejects a category outside the opt-in list', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profile/consent',
      headers: AUTH_HEADER,
      payload: { category: 'EVERYTHING', decision: 'GRANTED' },
    });

    expect(response.statusCode).toBe(400);
    expect(state.consent).toHaveLength(0);
  });
});
