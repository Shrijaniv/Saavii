/**
 * Module: trust/data-rights
 * Responsibility: The user-level export and deletion workflows (Volume I,
 * Ch. 10: "Allow users to view, edit, export, and delete memories" and "Allow
 * complete account deletion").
 *
 * Interfaces only for now. Deletion must be real, cascading, and verified — a
 * soft flag that lingers does not satisfy the commitment (see
 * packages/trust/README.md). The implementation lands with the systems whose
 * data it has to reach, and Phase 7 tests it end to end (Volume V).
 */

import type { UserId } from '@saavii/contracts';

export interface DataExportRequest {
  userId: UserId;
  requestedAt: Date;
}

export interface DataExportResult {
  userId: UserId;
  /** Machine-readable export of everything Saavii holds for the user. */
  payload: Record<string, unknown>;
  generatedAt: Date;
}

export interface DeletionRequest {
  userId: UserId;
  requestedAt: Date;
  /** Deleting the account removes every system's data; a scoped request
   * removes only the named categories. */
  scope: 'ACCOUNT' | 'MEMORY_ONLY';
}

export interface DeletionReceipt {
  userId: UserId;
  completedAt: Date;
  /** What was removed, per system, so the deletion is verifiable. */
  removed: Record<string, number>;
}

export interface DataRightsService {
  export(request: DataExportRequest): Promise<DataExportResult>;
  delete(request: DeletionRequest): Promise<DeletionReceipt>;
}
