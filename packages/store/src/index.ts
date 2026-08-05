/**
 * Module: store
 * Responsibility: The Operational Store — the only database boundary
 * (ARCHITECTURE.md §4).
 *
 * Import `Store` and the repository ports for everyday use; `createStore` is
 * for composition roots (the API server, workers) that own the Prisma client.
 */

export * from './ports.js';
export * from './mappers.js';
export {
  createStore,
  createStoreFromDatabaseUrl,
  type ConnectedStore,
} from './repositories.js';
