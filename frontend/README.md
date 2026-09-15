# DEEN-STAR Shopping Mall — Frontend

React + Vite frontend for the DEEN-STAR SHOPPING MALL backend.

## Setup

1. Make sure the backend is running on `http://localhost:5000` (`npm run dev` in `../backend`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Check `.env` — it should point at your backend:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open the URL Vite prints (usually `http://localhost:5173`).

## What's included

- **Home** (`/`) — product grid with category filter pills, search, sort, and pagination
- **Product detail** (`/product/:slug`) — full product view (cart button is a placeholder for now)
- **Login / Register** (`/login`, `/register`) — issues a JWT and stores it in `localStorage`
- **Admin panel** (`/admin`, admin accounts only) — add products, view all products, delete products

## What's not built yet

Cart, wishlist, orders, and reviews UI — the backend routes exist but aren't wired up on the
frontend yet. `AuthContext` (`src/context/AuthContext.jsx`) already exposes the logged-in user
and token, so those pages can reuse the same pattern as `Admin.jsx` and `api/client.js`.

## Log in as the seeded admin

```
Email: admin@deenstarmall.com
Password: Admin@12345
```

Change this password once you're in — it was set by the backend's `npm run seed` script.
