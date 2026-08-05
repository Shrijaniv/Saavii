/**
 * Module: api/config
 * Responsibility: Read and validate the service's environment.
 *
 * Pure: takes an environment object, returns config or throws with a message
 * naming what is missing. Startup should fail loudly and specifically rather
 * than surfacing as a confusing runtime error later.
 */

export interface ServerConfig {
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  port: number;
  host: string;
}

export class MissingConfigError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(
      `Missing required environment variable(s): ${missing.join(', ')}. See .env.example.`,
    );
    this.name = 'MissingConfigError';
    this.missing = missing;
  }
}

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '0.0.0.0';

export function readServerConfig(env: Record<string, string | undefined>): ServerConfig {
  const required = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length > 0) {
    throw new MissingConfigError([...missing]);
  }

  const port = env.PORT ? Number.parseInt(env.PORT, 10) : DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${env.PORT}".`);
  }

  return {
    databaseUrl: env.DATABASE_URL as string,
    supabaseUrl: env.SUPABASE_URL as string,
    supabaseAnonKey: env.SUPABASE_ANON_KEY as string,
    port,
    host: env.HOST?.trim() || DEFAULT_HOST,
  };
}
