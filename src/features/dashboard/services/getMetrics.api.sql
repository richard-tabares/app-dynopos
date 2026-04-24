create or replace function get_dashboard_metrics()
returns json as $$
declare result json;
begin
  select json_build_object(
    
    'summary', (
      select json_build_object(
        'ventasHoy', SUM(CASE WHEN DATE(fecha) = CURRENT_DATE THEN monto ELSE 0 END),
        'ventasAyer', SUM(CASE WHEN DATE(fecha) = CURRENT_DATE - INTERVAL '1 day' THEN monto ELSE 0 END)
      )
      from ventas
    ),

    'weekly', (
      select json_build_object(
        'ventas', SUM(monto)
      )
      from ventas
      where fecha >= CURRENT_DATE - INTERVAL '7 days'
    ),

    'inventory', (
      select json_build_object(
        'lowStock', COUNT(*)
      )
      from productos
      where stock < 10
    ),

    'recentSales', (
      select json_agg(t)
      from (
        select id, total
        from ventas
        order by fecha desc
        limit 5
      ) t
    ),

    'topProducts', (
      select json_agg(t)
      from (
        select producto_id, count(*) as ventas
        from ventas
        group by producto_id
        order by ventas desc
        limit 5
      ) t
    )

  ) into result;

  return result;
end;
$$ language plpgsql;