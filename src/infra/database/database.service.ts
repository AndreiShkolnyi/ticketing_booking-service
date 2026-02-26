import {
	Inject,
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit
} from '@nestjs/common'
import type { Sql } from 'postgres'

import { PG } from './database.constants'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(DatabaseService.name)

	constructor(@Inject(PG) private readonly sql: Sql) {}

	async onModuleInit() {
		const start = Date.now()

		this.logger.log('Connection to db...')

		try {
			await this.sql`SELECT 1`
			const ms = Date.now() - start

			this.logger.log(`Connected to db in ${ms}ms`)
		} catch (error) {
			this.logger.error('Failed to connect to db', error)
			throw error
		}
	}

	async onModuleDestroy() {
		this.logger.log('Disconnecting from db...')
		try {
			await this.sql.end()
			this.logger.log('Disconnected from db')
		} catch (err) {
			this.logger.error('Failed to disconnect from db', err)
		}
	}

	public query(strings: TemplateStringsArray, ...values: any[]) {
		return this.sql(strings, values)
	}

	public raw<T = any>(query: string, params: any[] = []) {
		return this.sql.unsafe<T[]>(query, params)
	}
}
