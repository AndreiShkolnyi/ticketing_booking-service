import { OrderStatus } from '../enums/order-status.enum'

import { Ticket } from './ticket.interface'

export interface Order {
	id: string
	amount: number
	status: OrderStatus
	qr_code: string | null
	user_id: string
	tickets: Ticket[]

	created_at: Date
	updated_at: Date
}
