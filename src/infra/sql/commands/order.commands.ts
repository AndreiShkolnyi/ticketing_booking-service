export const ORDER_COMMANDS = {
	CREATE_ORDER: `
            INSERT INTO orders (id, user_id, amount)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
	SET_ORDER_PAID: `
            UPDATE orders
            SET status='PAID'
            WHERE id=$1
            `,
	CANCEL_ORDER: `
            UPDATE orders
            SET status='CANCELED', qr_code=NULL
            WHERE id=$1
            `,
	SAVE_QR: `
            UPDATE orders
            SET qr_code=$1
            WHERE id=$2
            `
} as const
