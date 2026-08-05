/**
 * Module: contracts/proposals
 * Responsibility: The Action Protocol — the versioned schema for every
 * structured proposal the Reasoning Engine returns.
 *
 * This is the ONLY channel by which LLM output reaches the rest of the system
 * (CLAUDE.md constraint 3; ARCHITECTURE.md §5; Volume II & IV "Action
 * Protocol"). A proposal describes an intent; it never performs one.
 *
 * Types only — no behavior. Runtime validation of these shapes is an
 * orchestrator responsibility (see packages/contracts/README.md).
 */

import type { EntityId, MinuteOfDay } from './entities.js';

/** Bump when a proposal shape changes incompatibly; every proposal carries it
 * so older clients and stored proposals stay interpretable (Volume II). */
export const ACTION_PROTOCOL_SCHEMA_VERSION = 1;

/** Volume II, "Action Protocol". Extend deliberately — each action needs a
 * validated executor before it can be proposed. */
export type ActionType =
  | 'CREATE_BLOCK'
  | 'MOVE_BLOCK'
  | 'RESIZE_BLOCK'
  | 'DELETE_BLOCK'
  | 'COMPLETE_BLOCK'
  | 'UPDATE_TASK_ESTIMATE'
  | 'UPDATE_PRIORITY_OVERRIDE'
  | 'CREATE_REMINDER'
  | 'CREATE_RECURRING_ROUTINE'
  | 'CREATE_MEMORY'
  | 'UPDATE_MEMORY'
  | 'DELETE_MEMORY'
  | 'LINK_ENTITIES'
  | 'UNLINK_ENTITIES';

/** Every interaction surface shares one backend path (ARCHITECTURE.md §5). */
export type SourceModality =
  | 'VOICE'
  | 'CHAT'
  | 'UI'
  | 'WIDGET'
  | 'NOTIFICATION_ACTION'
  | 'AUTOMATION';

/**
 * Volume II: "Exact requests are treated as hard constraints unless
 * impossible. Approximate requests such as 'around', 'sometime', or 'after'
 * become flexible constraints."
 */
export type ConstraintStrength = 'EXACT' | 'PREFERRED';

export interface EntityReference {
  kind: string;
  id: EntityId;
}

/** Context needed to resolve ambiguous references such as "this time"
 * (Volume II). Absent fields mean the surface could not supply them. */
export interface ContextIdentifiers {
  /** IANA timezone the request was made in. */
  timezone: string;
  /** Screen or surface the user was on, e.g. "TODAY", "CALENDAR". */
  screen?: string;
  /** Object the user had selected when they spoke or tapped. */
  selectedEntity?: EntityReference;
  conversationId?: string;
}

export interface ActionProposal<TAction extends ActionType = ActionType, TParameters = unknown> {
  schemaVersion: number;
  action: TAction;
  parameters: TParameters;
  sourceModality: SourceModality;
  /** The user's words, verbatim — kept for auditability and explanation. */
  originalRequest: string;
  /** The model's confidence in its interpretation, 0..1. */
  confidence: number;
  referencedEntities: EntityReference[];
  contextIdentifiers: ContextIdentifiers;
}

// ── Parameter shapes ────────────────────────────────────────────────────────

export type BlockType = 'WORK' | 'BREAK' | 'MEAL' | 'COMMUTE' | 'PERSONAL' | 'CLASS';

/** The worked example from Volume II: "Add an hour break around 3 PM." */
export interface CreateBlockParameters {
  blockType: BlockType;
  durationMinutes: number;
  preferredStart: MinuteOfDay | null;
  /** How far the planner may shift `preferredStart` when placing the block. */
  flexibilityMinutes: number;
  constraintStrength: ConstraintStrength;
}

export type CreateBlockProposal = ActionProposal<'CREATE_BLOCK', CreateBlockParameters>;

/**
 * What the Reasoning Engine returns for a user utterance.
 *
 * Volume II: "When required information cannot be inferred safely, Saavii asks
 * a concise clarification." A clarification is a first-class outcome — never a
 * guessed proposal.
 */
export type ReasoningOutcome =
  | { kind: 'PROPOSAL'; proposal: ActionProposal }
  | { kind: 'CLARIFICATION'; question: string };
