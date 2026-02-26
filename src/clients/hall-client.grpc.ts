import {
	GetHallRequest,
	HallServiceClient
} from '@choncinema/contracts/gen/ts/hall'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class HallClientGrpc implements OnModuleInit {
	private hallService: HallServiceClient

	public constructor(
		@Inject('HALL_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.hallService =
			this.client.getService<HallServiceClient>('HallService')
	}

	public getById(data: GetHallRequest) {
		return this.hallService.getHall(data)
	}
}
