# Soft-Gate API

Node.js + Express + MySQL backend for the Soft-Gate storefront.

## Local setup

1. Create a MySQL database and run `schema.sql`.
2. Copy `.env.example` to `.env` and fill in the database credentials.
3. From this directory run:
   ```
   npm install
   npm run seed
   npm start
   ```
4. The API runs on `http://localhost:5000`.

## Production

Set the same environment variables in the hosting provider. Never commit `.env`.

The API exposes:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:id`
- `POST/PUT/DELETE /api/products` (admin)
- `POST /api/orders`
- `GET /api/orders/mine`
- `GET /api/orders/:id`
- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/customers`
