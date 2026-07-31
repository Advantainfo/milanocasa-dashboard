import { Client } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const BCRYPT_ROUNDS = 12
const MIN_PASSWORD_LENGTH = 8

async function main() {
  const connectionString = process.env.DATABASE_URL
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in."
    )
  }
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local.")
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  }

  const client = new Client(connectionString)
  await client.connect()

  try {
    const { rows } = await client.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM users"
    )

    if (rows[0].count > 0) {
      console.log(
        "An admin user already exists. Log in and use Settings to change the password instead of re-running this script."
      )
      return
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    await client.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [
      email,
      passwordHash,
    ])

    console.log(`Admin user created for ${email}.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
