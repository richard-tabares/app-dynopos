-- Update vw_sales_history to include variation_id and variation_name
DROP VIEW IF EXISTS vw_sales_history;
CREATE OR REPLACE VIEW vw_sales_history WITH (security_invoker = true) AS
SELECT
    st.id,
    st.total_amount,
    st.created_at,
    st.payment_method,
    st.status,
    st.business_id,
    st.ticket_number,
    st.created_by,
    prof.display_name AS created_by_name,
    jsonb_agg(
        jsonb_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'variation_id', si.variation_id,
            'variation_name', si.variation_name,
            'quantity', si.quantity,
            'price', si.unit_price,
            'subtotal', si.subtotal,
            'name', COALESCE(p.name, 'Producto eliminado')
        )
        ORDER BY si.id
    ) AS items,
    SUM(si.quantity)::int AS items_count
FROM "salesTickets" st
JOIN "salesItems" si ON si.sale_id = st.id
LEFT JOIN products p ON p.id = si.product_id
LEFT JOIN profiles prof ON prof.id = st.created_by
GROUP BY st.id, prof.display_name;
