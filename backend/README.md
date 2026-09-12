# Soft-Gate Backend

Express REST API backed by MySQL 8+.

## Setup

1. Create the database/schema:

```bash
mysql -u root -p < schema.sql
```

2. Copy `.env.example` to `.env` and set the MySQL credentials plus a strong `JWT_SECRET`.

3. Install dependencies and seed the catalogue/admin:

```bash
npm install
npm run seed
```

4. Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Main endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:id`
- `POST/PATCH/DELETE /api/products` (admin)
- `POST /api/orders`
- `GET /api/orders/mine` (authenticated customer)
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/status` (admin)
- `GET/POST/DELETE /api/wishlist` (authenticated customer)
- `POST /api/contact`
- `GET /api/contact` (admin)
- `GET /api/admin/dashboard` (admin)
- `GET /api/admin/customers` (admin)

Orders are created inside a MySQL transaction and lock product rows while validating stock, so stock cannot be oversold by concurrent checkouts.
