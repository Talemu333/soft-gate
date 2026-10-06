# Soft-Gate API

Node.js + Express + PostgreSQL backend for the Soft-Gate storefront.

## Local setup

1. Create a PostgreSQL database and run `schema.sql`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Configure the SMTP variables in `.env` so customers can receive account recovery emails.
4. From this directory run:
   ```
   npm install
   npm run seed
   npm start
   ```
5. The API runs on `http://localhost:5000`.

## Production

The production database is intended to run on Neon PostgreSQL and the API on Render. Set environment variables in Render and never commit `.env`.

The API exposes:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/orders`
- `GET /api/orders/mine`
- `GET /api/orders/:id`
- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/customers`
