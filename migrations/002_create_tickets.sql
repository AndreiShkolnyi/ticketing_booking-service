-- migration: create_tickets

CREATE TYPE tickets_status AS ENUM (
    'RESERVED',
    'PAID',
    'CANCELED'
);

CREATE TABLE tickets (
    id TEXT PRIMARY KEY,

    price INTEGER NOT NULL DEFAULT 0,
    status tickets_status NOT NULL DEFAULT 'RESERVED',

    paid_at TIMESTAMP,

    screening_id TEXT NOT NULL,
    hall_id TEXT NOT NULL,
    seat_id TEXT NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uniq_ticket_screening_seat ON tickets (screening_id, seat_id);

CREATE OR REPLACE FUNCTION update_timestamp(
) RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tickets_update_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();