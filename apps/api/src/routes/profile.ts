/**
 * Module: api/routes/profile
 * Responsibility: The /profile domain — identity, routines, and the privacy and
 * consent controls Volume III lists as Profile sections.
 *
 * Thin routes: validate, authorize, orchestrate packages, respond.
 */

import type { FastifyInstance } from 'fastify';

import type { ConsentCategory, ConsentDecision } from '@saavii/contracts';
import { grantedCategories } from '@saavii/trust';

import type { RouteOptions } from '../server.js';

const CONSENT_CATEGORIES = [
  'LOCATION',
  'RELATIONSHIP_MEMORY',
  'BEHAVIORAL_LEARNING',
  'EMAIL_CONTENT',
  'HEALTH',
] as const satisfies readonly ConsentCategory[];

const CONSENT_DECISIONS = ['GRANTED', 'DENIED', 'REVOKED'] as const satisfies readonly ConsentDecision[];

export async function profileRoutes(app: FastifyInstance, options: RouteOptions): Promise<void> {
  const { store } = options;

  app.get('/', async (request, reply) => {
    const profile = await store.profiles.findById(request.authenticatedUser.id);
    if (!profile) {
      return reply.code(404).send({ error: 'not_found', message: 'Profile not created yet.' });
    }
    return profile;
  });

  app.put<{ Body: { displayName?: string | null; university?: string | null; timezone: string } }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['timezone'],
          properties: {
            displayName: { type: ['string', 'null'] },
            university: { type: ['string', 'null'] },
            timezone: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request) =>
      store.profiles.upsert({
        id: request.authenticatedUser.id,
        email: request.authenticatedUser.email,
        displayName: request.body.displayName ?? null,
        university: request.body.university ?? null,
        timezone: request.body.timezone,
      }),
  );

  // Volume III lists routines under Profile; Volume IV defines no /routines
  // domain, so they live here rather than in an invented one.
  app.get('/routines', async (request) => ({
    routines: await store.routines.listByUser(request.authenticatedUser.id),
  }));

  // Memory Review's consent half: what the user has opted into, and the full
  // decision history behind it (Volume I, Ch. 10).
  app.get('/consent', async (request) => {
    const history = await store.consent.listByUser(request.authenticatedUser.id);
    return { granted: grantedCategories(history), history };
  });

  app.post<{ Body: { category: ConsentCategory; decision: ConsentDecision; source?: string } }>(
    '/consent',
    {
      schema: {
        body: {
          type: 'object',
          required: ['category', 'decision'],
          properties: {
            category: { type: 'string', enum: [...CONSENT_CATEGORIES] },
            decision: { type: 'string', enum: [...CONSENT_DECISIONS] },
            source: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const grant = await store.consent.record({
        userId: request.authenticatedUser.id,
        category: request.body.category,
        decision: request.body.decision,
        source: request.body.source ?? 'profile-settings',
      });
      return reply.code(201).send(grant);
    },
  );
}
