import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path, { join } from 'node:path'

const name = process.argv[2]

if (!name) {
	console.error('Please provide migration name')
	process.exit(1)
}

const dir = path.resolve(process.cwd(), 'migrations')
if (!existsSync(dir)) mkdirSync(dir)

function nextNumber() {
	const files = readdirSync(dir)

	const numbers = files
		.map(f => parseInt(f.split('_')[0]))
		.filter(n => !isNaN(n))

	return numbers.length === 0
		? '001'
		: String(Math.max(...numbers) + 1).padStart(3, '0')
}

const filename = `${nextNumber()}_${name}.sql`

const filePath = join(dir, filename)

writeFileSync(filePath, `-- migration: ${name}\n\n`)

console.log('Created migration:', filename)
