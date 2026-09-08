/**
 * Shared D1 binding helper used by both admin and public API endpoints.
 * Returns the database regardless of whether the Pages binding is named
 * `DB` (the canonical name) or `zxqconsulting_comments` (legacy).
 */

interface DBEnv {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
}

export function getDB(env: DBEnv): D1Database | null {
  return (env.DB as D1Database | undefined) || (env.zxqconsulting_comments as D1Database | undefined) || null;
}

export type { DBEnv };