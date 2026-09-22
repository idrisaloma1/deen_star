# DEEN-STAR Shopping Mall — Frontend

React + Vite frontend for the DEEN-STAR SHOPPING MALL backend.

## Setup

1. Make sure the backend is running (`npm run dev` in `../backend`).
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
- **Product detail** (`/product/:slug`) — full product view with quantity picker and Add to cart
- **Cart** (`/cart`, logged-in users only) — view/update/remove items, live totals, cart count badge in the navbar
- **Login / Register** (`/login`, `/register`) — issues a JWT and stores it in `localStorage`
- **Admin panel** (`/admin`, admin accounts only) — add products, view all products, delete products

## What's not built yet

Checkout/orders, wishlist, and reviews UI — the backend routes exist but aren't wired up on the
frontend yet. `CartContext` (`src/context/CartContext.jsx`) is the pattern to follow for wishlist,
and checkout will build on top of the cart once orders are wired up.

## Log in as the seeded admin

```
Email: admin@deenstarmall.com
Password: Admin@12345
```

Change this password once you're in — it was set by the backend's `npm run seed` script.
