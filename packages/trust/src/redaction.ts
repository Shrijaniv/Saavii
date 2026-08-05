/**
 * Module: trust/redaction
 * Responsibility: Strip credentials and other sensitive values out of anything
 * on its way to a log, an analytics sink, or a model call.
 *
 * Volume IV, Security requirements: "OAuth tokens encrypted and isolated from
 * application logs", "No sensitive payloads in analytics", and "Structured
 * redaction before model calls where possible". Other packages use these
 * helpers rather than writing their own (packages/trust/README.md).
 */

export const REDACTED = '[REDACTED]';

/**
 * Keys whose values never leave this process in the clear. Matched
 * case-insensitively against the whole key, so `refreshToken`, `access_token`,
 * and `Authorization` all match.
 */
const SENSITIVE_KEY_PATTERN =
  /(token|secret|password|passwd|credential|authorization|auth[-_]?header|api[-_]?key|client[-_]?secret|session[-_]?id|cookie|private[-_]?key)/i;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

/**
 * Deep-copy `value` with every sensitive field replaced by `REDACTED`.
 *
 * Never mutates the input — callers routinely pass the live object they are
 * about to use. Cycles are replaced with `[CIRCULAR]` so a self-referencing
 * payload can't hang a logging call.
 */
export function redactSecrets<T>(value: T): T {
  return redactValue(value, new WeakSet<object>()) as T;
}

function redactValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value.getTime());

  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry, seen));
  }

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    output[key] = isSensitiveKey(key) ? REDACTED : redactValue(entry, seen);
  }
  return output;
}
