export const ALL_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sales', label: 'Ventas' },
  { id: 'products', label: 'Productos' },
  { id: 'categories', label: 'Categorías' },
  { id: 'inventory', label: 'Inventario' },
  {
    id: 'reports',
    label: 'Reportes',
    subs: [
      { id: 'ventas', label: 'Ventas' },
      { id: 'inventario', label: 'Inventario' },
      { id: 'ganancias', label: 'Ganancias' },
      { id: 'devoluciones', label: 'Devoluciones' },
    ],
  },
  {
    id: 'settings',
    label: 'Configuraciones',
    subs: [
      { id: 'account', label: 'Cuenta' },
      { id: 'billing', label: 'Facturación' },
      { id: 'users', label: 'Usuarios' },
    ],
  },
]

const ROLE_PRESETS = {
  admin: ALL_SECTIONS.flatMap((s) => [s.id, ...(s.subs || []).map((sub) => `${s.id}.${sub.id}`)]),
  supervisor: ['sales', 'products', 'categories', 'inventory'],
  cajero: ['sales'],
}

export const getDefaultPermissions = (role) => ROLE_PRESETS[role] || ROLE_PRESETS.cajero
