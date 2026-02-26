import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import postgres from 'postgres'
import { getDatabaseConfig } from 'src/config/database.config'

import { PG } from './database.constants'
import { DatabaseService } from './database.service'

@Module({
	providers: [
		DatabaseService,
		{
			provide: PG,
			useFactory: (configService: ConfigService) => {
				const options = getDatabaseConfig(configService)

				return postgres(options)
			},
			inject: [ConfigService]
		}
	],
	exports: [PG]
})
export class DatabaseModule {}
