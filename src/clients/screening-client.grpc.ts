import {
	GetScreeningRequest,
	ScreeningServiceClient
} from '@choncinema/contracts/gen/ts/screening'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class ScreeningClientGrpc implements OnModuleInit {
	private screeningService: ScreeningServiceClient

	public constructor(
		@Inject('SCREENING_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.screeningService =
			this.client.getService<ScreeningServiceClient>('ScreeningService')
	}

	public getById(data: GetScreeningRequest) {
		return this.screeningService.getScreening(data)
	}
}
