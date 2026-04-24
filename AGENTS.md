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
```

## Commands

```bash
# Backend
cd backend && npm run dev      # Express server on port 3000

# Frontend
cd frontend && npm run dev     # Vite dev server (default 5173)
cd frontend && npm run lint    # ESLint check
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

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand, Recharts, React Router v7, lucide-react
- **Backend**: Express 5, Supabase JS, ES Modules