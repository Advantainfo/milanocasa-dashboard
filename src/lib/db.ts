import "server-only"

import {
  Pool,
  types,
  type PoolClient,
  type QueryResultRow,
} from "@neondatabase/serverless"

/**
 * Postgres `date` columns have no time-of-day or timezone. The driver's
 * default parser builds a JS `Date` from local-midnight, which silently
 * shifts a calendar day backward or forward once that value is read in a
 * different timezone than the one that parsed it (e.g. a Vercel function in
 * UTC vs. a browser in Italy) - exactly the kind of bug that would show a
 * furniture delivery on the wrong day. Returning the raw "YYYY-MM-DD" string
 * instead keeps it timezone-independent everywhere.
 */
types.setTypeParser(types.builtins.DATE, (value) => value)

/**
 * Cached on `globalThis` so dev-mode HMR / Turbopack module reloads reuse the
 * same pool instead of opening a new one on every file change.
 */
const globalForPool = globalThis as unknown as { neonPool?: Pool }

function getPool(): Pool {
  if (!globalForPool.neonPool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set.")
    }
    globalForPool.neonPool = new Pool({ connectionString })
  }
  return globalForPool.neonPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(text, params)
  return result.rows
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

/** Runs `callback` inside a BEGIN/COMMIT block, rolling back on any thrown error. */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
