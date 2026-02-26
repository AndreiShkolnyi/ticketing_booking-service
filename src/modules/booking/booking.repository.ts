import { Injectable } from '@nestjs/common'
import { nanoid } from 'nanoid'
import { DatabaseService } from 'src/infra/database/database.service'
import { ORDER_COMMANDS } from 'src/infra/sql/commands/order.commands'
import { TICKET_COMMANDS } from 'src/infra/sql/commands/ticket.commands'
import { ORDER_QUERIES } from 'src/infra/sql/queries/order.queries'
import { TICKET_QUERIES } from 'src/infra/sql/queries/ticket.queries'

import { Order } from './interfaces/order.interface'
import { Ticket } from './interfaces/ticket.interface'

@Injectable()
export class BookingRepository {
	public constructor(private readonly database: DatabaseService) {}

	public async findUserPaidOrders(userId: string) {
		return this.database.raw<Order>(
			ORDER_QUERIES.FIND_PAID_ORDERS_FOR_USER,
			[userId]
		)
	}

	public async createOrder(input: Partial<Order>) {
		const rows = await this.database.raw<Order>(
			ORDER_COMMANDS.CREATE_ORDER,
			[nanoid(), input.user_id, input.amount]
		)

		return rows[0]
	}

	public async markOrderPaid(orderId: string) {
		return this.database.raw(ORDER_COMMANDS.SET_ORDER_PAID, [orderId])
	}

	public async updateOrderQr(orderId: string, qrCode: string | null) {
		return this.database.raw(ORDER_COMMANDS.SAVE_QR, [qrCode, orderId])
	}

	public async findOrderById(orderId: string) {
		const rows = await this.database.raw<Order>(
			ORDER_QUERIES.FIND_ORDER_BY_ID,
			[orderId]
		)

		return rows[0] ?? null
	}

	public async cancelOrder(orderId: string) {
		return this.database.raw(ORDER_COMMANDS.CANCEL_ORDER, [orderId])
	}

	public async findExistingTicket(screeningId: string, orderId: string) {
		const rows = await this.database.raw<Ticket>(
			TICKET_QUERIES.FIND_EXISTING_TICKETS,
			[screeningId, orderId]
		)

		return rows[0] ?? null
	}

	public async createTicket(
		input: Pick<
			Ticket,
			'screening_id' | 'hall_id' | 'seat_id' | 'price' | 'order_id'
		>
	) {
		const rows = await this.database.raw<Ticket>(
			TICKET_COMMANDS.CREATE_TICKER,
			[
				nanoid(),
				input.screening_id,
				input.hall_id,
				input.seat_id,
				input.price,
				input.order_id
			]
		)

		return rows[0]
	}

	public async markTicketsPaid(input: Pick<Ticket, 'paid_at' | 'order_id'>) {
		return await this.database.raw(TICKET_COMMANDS.MARK_TICKETS_PAID, [
			input.paid_at,
			input.order_id
		])
	}

	public async deleteTicketsByOrderId(orderId: string) {
		return await this.database.raw(
			TICKET_COMMANDS.DELETE_TICKETS_FOR_ORDER,
			[orderId]
		)
	}

	public async findReservedSeatIds(hallId: string, screeningId: string) {
		return await this.database.raw<{ seat_id: string }>(
			TICKET_QUERIES.LIST_RESERVED_SEATS,
			[hallId, screeningId]
		)
	}
}
