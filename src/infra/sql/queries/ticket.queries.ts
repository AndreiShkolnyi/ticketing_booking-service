export const TICKET_QUERIES = {
	FIND_EXISTING_TICKETS: `
        SELECT *
        FROM tickets
        WHERE screening_id=$1 AND seat_id=$2
    `,
	LIST_RESERVED_SEATS: `
        SELECT seat_id
        FROM tickets
        WHERE hall_id=$1
            AND screening_id=$1
            AND status IN ('RESERVED', 'PAID')
        `
}
