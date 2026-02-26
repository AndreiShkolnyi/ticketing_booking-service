/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PROTO_PATHS } from '@choncinema/contracts'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	const host = config.getOrThrow('GRPC_HOST')
	const port = config.getOrThrow('GRPC_PORT')

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: ['booking.v1'],
			protoPath: [PROTO_PATHS.BOOKING],
			url: `${host}:${port}`,
			loader: {
				keepCase: false,
				longs: String,
				enums: String,
				defaults: true,
				oneofs: true
			}
		}
	})
	await app.startAllMicroservices()
	await app.init()
}
bootstrap()
