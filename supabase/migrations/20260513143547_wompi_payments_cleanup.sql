-- Cleanup: los campos de pago no pertenecen a pending_signups
ALTER TABLE pending_signups DROP COLUMN IF EXISTS billing_frequency;
ALTER TABLE pending_signups DROP COLUMN IF EXISTS payment_method;
ALTER TABLE pending_signups DROP COLUMN IF EXISTS wompi_transaction_id;
