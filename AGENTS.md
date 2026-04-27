# Agent Instructions

## Repository Structure

```
dynopos-app/
├── backend/                 # Express + Supabase API
│   └── src/
│       ├── controllers/     # Supabase queries
│       ├── routes/          # API endpoints
│       └── middleware/      # authenticate middleware
└── frontend/                # React (Vite) + Tailwind + Zustand
    └── src/
        ├── app/             # App.jsx (routes), main.jsx (entry), store
        │   ├── layout/      # DashboardLayout, SideBar, Header
        │   └── providers/   # Zustand store (store.js)
        ├── features/        # Feature modules
        │   ├── auth/        # Login, SignUp, logout/signup helpers
        │   ├── dashboard/   # Dashboard page, services/ (raw SQL)
        │   ├── sales/       # POS sale page, SaleTicketModal
        │   ├── products/    # Product CRUD pages + helpers
        │   ├── categories/  # Category CRUD page + helpers
        │   ├── inventory/   # Inventory page, AdjustmentModal, Summary
        │   ├── reports/     # Placeholder (empty)
        │   └── settings/    # Business settings, logo upload, password
        └── shared/
            ├── components/  # SaleTicketModal, etc.
            ├── styles/      # App.css (Tailwind v4 config)
            └── helpers/     # apiFetch, getAuthHeaders
```

## Commands

```bash
# Backend
cd backend && npm run dev      # Express server on port 3000
cd backend && npm test         # npm test (no tests configured)

# Frontend
cd frontend && npm run dev     # Vite dev server (default 5173)
cd frontend && npm run build   # Build for production
cd frontend && npm run lint    # ESLint flat config check
```

## Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Zustand (persist middleware), Recharts, React Router v7, lucide-react, motion, react-toastify
- **Backend**: Express 5, Supabase JS, ES Modules, multer (file uploads), cors, dotenv
- **Dev tools**: @vitejs/plugin-react, @rolldown/plugin-babel, babel-plugin-react-compiler, @tailwindcss/vite, ESLint flat config

## Key Conventions

### Frontend Architecture

- **Entry point**: `src/app/main.jsx` renders `<App />`
- **Routing**: Defined in `src/app/App.jsx` using React Router v7. Public routes (`/login`, `/signup`) and protected routes wrapped in `<DashboardLayout>` (with `<SideBar>` + `<Header>` + `<Outlet />`). Auth guard: checks `user && Object.keys(user).length > 0`. Catch-all redirects to `/dashboard` or `/login`.
- **Navigation**: `<NavLink>` with `isActive` styling. `<SideBar>` collapsible (icons-only on large screens, overlay on mobile).
- **CSS**: Tailwind v4 CSS-first config via `@import 'tailwindcss'` — **NO `tailwind.config.js`**. Custom theme with `@theme` block: `primary-*` (sky blue), `accent-*` (emerald), `danger-*` (red). Global focus styles in base layer.
- **Currency formatting**: `Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })` throughout.

### Zustand Store (`src/app/providers/store.js`)

Uses `persist` middleware (`name: 'dynopos-store'`) with token migration helper.

**State**:
- `user` — Full auth object: `user.data.user.id`, `user.business.*`, `user.profile.role`
- `token` — Access token
- `isMobile` / `isCollapsed` — Sidebar state
- `products` — Cached products array
- `cart` — Shopping cart (addToCart, removeFromCart, updateQuantity, clearCart)
- `todayRevenue` — Cached dashboard revenue
- `categories` — Cached categories array

