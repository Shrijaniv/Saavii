/**
 * Module: api/routes/classes
 * Responsibility: The /classes domain — the class schedule the planner treats
 * as a hard constraint (Volume II, "Daily and weekly planning").
 *
 * Read-only for now: Phase 1 confirms a schedule the user enters during
 * onboarding, and Phase 2 populates it from Canvas.
 */

import type { FastifyInstance } from 'fastify';

import type { RouteOptions } from '../server.js';

export async function classesRoutes(app: FastifyInstance, options: RouteOptions): Promise<void> {
  const { store } = options;

  app.get('/', async (request) => ({
    classes: await store.classes.listByUser(request.authenticatedUser.id),
  }));
}
