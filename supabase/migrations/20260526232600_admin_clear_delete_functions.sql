CREATE OR REPLACE FUNCTION clear_business_data(p_business_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM returns_items
    WHERE return_id IN (SELECT id FROM returns WHERE business_id = p_business_id);

    DELETE FROM returns WHERE business_id = p_business_id;

    DELETE FROM "salesItems"
    WHERE sale_id IN (SELECT id FROM "salesTickets" WHERE business_id = p_business_id);

    DELETE FROM "salesTickets" WHERE business_id = p_business_id;

    DELETE FROM inventory_movements WHERE business_id = p_business_id;

    DELETE FROM inventory WHERE business_id = p_business_id;

    DELETE FROM products WHERE business_id = p_business_id;

    DELETE FROM categories WHERE business_id = p_business_id;

    DELETE FROM support_tickets WHERE business_id = p_business_id;

    DELETE FROM ticket_counters WHERE business_id = p_business_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_client_account(p_business_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_ids UUID[];
BEGIN
    PERFORM clear_business_data(p_business_id);

    DELETE FROM payment_transactions WHERE business_id = p_business_id;

    DELETE FROM subscriptions WHERE business_id = p_business_id;

    user_ids := ARRAY(SELECT id FROM profiles WHERE business_id = p_business_id);

    DELETE FROM profiles WHERE business_id = p_business_id;

    DELETE FROM businesses WHERE user_id = p_business_id;

    RETURN user_ids;
END;
$$;
