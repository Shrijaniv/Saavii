/**
 * Module: store/ports
 * Responsibility: The repository interfaces callers depend on, and their input
 * types.
 *
 * Kept free of Prisma so orchestrators (apps/api, workers) depend on the shape
 * of persistence rather than the database client — which also lets their tests
 * substitute in-memory fakes. The Prisma implementations live in
 * repositories.ts; only that file may import Prisma (ARCHITECTURE.md §4).
 */

import type {
  ConsentCategory,
  ConsentDecision,
  ConsentGrant,
  CourseClass,
  FrequencyUnit,
  Goal,
  GoalHorizon,
  Interest,
  Routine,
  UserId,
  UserProfile,
} from '@saavii/contracts';

export interface UpsertProfileInput {
  id: UserId;
  email: string;
  displayName?: string | null;
  university?: string | null;
  timezone: string;
}

export interface CreateGoalInput {
  userId: UserId;
  title: string;
  description?: string | null;
  horizon: GoalHorizon;
  targetDate?: Date | null;
}

export interface CreateInterestInput {
  userId: UserId;
  name: string;
  desiredTimesPerUnit: number;
  frequencyUnit: FrequencyUnit;
  typicalDurationMinutes?: number | null;
}

export interface RecordConsentInput {
  userId: UserId;
  category: ConsentCategory;
  decision: ConsentDecision;
  /** Where the decision came from, e.g. "onboarding", "profile-settings". */
  source: string;
}

export interface ProfileRepository {
  findById(userId: UserId): Promise<UserProfile | null>;
  upsert(input: UpsertProfileInput): Promise<UserProfile>;
}

export interface GoalRepository {
  listByUser(userId: UserId): Promise<Goal[]>;
  create(input: CreateGoalInput): Promise<Goal>;
}

export interface ClassRepository {
  listByUser(userId: UserId): Promise<CourseClass[]>;
}

export interface RoutineRepository {
  listByUser(userId: UserId): Promise<Routine[]>;
}

export interface InterestRepository {
  listByUser(userId: UserId): Promise<Interest[]>;
  create(input: CreateInterestInput): Promise<Interest>;
}

export interface ConsentRepository {
  /** Full decision history, newest first — revocations are new rows, so the
   * trail survives (Volume I, Ch. 10 auditability). */
  listByUser(userId: UserId): Promise<ConsentGrant[]>;
  record(input: RecordConsentInput): Promise<ConsentGrant>;
}

export interface Store {
  profiles: ProfileRepository;
  goals: GoalRepository;
  classes: ClassRepository;
  routines: RoutineRepository;
  interests: InterestRepository;
  consent: ConsentRepository;
}
