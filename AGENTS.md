# Agent Instructions

## Repository Structure

```
dynopos-app/
├── backend/          # Express + Supabase API
│   └── src/
│       ├── controllers/   # Supabase queries
│       └── routes/         # API endpoints
└── frontend/        # React (Vite) + Tailwind + Zustand
    └── src/
        ├── app/            # Providers, store, router
        └── features/       # Feature modules (dashboard, sales, products, etc.)
            └── {feature}/
                ├── components/
                ├── pages/
                └── helpers/    # API fetch functions
        └── shared/         # Shared components, styles, utilities
            └── components/ # Reusable UI components (e.g., modals, tickets)
```

## Commands

```bash
# Backend
cd backend && npm run dev      # Express server on port 3000
cd backend && npm test         # Run backend tests (if implemented)

# Frontend
cd frontend && npm run dev     # Vite dev server (default 5173)
cd frontend && npm run build   # Build for production
cd frontend && npm run lint    # ESLint check
cd frontend && npm test        # Run frontend tests (if implemented)
```

## Key Conventions

### API Helpers Pattern
Frontend API calls go in `features/{feature}/helpers/`. Each helper fetches from `VITE_API_URL` (env var).

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
*   **`BUSINESS_LOGO_URL`**: URL para el logo del negocio (opcional).

### Sidebar Colapsable
El menú lateral puede colapsarse para mostrar solo iconos en pantallas grandes. El estado se gestiona globalmente con Zustand.

### Impresión de Tickets POS
Los tickets de venta están optimizados para impresoras térmicas de 57mm, centrados y con estilos CSS específicos para impresión (ocultan elementos no deseados).

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand, Recharts, React Router v7, lucide-react
- **Backend**: Express 5, Supabase JS, ES Modules