**Key actions**: `setLogin`, `setLogOut`, `setToken`, `setBusiness`, `setIsMobile`, `setIsCollapsed`, `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `setTodayRevenue`, `setCategories`

### Authentication & Authorization

- **Backend**: `authenticate` middleware (`src/middleware/authenticate.js`) extracts Bearer token, creates a per-request Supabase client (`autoRefreshToken: false`, `persistSession: false`), validates via `supabaseClient.auth.getUser(token)`, and attaches `req.user` + `req.supabase` to the request.
- **Controller pattern**: `const getClient = (req) => req.supabase || supabase` (fallback to admin client).
- **Frontend auth**: Login stores full response (user, profile, business, access_token) via `setLogin`. Logout calls `/api/auth/logout` then clears store. `apiFetch` helper auto-redirects to `/login` on 401.
- **Signup flow**: Creates auth user, then inserts into `profiles` (role: 'admin'), `businesses`, and creates a default 'General' category.

### API Helpers Pattern

Frontend API calls go in `features/{feature}/helpers/`. Each helper fetches from `VITE_API_URL` (env var).

- **`shared/helpers/apiFetch.js`**: Wraps `fetch()` with auth headers from Zustand store; auto-redirects to `/login` on 401.
- **`shared/helpers/getAuthHeaders.js`**: Generates `Authorization: Bearer` header.

### Supabase Nested Queries

Supabase `select()` returns nested objects. Example from `productsControllers.js`:
```js
select(`id, name, categories (id, name)`)  // returns product.categories.id
```
When initializing form state from these, use `editProductData.categories?.id` not `editProductData.category_id`.

### Select Default Values in React

For controlled selects in React, set `value` on the `<select>` element. Don't use `selected` on `<option>` — it interferes with the controlled value.

### Backend CORS

Backend runs on port 3000 and needs CORS enabled for frontend origin.

### Environment Variables

Frontend uses `.env` with `VITE_` prefix (Vite requirement). Backend uses `.env` (dotenv).
- **`BUSINESS_LOGO_URL`**: URL para el logo del negocio (opcional).

### Sidebar Colapsable

El menú lateral puede colapsarse para mostrar solo iconos en pantallas grandes. El estado se gestiona globalmente con Zustand (`isCollapsed`).

### Impresión de Tickets POS

Los tickets de venta están optimizados para impresoras térmicas de 57mm, centrados y con estilos CSS específicos para impresión (ocultan elementos no deseados). Componente: `shared/components/SaleTicketModal.jsx`. Usa `business.ticket_footer` del store.

### Backend API Routes (all protected by `authenticate` except auth)

| Route | Endpoints |
|---|---|
| `/api/auth` | `POST /login`, `POST /logout`, `POST /signup` |
| `/api/products` | `GET /:businessId`, `GET /product/:ProductId`, `POST /createProduct`, `PATCH /:ProductId`, `DELETE /:ProductId` |
| `/api/categories` | `GET /:businessId`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| `/api/sales` | `GET /:businessId`, `POST /createSale`, `PATCH /returnSale/:id` |
| `/api/inventory` | `PATCH /:productId` |
| `/api/businesses` | `GET /getBusiness/:id`, `PATCH /updateBusiness/:id`, `DELETE /deleteBusiness/:id`, `POST /changePassword`, `POST /uploadLogo/:id` |
| `/api/dashboard` | `GET /:businessId` |

### Backend Patterns

- **Soft-delete products**: If FK error `23503` (has sales), sets `is_active: false` instead of deleting.
- **Sales auto-stock**: Creating a sale reduces inventory stock; returning a sale restores it. Partial returns select specific items; full returns mark `status: 'returned'`.
- **Date handling**: Uses local date strings (`YYYY-MM-DD`) from `new Date()`.
- **File uploads**: Multer with `memoryStorage()`, Supabase storage bucket `'logos'`.
- **Dashboard metrics**: Single endpoint computing all KPIs server-side in one `Promise.all()`.
- **Global error handler**: `app.use((err, req, res, next) => {...})`.

### Vite Configuration

`vite.config.js` uses three plugins:
1. `@vitejs/plugin-react` (with `reactCompilerPreset`)
2. `@rolldown/plugin-babel` (with `reactCompilerPreset`)
3. `@tailwindcss/vite`

No `server.proxy` configured — frontend uses `VITE_API_URL` environment variable.

### ESLint

Uses flat config format (`eslint.config.js`):
```js
defineConfig([
  js.configs.recommended,
  reactHooks.configs['recommended'],
  reactRefreshVite,
  { rules: { 'no-unused-vars': ... } },
  globalIgnores(['dist'])
])
```

### Notes

- **No tests exist** in either frontend or backend.
- `index.html` has no favicon and title set to `"frontend"` (needs updating).
- Reports feature is a placeholder (`<div>Reports</div>`).
- Nunca hacer commit sin mi autorizacion antes
