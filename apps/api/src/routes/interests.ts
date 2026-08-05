/**
 * Module: api/routes/interests
 * Responsibility: The /interests domain — hobbies and personal interests with
 * the desired frequency that makes them commitments rather than leftover time
 * (Volume I, Ch. 4, Principle 2; Volume III, Profile).
 */

import type { FastifyInstance } from 'fastify';

import type { FrequencyUnit } from '@saavii/contracts';

import type { RouteOptions } from '../server.js';

const FREQUENCY_UNITS = ['WEEK', 'MONTH'] as const satisfies readonly FrequencyUnit[];

export async function interestsRoutes(app: FastifyInstance, options: RouteOptions): Promise<void> {
  const { store } = options;

  app.get('/', async (request) => ({
    interests: await store.interests.listByUser(request.authenticatedUser.id),
  }));

  app.post<{
    Body: {
      name: string;
      desiredTimesPerUnit: number;
      frequencyUnit?: FrequencyUnit;
      typicalDurationMinutes?: number | null;
    };
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'desiredTimesPerUnit'],
          properties: {
            name: { type: 'string', minLength: 1 },
            desiredTimesPerUnit: { type: 'integer', minimum: 1 },
            frequencyUnit: { type: 'string', enum: [...FREQUENCY_UNITS] },
            typicalDurationMinutes: { type: ['integer', 'null'], minimum: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const interest = await store.interests.create({
        userId: request.authenticatedUser.id,
        name: request.body.name,
        desiredTimesPerUnit: request.body.desiredTimesPerUnit,
        frequencyUnit: request.body.frequencyUnit ?? 'WEEK',
        typicalDurationMinutes: request.body.typicalDurationMinutes ?? null,
      });
      return reply.code(201).send(interest);
    },
  );
}
