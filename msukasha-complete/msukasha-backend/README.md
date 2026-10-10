# MSUKASHA Backend (Node.js / Express / MongoDB)

REST API for the MSUKASHA B2B/C2C marketplace mobile app (and website).

## Run locally
```bash
npm install
cp .env.example .env      # fill MONGODB_URI, JWT_SECRET, ADMIN_*
npm run seed              # admin user + categories   (npm run seed:demo adds demo data)
npm run dev               # http://localhost:4000
```

## Deploy on Vercel
1. Push this folder to GitHub, import it in Vercel.
2. Add every variable from `.env.example` in Project Settings -> Environment Variables.
3. MongoDB Atlas: Network Access must allow Vercel (0.0.0.0/0 or Vercel integration).
4. Set `API_PUBLIC_URL` to your deployed URL. The app uses `<url>/api`.

## Endpoints (all under /api, JSON, Bearer token)
| Area | Endpoints |
|---|---|
| Auth | POST /auth/register (role buyer/seller), POST /auth/login, GET/PATCH /auth/me, POST /auth/change-password |
| Catalog | GET /categories, GET /products (q, category, type=b2b/c2c, minPrice, maxPrice, sort, page, limit), GET /products/:id |
| Cart | GET /cart, PUT /cart/items {productId, qty} (qty 0 removes), DELETE /cart |
| Orders | POST /orders/checkout, GET /orders, GET /orders/:id, POST /orders/:id/cancel |
| Payments | GET /payments/methods, POST /payments/:orderId/bank-transfer, POST /payments/:orderId/jazzcash, POST /payments/jazzcash/callback |
| Seller | GET/POST /seller/products, PATCH/DELETE /seller/products/:id, GET /seller/orders, PATCH /seller/orders/:id/status |
| Admin | GET /admin/stats, GET /admin/sellers, PATCH /admin/sellers/:id (approved/rejected/suspended), GET /admin/orders, PATCH /admin/orders/:id/payment |

## How it works
- Sellers register as `seller` and stay `pending` until an admin approves them; only approved sellers can list products.
- B2B: each product has `minOrderQty` and `tierPricing` (wholesale price breaks). C2C: plain price.
- Checkout splits the cart into **one order per seller**, reserves stock atomically, and rolls back on failure.
- Shipping: flat `SHIPPING_FEE`, free above `FREE_SHIPPING_THRESHOLD` (assumption - change in `.env`).
- Payments: **COD** (marked paid on delivery) and **bank transfer** (buyer submits reference, admin verifies) work now.
  **JazzCash** is implemented but needs your merchant credentials and sandbox testing.
  **EasyPaisa and card** return 501 until you have merchant accounts.

## Not included yet
Reviews, wishlist, push notifications, image upload (products take image URLs), password reset by email, refresh tokens.
