/**
 * Module: store/repositories
 * Responsibility: Prisma-backed implementations of the repository ports —
 * persistence and retrieval only, no business logic.
 *
 * This is the only file in the repository that may import Prisma
 * (ARCHITECTURE.md §4; enforced by .dependency-cruiser.cjs).
 */

import { PrismaClient } from '@prisma/client';

import {
  toConsentGrant,
  toCourseClass,
  toGoal,
  toInterest,
  toRoutine,
  toUserProfile,
} from './mappers.js';
import type { Store } from './ports.js';

export type { PrismaClient };

export interface ConnectedStore extends Store {
  disconnect(): Promise<void>;
}

/**
 * Build a Store that owns its own Prisma client.
 *
 * Composition roots (the API server, workers) call this so they never import
 * Prisma themselves — the database client stays inside this package
 * (ARCHITECTURE.md §4).
 */
export function createStoreFromDatabaseUrl(databaseUrl: string): ConnectedStore {
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  return {
    ...createStore(prisma),
    disconnect: () => prisma.$disconnect(),
  };
}

export function createStore(prisma: PrismaClient): Store {
  return {
    profiles: {
      async findById(userId) {
        const row = await prisma.userProfile.findUnique({ where: { id: userId } });
        return row ? toUserProfile(row) : null;
      },
      async upsert(input) {
        const row = await prisma.userProfile.upsert({
          where: { id: input.id },
          create: {
            id: input.id,
            email: input.email,
            displayName: input.displayName ?? null,
            university: input.university ?? null,
            timezone: input.timezone,
          },
          update: {
            email: input.email,
            displayName: input.displayName ?? null,
            university: input.university ?? null,
            timezone: input.timezone,
          },
        });
        return toUserProfile(row);
      },
    },

    goals: {
      async listByUser(userId) {
        const rows = await prisma.goal.findMany({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });
        return rows.map(toGoal);
      },
      async create(input) {
        const row = await prisma.goal.create({
          data: {
            userId: input.userId,
            title: input.title,
            description: input.description ?? null,
            horizon: input.horizon,
            targetDate: input.targetDate ?? null,
          },
        });
        return toGoal(row);
      },
    },

    classes: {
      async listByUser(userId) {
        // Ordering is applied in the query so mappers stay pure translations
        // and callers get a stable order.
        const rows = await prisma.courseClass.findMany({
          where: { userId },
          include: { meetings: { orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }] } },
          orderBy: { courseCode: 'asc' },
        });
        return rows.map(toCourseClass);
      },
    },

    routines: {
      async listByUser(userId) {
        const rows = await prisma.routine.findMany({
          where: { userId },
          orderBy: { startMinute: 'asc' },
        });
        return rows.map(toRoutine);
      },
    },

    interests: {
      async listByUser(userId) {
        const rows = await prisma.interest.findMany({
          where: { userId },
          orderBy: { name: 'asc' },
        });
        return rows.map(toInterest);
      },
      async create(input) {
        const row = await prisma.interest.create({
          data: {
            userId: input.userId,
            name: input.name,
            desiredTimesPerUnit: input.desiredTimesPerUnit,
            frequencyUnit: input.frequencyUnit,
            typicalDurationMinutes: input.typicalDurationMinutes ?? null,
          },
        });
        return toInterest(row);
      },
    },

    consent: {
      async listByUser(userId) {
        const rows = await prisma.consentGrant.findMany({
          where: { userId },
          orderBy: { decidedAt: 'desc' },
        });
        return rows.map(toConsentGrant);
      },
      async record(input) {
        const row = await prisma.consentGrant.create({
          data: {
            userId: input.userId,
            category: input.category,
            decision: input.decision,
            source: input.source,
            revokedAt: input.decision === 'REVOKED' ? new Date() : null,
          },
        });
        return toConsentGrant(row);
      },
    },
  };
}
