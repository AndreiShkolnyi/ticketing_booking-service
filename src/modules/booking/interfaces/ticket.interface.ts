import { TicketStatus } from '../enums/ticket-status.enum'

export interface Ticket {
	id: string
	price: number
	status: TicketStatus

	paid_at: Date | null

	screening_id: string
	hall_id: string
	seat_id: string
	order_id: string

	created_at: Date
	updated_at: Date
}
