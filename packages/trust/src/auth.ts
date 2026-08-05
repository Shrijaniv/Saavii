/**
 * Module: trust/auth
 * Responsibility: Verify a caller's session and hand back an authenticated
 * identity. Supabase Auth wiring lives here and nowhere else (decision 0003).
 *
 * Orchestrators depend on the `SessionVerifier` interface rather than on
 * Supabase, so `apps/api` stays provider-agnostic and its tests can substitute
 * a fake verifier.
 */

import { createClient } from '@supabase/supabase-js';

import type { UserId } from '@saavii/contracts';

export interface AuthenticatedUser {
  id: UserId;
  email: string;
}

export interface SessionVerifier {
  /** Resolves to the user, or null when the token is missing, expired, or
   * invalid. Never throws for an ordinary bad token — callers turn null into a
   * 401. */
  verify(accessToken: string): Promise<AuthenticatedUser | null>;
}

export interface SupabaseAuthConfig {
  url: string;
  /** Anon (public) key. The service-role key must never reach this process
   * path — it bypasses row-level security. */
  anonKey: string;
}

/**
 * Extract the bearer token from an Authorization header.
 *
 * Pure and total: anything that is not a well-formed `Bearer <token>` yields
 * null, so a malformed header is treated as "no session" rather than an error.
 */
export function bearerTokenFrom(headerValue: string | undefined | null): string | null {
  if (!headerValue) return null;

  const match = /^Bearer[ \t]+(\S+)$/i.exec(headerValue.trim());
  return match?.[1] ?? null;
}

export function createSupabaseSessionVerifier(config: SupabaseAuthConfig): SessionVerifier {
  const client = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async verify(accessToken) {
      const { data, error } = await client.auth.getUser(accessToken);
      if (error || !data.user?.email) return null;

      return { id: data.user.id, email: data.user.email };
    },
  };
}
