# API Documentation

## Base URL
```
Development: http://localhost:3001
Production: https://your-app.railway.app
```

## Authentication
All API endpoints (except health check) require Firebase JWT authentication.

### Headers
```
Authorization: Bearer <firebase-jwt-token>
Content-Type: application/json
```

## Endpoints

### Health Check

#### GET /health
Check API server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Authentication

#### POST /api/auth/verify
Verify Firebase JWT token and get user context.

**Headers:**
```
Authorization: Bearer <firebase-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "tenantId": "cuid123456"
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid token"
}
```

### Data Synchronization

#### POST /api/sync-data
Sync Shopify store data for the authenticated tenant.

**Headers:**
```
Authorization: Bearer <firebase-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "storeUrl": "your-store.myshopify.com",
  "accessToken": "optional-shopify-access-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data sync completed",
  "stats": {
    "customers": 50,
    "products": 30,
    "orders": 100
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to sync data",
  "message": "Store URL is required"
}
```

### Metrics and Analytics

#### GET /api/metrics
Get dashboard metrics and analytics data.

**Headers:**
```
Authorization: Bearer <firebase-jwt-token>
```

**Query Parameters:**
- `storeId` (optional): Filter by specific store ID
- `dateFrom` (optional): Start date for filtering (ISO 8601)
- `dateTo` (optional): End date for filtering (ISO 8601)

**Example Request:**
```
GET /api/metrics?dateFrom=2024-01-01&dateTo=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCustomers": 150,
      "totalRevenue": 25000.50,
      "totalOrders": 300
    },
    "topCustomers": [
      {
        "id": "customer1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "totalSpent": 1500.00,
        "ordersCount": 12
      }
    ],
    "ordersChartData": [
      {
        "date": "2024-01-01",
        "orders": 5,
        "revenue": 250.00
      }
    ],
    "stores": [
      {
        "id": "store1",
        "name": "My Store",
        "domain": "my-store.myshopify.com"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch metrics",
  "message": "Database connection error"
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Data Models

### Tenant
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Store
```json
{
  "id": "string",
  "shopifyId": "string",
  "name": "string",
  "domain": "string",
  "accessToken": "string",
  "tenantId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Customer
```json
{
  "id": "string",
  "shopifyId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "totalSpent": "number",
  "ordersCount": "number",
  "storeId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "shopifyCreatedAt": "datetime"
}
```

### Product
```json
{
  "id": "string",
  "shopifyId": "string",
  "title": "string",
  "handle": "string",
  "price": "number",
  "storeId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "shopifyCreatedAt": "datetime"
}
```

### Order
```json
{
  "id": "string",
  "shopifyId": "string",
  "orderNumber": "string",
  "totalPrice": "number",
  "subtotalPrice": "number",
  "currency": "string",
  "financialStatus": "string",
  "fulfillmentStatus": "string",
  "storeId": "string",
  "customerId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "shopifyCreatedAt": "datetime"
}
```

## Authentication Flow

### Frontend Integration
```javascript
// Get Firebase token
const user = auth.currentUser;
const token = await user.getIdToken();

// Make API request
const response = await fetch('/api/metrics', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Verification
The backend verifies tokens using Firebase Admin SDK:
1. Extract token from Authorization header
2. Verify with Firebase Admin SDK
3. Extract user information (email, uid)
4. Find/create tenant record
5. Attach user context to request

## Webhook Support (Future)

### Shopify Webhooks
Future implementation will support real-time data sync via Shopify webhooks:

#### POST /api/webhooks/shopify/orders/create
#### POST /api/webhooks/shopify/orders/update
#### POST /api/webhooks/shopify/customers/create
#### POST /api/webhooks/shopify/products/create

Webhook endpoints will:
- Verify Shopify webhook signatures
- Process data updates in real-time
- Trigger dashboard updates via WebSocket

## SDK Examples

### JavaScript/Node.js
```javascript
class ShopifyInsightsAPI {
  constructor(firebaseAuth) {
    this.auth = firebaseAuth;
    this.baseURL = 'https://your-api.railway.app';
  }

  async getAuthHeaders() {
    const token = await this.auth.currentUser.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async syncData(storeUrl) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/api/sync-data`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ storeUrl })
    });
    return response.json();
  }

  async getMetrics(filters = {}) {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/api/metrics?${params}`, {
      headers
    });
    return response.json();
  }
}
```