## Solution Documentation

### 1) Assumptions

- The frontend is a React/Next.js app using Firebase Authentication (email/password) and stores a JWT for backend access in `localStorage.jwt_token`.
- The backend is an Express + Prisma service (separate from the Shopify Remix app) with a PostgreSQL (or SQLite during development) database defined in `prisma/schema.prisma`.
- Shopify data access can be performed with a Custom App Admin API Access Token (`shpat_...`) that has at least `read_products`, `read_orders`, and `read_customers` scopes.
- A single tenant maps to a single Shopify store via the unique field `tenant.shopifyDomain` (e.g., `your-store.myshopify.com`).
- Frontend requests send `x-shop-domain` so the backend can target the correct tenant/store when computing metrics.
- Currency display is INR and number formatting uses `en-IN`.


### 2) High‑Level Architecture

```mermaid
flowchart LR
  subgraph Client
    A[React/Next.js Frontend\nFirebase Auth]
  end

  subgraph Infra
    B[Firebase Auth\n(Id Tokens)]
    C[Express API + Prisma]
    D[(Database)]
    E[Shopify Admin API]
  end

  A -- getIdToken() --> B
  A -- Authorization: Bearer <app JWT> --> C
  A -- x-shop-domain header --> C

  C -- Verify app JWT --> C
  C <--> D
  C -- Sync using Admin API token --> E
  C -- Aggregated metrics --> A
```

Legend:
- The frontend authenticates with Firebase, exchanges for an app JWT (already implemented), and calls the backend with both `Authorization` and `x-shop-domain`.
- The backend persists synced data and computes metrics per tenant/store.


### 3) APIs and Data Models

#### Public/Frontend‑Facing API (Express)

- POST `/api/auth/generate-jwt`
  - Body: `{ firebaseToken, uid, email, name }`
  - Returns: `{ token, user }` (app JWT)

- POST `/api/sync/sync-data`
  - Headers: `Authorization: Bearer <app JWT>`
  - Body: `{ storeUrl: string, accessToken: string }`
  - Behavior: Upserts `tenant` by `shopifyDomain`; upserts `store` by `shopifyId`; runs full sync (customers, products, orders); writes `sync_jobs` with JSON metadata (as string).
  - Returns: `{ success, message, stats: { customers, products, orders, syncJobId, errors } }`

- GET `/api/metrics/metrics`
  - Headers: `Authorization: Bearer <app JWT>`, `x-shop-domain: <store.myshopify.com>`
  - Query (optional): `storeId`, `dateFrom`, `dateTo`
  - Returns aggregated dashboard payload:
    ```json
    {
      "summary": {
        "totalCustomers": number,
        "totalRevenue": number,
        "totalOrders": number,
        "averageOrderValue": number,
        "conversionRate": number,
        "returningCustomers": number
      },
      "ordersChartData": [ { "date": "YYYY-MM-DD", "orders": number, "revenue": number } ],
      "topCustomers": [ { "firstName": string, "lastName": string, "ordersCount": number, "totalSpent": number } ],
      "revenueByCategory": [],
      "monthlyTrends": []
    }
    ```

- GET `/api/metrics/products`, `/api/metrics/orders`, `/api/metrics/customers` (protected)
  - Headers: `Authorization`, `x-shop-domain`
  - Returns paginated lists suitable for UI tables.

#### Core Data Models (Prisma)

- `Tenant` (`id`, `name`, `shopifyDomain` unique, `shopifyAccessToken?`, `isActive`, `createdAt`, `updatedAt`)
- `Store` (`id`, `tenantId`, `shopifyId` unique, `name`, `domain`, `currency`, timestamps)
- `Product`, `Order`, `Customer` (fields subset from Shopify + computed aggregates like `ordersCount`, `totalSpent`)
- `SyncJob` (`id`, `tenantId`, `jobType`, `status`, counts, `error?`, `metadata: String?` for stringified JSON)


### 4) Next Steps to Productionize

Security & Auth
- Verify Firebase ID tokens on the backend (optionally alongside the current app JWT), or sign the app JWT with a short TTL and rotate secrets.
- Apply rate limiting and request validation (e.g., `zod`/`joi`) on all endpoints.
- Store Shopify Admin tokens encrypted (KMS/Hashicorp Vault). Avoid logging tokens.

Resilience & Observability
- Wrap Shopify Admin API calls with retry + backoff; respect call limits (throttling already scaffolded).
- Structured logging (request id, tenant id, shop domain). Add application metrics and health checks.
- Background job runner/queue (BullMQ/Cloud Tasks) for large syncs; write progress to `sync_jobs`.

Data & Performance
- Convert `SyncJob.metadata` to `Json` type when migrating to PostgreSQL for native JSON querying.
- Add composite indexes on frequently filtered columns (e.g., `order.storeId + shopifyCreatedAt`).
- Implement incremental sync using Shopify updatedAt cursors/webhooks to avoid full re-ingest.

DevOps & Delivery
- CI/CD with lint, test, type-check, Prisma migrations, and environment promotion.
- Secrets via environment manager (Doppler, 1Password, or platform secrets).
- Containerize services and run behind an API gateway with TLS.

UX & Product
- Persist `shop_domain` through a settings page rather than localStorage debug step.
- Add sync activity UI (job history) and error drill-down from `sync_jobs.metadata`.
- Add pagination, sorting, and server-side search to list endpoints.

Compliance
- PII handling: minimize stored customer data; mask in logs; implement data deletion on request.
- Add data retention policies and backups.


### 5) Quick Start Notes

1. Set `NEXT_PUBLIC_API_URL` on the frontend to point to the backend.
2. Log in (Firebase), ensure `localStorage.jwt_token` exists.
3. Run a sync from Dashboard → Sync Data with `your-store.myshopify.com` and `shpat_...`.
4. Save the domain once: `localStorage.setItem('shop_domain', 'your-store.myshopify.com')` and refresh the dashboard.




