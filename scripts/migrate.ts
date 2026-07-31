import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { Client } from "@neondatabase/serverless"

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations")

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in."
    )
  }

  const client = new Client(connectionString)
  await client.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `)

    const { rows: appliedRows } = await client.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations"
    )
    const applied = new Set(appliedRows.map((row) => row.filename))

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file} (already applied)`)
        continue
      }

      console.log(`apply ${file}`)
      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8")

      await client.query("BEGIN")
      try {
        await client.query(sql)
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file])
        await client.query("COMMIT")
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      }
    }

    console.log("Migrations up to date.")
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
