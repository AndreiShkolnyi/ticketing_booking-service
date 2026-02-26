export const TICKET_COMMANDS = {
	CREATE_TICKER: `
        INSERT INTO tickets (id, screening_id, hall_id, seat_id, price, order_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `,
	MARK_TICKETS_PAID: `
        UPDATE tickets
        SET status='PAID', paid_at=$1
        WHERE order_id=$2   
    `,
	DELETE_TICKETS_FOR_ORDER: `
        DELETE FROM tickets
        WHERE order_id=$1
    `
} as const
