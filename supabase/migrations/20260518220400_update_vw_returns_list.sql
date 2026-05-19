DROP VIEW IF EXISTS public.vw_returns_list CASCADE;

CREATE OR REPLACE VIEW public.vw_returns_list WITH (security_invoker = on) AS
SELECT
    r.id AS return_id,
    r.business_id,
    r.sale_id,
    r.reason,
    r.total_amount,
    r.created_at AS return_date,
    COALESCE(ri.total_items, 0) AS total_items_returned,
    st.ticket_number
FROM public.returns r
LEFT JOIN (
    SELECT return_id, SUM(quantity)::int AS total_items
    FROM public.returns_items
    GROUP BY return_id
) ri ON ri.return_id = r.id
LEFT JOIN public."salesTickets" st ON st.id = r.sale_id;
