import { describe, expect, it } from 'vitest';

import { MissingConfigError, readServerConfig } from './config.js';

const complete = {
  DATABASE_URL: 'postgresql://localhost:5432/saavii',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
};

describe('readServerConfig', () => {
  it('reads a complete environment and applies defaults', () => {
    expect(readServerConfig(complete)).toEqual({
      databaseUrl: complete.DATABASE_URL,
      supabaseUrl: complete.SUPABASE_URL,
      supabaseAnonKey: complete.SUPABASE_ANON_KEY,
      port: 3000,
      host: '0.0.0.0',
    });
  });

  it('names every missing variable at once', () => {
    try {
      readServerConfig({ DATABASE_URL: complete.DATABASE_URL });
      throw new Error('expected readServerConfig to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(MissingConfigError);
      expect((error as MissingConfigError).missing).toEqual(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
    }
  });

  it('treats a blank value as missing', () => {
    expect(() => readServerConfig({ ...complete, SUPABASE_ANON_KEY: '   ' })).toThrowError(
      MissingConfigError,
    );
  });

  it('honours PORT and HOST overrides', () => {
    const config = readServerConfig({ ...complete, PORT: '8080', HOST: '127.0.0.1' });

    expect(config.port).toBe(8080);
    expect(config.host).toBe('127.0.0.1');
  });

  it.each(['0', '70000', 'not-a-number'])('rejects PORT=%s', (port) => {
    expect(() => readServerConfig({ ...complete, PORT: port })).toThrowError(/PORT must be/);
  });
});
