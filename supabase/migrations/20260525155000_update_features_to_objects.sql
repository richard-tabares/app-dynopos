-- Update features column from string array to object array with title+description
UPDATE subscription_plans
SET features = jsonb_build_array(
  jsonb_build_object('title', 'Punto de venta', 'description', 'Facturación rápida desde cualquier dispositivo'),
  jsonb_build_object('title', 'Gestión de productos', 'description', 'Administra precios, categorías y variantes'),
  jsonb_build_object('title', 'Control de inventario', 'description', 'Gestiona stock y movimientos en tiempo real'),
  jsonb_build_object('title', 'Reportes Dinámicos', 'description', 'Analiza tu negocio con datos precisos'),
  jsonb_build_object('title', 'Gestión de Usuarios', 'description', 'Administra empleados y permisos del sistema'),
  jsonb_build_object('title', 'Soporte email', 'description', 'Asistencia técnica vía correo electrónico'),
  jsonb_build_object('title', 'Soporte WhatsApp', 'description', 'Atención directa por mensajería instantánea'),
  jsonb_build_object('title', 'Panel de Control', 'description', 'Visualiza KPIs, gráficos y alertas de tu negocio en tiempo real'),
  jsonb_build_object('title', 'Órdenes Múltiples', 'description', 'Gestiona varias órdenes simultáneas con pedidos en espera'),
  jsonb_build_object('title', 'Roles y Permisos', 'description', 'Control de acceso por roles: admin, supervisor y cajero')
)
WHERE name = 'Plan Emprendedor';