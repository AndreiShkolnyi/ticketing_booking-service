import * as dotenv from 'dotenv'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import postgres from 'postgres'

dotenv.config()

const sql = postgres({
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	user: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	max: 10,
	idle_timeout: 20
})

async function main() {
	console.log('Running migrations...')

	await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
            )`)

	const dir = resolve(process.cwd(), 'migrations')
	const files = readdirSync(dir).sort()

	const applied = await sql<
		{ name: string }[]
	>`SELECT name FROM migrations ORDER BY id ASC`

	const appliedSet = new Set(applied.map(m => m.name))

	for (const file of files) {
		if (appliedSet.has(file)) continue

		const filePath = join(dir, file)

		const content = readFileSync(filePath, 'utf-8')

		console.log(`Running migration ${file}`)

		try {
			await sql.unsafe(content)

			await sql`INSERT INTO migrations (name) VALUES (${file})`

			console.log(`Migration ${file} applied`)
		} catch (error) {
			console.error(`Migration ${file} failed`, error)
			process.exit(1)
		}
	}

	console.log('Migrations completed')
	await sql.end()
	process.exit(0)
}

main()
