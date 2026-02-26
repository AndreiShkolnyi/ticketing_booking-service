import {
	GetSeatRequest,
	SeatServiceClient
} from '@choncinema/contracts/gen/ts/seat'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class SeatClientGrpc implements OnModuleInit {
	private seatService: SeatServiceClient

	public constructor(
		@Inject('SEAT_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.seatService =
			this.client.getService<SeatServiceClient>('SeatService')
	}

	public getById(data: GetSeatRequest) {
		return this.seatService.getSeat(data)
	}
}
