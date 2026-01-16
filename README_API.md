# API Routes Reference

This document describes all available API endpoints.

## Authentication Endpoints

### `GET /api/auth/session`
Get current user session.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    }
  }
}
```

### `GET /api/auth/signin/discord`
Initiate Discord OAuth flow. Redirects to Discord authorization page.

### `GET /api/auth/callback/discord`
Discord OAuth callback. Handles the OAuth response and creates/updates user session.

**Query Parameters:**
- `code` - Authorization code from Discord
- `state` - CSRF state token

### `POST /api/auth/signout`
Sign out current user. Clears session cookie.

## Card Pool Endpoints

### `POST /api/pools`
Create a new card pool.

**Request Body:**
```json
{
  "setCode": "SOR",
  "cards": [...],
  "packs": [...],
  "deckBuilderState": {...},
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shareId": "abc123",
    "shareUrl": "https://swupod.com/pool/abc123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Note:** Authentication is optional. Anonymous pools are allowed.

### `GET /api/pools/:shareId`
Get a card pool by share ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shareId": "abc123",
    "setCode": "SOR",
    "cards": [...],
    "packs": [...],
    "deckBuilderState": {...},
    "isPublic": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "owner": {
      "id": "uuid",
      "username": "username"
    }
  }
}
```

**Note:** Returns 404 if pool is private and user is not the owner.

### `PUT /api/pools/:shareId`
Update a card pool. Requires authentication and ownership.

**Request Body:** (all fields optional)
```json
{
  "cards": [...],
  "packs": [...],
  "deckBuilderState": {...},
  "isPublic": true,
  "setCode": "SOR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shareId": "abc123",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### `DELETE /api/pools/:shareId`
Delete a card pool. Requires authentication and ownership.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Pool deleted successfully"
  }
}
```

### `GET /api/pools/user/:userId`
Get all pools for a user (pool history).

**Query Parameters:**
- `limit` - Number of results (default: 20)
- `offset` - Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "pools": [
      {
        "id": "uuid",
        "shareId": "abc123",
        "setCode": "SOR",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "isPublic": false,
        "cardCount": 90
      }
    ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

**Note:** Users can only view their own pools.

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "data": null,
  "message": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Authentication

Most endpoints support optional authentication. When authenticated:
- Users can access their own private pools
- Users can update/delete their own pools
- Users can view their pool history

When not authenticated:
- Users can create anonymous pools
- Users can view public pools
- Users cannot access private pools

## Rate Limiting

(Not yet implemented - to be added in Phase 5)

## CORS

API endpoints are configured to accept requests from the same origin. For production, update CORS settings in `vercel.json` if needed.
