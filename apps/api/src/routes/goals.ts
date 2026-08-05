/**
 * Module: api/routes/goals
 * Responsibility: The /goals domain — the user's stated goals, which the
 * Priority Engine later reads as goal alignment (Volume IV).
 */

import type { FastifyInstance } from 'fastify';

import type { GoalHorizon } from '@saavii/contracts';

import type { RouteOptions } from '../server.js';

const GOAL_HORIZONS = ['SHORT_TERM', 'SEMESTER', 'LONG_TERM'] as const satisfies readonly GoalHorizon[];

export async function goalsRoutes(app: FastifyInstance, options: RouteOptions): Promise<void> {
  const { store } = options;

  app.get('/', async (request) => ({
    goals: await store.goals.listByUser(request.authenticatedUser.id),
  }));

  app.post<{
    Body: { title: string; description?: string | null; horizon: GoalHorizon; targetDate?: string | null };
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'horizon'],
          properties: {
            title: { type: 'string', minLength: 1 },
            description: { type: ['string', 'null'] },
            horizon: { type: 'string', enum: [...GOAL_HORIZONS] },
            targetDate: { type: ['string', 'null'], format: 'date-time' },
          },
        },
      },
    },
    async (request, reply) => {
      const goal = await store.goals.create({
        userId: request.authenticatedUser.id,
        title: request.body.title,
        description: request.body.description ?? null,
        horizon: request.body.horizon,
        targetDate: request.body.targetDate ? new Date(request.body.targetDate) : null,
      });
      return reply.code(201).send(goal);
    },
  );
}
