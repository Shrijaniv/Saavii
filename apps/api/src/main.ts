/**
 * Module: api/main
 * Responsibility: The composition root — read config, wire the real Store and
 * session verifier, start listening, and shut down cleanly.
 *
 * The only place that knows which concrete implementations back the interfaces
 * `buildServer` depends on. It still imports no Prisma and no Supabase client
 * directly: `store` and `trust` own those (ARCHITECTURE.md §4).
 */

import { createStoreFromDatabaseUrl } from '@saavii/store';
import { createSupabaseSessionVerifier } from '@saavii/trust';

import { readServerConfig } from './config.js';
import { buildServer } from './server.js';

async function main(): Promise<void> {
  const config = readServerConfig(process.env);

  const store = createStoreFromDatabaseUrl(config.databaseUrl);
  const sessionVerifier = createSupabaseSessionVerifier({
    url: config.supabaseUrl,
    anonKey: config.supabaseAnonKey,
  });

  const app = buildServer({ store, sessionVerifier, logger: true });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void app
        .close()
        .then(() => store.disconnect())
        .then(() => process.exit(0));
    });
  }

  await app.listen({ port: config.port, host: config.host });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
