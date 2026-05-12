-- ============================================
-- MIGRATION: Add ticket_number to salesTickets
-- Fecha: 2026-05-11
-- Descripción: Agrega número de ticket secuencial
--   por negocio, tabla ticket_counters para
--   concurrencia, y función RPC get_next_ticket.
-- ============================================

-- ============================================
-- 1. Tabla ticket_counters
-- ============================================
CREATE TABLE IF NOT EXISTS public.ticket_counters (
    business_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_number INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.ticket_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own counter"
ON public.ticket_counters;

CREATE POLICY "Users can manage own counter"
ON public.ticket_counters
FOR ALL
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

-- ============================================
-- 2. Función RPC get_next_ticket (atómica)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_next_ticket(p_business_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
BEGIN
    INSERT INTO public.ticket_counters (business_id, last_number)
    VALUES (p_business_id, 0)
    ON CONFLICT (business_id) DO NOTHING;

    UPDATE public.ticket_counters
    SET last_number = last_number + 1
    WHERE business_id = p_business_id
    RETURNING last_number INTO next_number;

    RETURN next_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_next_ticket TO authenticated;

-- ============================================
-- 3. Agregar ticket_number a salesTickets
-- ============================================
ALTER TABLE public."salesTickets" ADD COLUMN IF NOT EXISTS ticket_number INTEGER;

-- Backfill: numeración secuencial por negocio
UPDATE public."salesTickets" st
SET ticket_number = sub.row_num
FROM (
    SELECT id, ROW_NUMBER() OVER (
        PARTITION BY business_id ORDER BY created_at, id
    ) AS row_num
    FROM public."salesTickets"
) sub
WHERE st.id = sub.id
  AND st.ticket_number IS NULL;

ALTER TABLE public."salesTickets" ALTER COLUMN ticket_number SET NOT NULL;

-- Inicializar ticket_counters con negocios existentes
INSERT INTO public.ticket_counters (business_id, last_number)
SELECT business_id, MAX(ticket_number)
FROM public."salesTickets"
GROUP BY business_id
ON CONFLICT (business_id) DO NOTHING;

-- ============================================
-- 4. Actualizar vista vw_sales_history
-- ============================================
DROP VIEW IF EXISTS public.vw_sales_history CASCADE;
CREATE VIEW public.vw_sales_history WITH (security_invoker = true) AS
SELECT
    st.id,
    st.ticket_number,
    st.total_amount,
    st.created_at,
    st.payment_method,
    st.status,
    st.business_id,
    jsonb_agg(
        jsonb_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'quantity', si.quantity,
            'price', si.unit_price,
            'subtotal', si.subtotal,
            'name', COALESCE(p.name, 'Producto eliminado')
        )
        ORDER BY si.id
    ) AS items,
    SUM(si.quantity)::int AS items_count
FROM public."salesTickets" st
JOIN public."salesItems" si ON si.sale_id = st.id
LEFT JOIN public.products p ON p.id = si.product_id
GROUP BY st.id;
