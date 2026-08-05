/**
 * Module: api/server
 * Responsibility: Compose the Node.js service — authentication, error
 * translation, and one route module per Volume IV API domain.
 *
 * Fastify (decision 0004). Routes stay thin: validate, authorize, orchestrate
 * packages, respond (apps/api/README.md). Dependencies are injected so the
 * server can be built against fakes in tests and against Prisma and Supabase in
 * production.
 */

import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';

import type { Store } from '@saavii/store';
import { ConsentRequiredError, bearerTokenFrom, type SessionVerifier } from '@saavii/trust';

import { classesRoutes } from './routes/classes.js';
import { goalsRoutes } from './routes/goals.js';
import { interestsRoutes } from './routes/interests.js';
import { profileRoutes } from './routes/profile.js';

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the authentication hook; every domain route runs after it. */
    authenticatedUser: { id: string; email: string };
  }
}

export interface ServerDependencies {
  store: Store;
  sessionVerifier: SessionVerifier;
  logger?: boolean;
}

export function buildServer(deps: ServerDependencies): FastifyInstance {
  const app = Fastify({ logger: deps.logger ?? false });

  // Authentication applies to every domain route — there are no unauthenticated
  // domain endpoints (apps/api/README.md). /health is the one exemption.
  app.addHook('onRequest', async (request, reply) => {
    if (request.url === '/health') return;

    const token = bearerTokenFrom(request.headers.authorization);
    if (!token) {
      return reply.code(401).send({ error: 'unauthorized', message: 'Missing bearer token.' });
    }

    const user = await deps.sessionVerifier.verify(token);
    if (!user) {
      return reply.code(401).send({ error: 'unauthorized', message: 'Invalid or expired session.' });
    }

    request.authenticatedUser = user;
  });

  // A missing opt-in is a 403 with the category named, so the client can ask for
  // consent rather than guessing why the call failed (Volume I, Ch. 10).
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof ConsentRequiredError) {
      return reply.code(403).send({
        error: 'consent_required',
        category: error.category,
        message: error.message,
      });
    }

    if (error.validation) {
      return reply.code(400).send({ error: 'invalid_request', message: error.message });
    }

    app.log.error(error);
    return reply.code(500).send({ error: 'internal_error' });
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(profileRoutes, { prefix: '/profile', store: deps.store });
  app.register(goalsRoutes, { prefix: '/goals', store: deps.store });
  app.register(classesRoutes, { prefix: '/classes', store: deps.store });
  app.register(interestsRoutes, { prefix: '/interests', store: deps.store });

  return app;
}

export interface RouteOptions {
  store: Store;
}
