import { ConfigService } from '@nestjs/config'
import { Options } from 'postgres'

export function getDatabaseConfig(configService: ConfigService): Options<any> {
	return {
		host: configService.getOrThrow<string>('DATABASE_HOST'),
		port: Number(configService.getOrThrow<string>('DATABASE_PORT')),
		username: configService.getOrThrow<string>('DATABASE_USERNAME'),
		password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
		database: configService.getOrThrow<string>('DATABASE_NAME'),
		max: 10,
		idle_timeout: 20
	}
}
