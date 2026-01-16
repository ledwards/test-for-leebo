# Protect the Pod - Persistence Layer & Backend Project Plan

## Executive Summary

This plan outlines the implementation of a lightweight persistence layer and backend infrastructure for Protect the Pod to enable:
- Shareable card pool URLs
- Draft pod game rooms (for future draft feature)
- Pool history and user accounts
- Authentication via Discord/Google

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│   React Frontend │  (Vercel)
│   (Current App)  │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
┌────────▼────────┐
│  Vercel Serverless│
│  API Routes      │  (Vercel Functions)
│  /api/*          │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   Database      │
│   (Vercel Postgres│
│    or Supabase)  │
└─────────────────┘
```

### Technology Stack Recommendations

**Backend:**
- **Vercel Serverless Functions** - Lightweight API endpoints
- **Vercel Postgres** OR **Supabase** - Managed PostgreSQL database
- **NextAuth.js** (Auth.js) - Authentication (Discord/Google OAuth)

**Database:**
- PostgreSQL (via Vercel Postgres or Supabase)
- Simple schema with minimal tables

**Frontend Updates:**
- Add API client utilities
- Add authentication context
- Add URL sharing UI
- Add pool history UI

## Database Schema

### Core Tables

#### 1. `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  discord_id TEXT UNIQUE,
  google_id TEXT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `card_pools`
```sql
CREATE TABLE card_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  share_id TEXT UNIQUE NOT NULL, -- Short, shareable ID (e.g., "abc123")
  set_code TEXT NOT NULL,
  cards JSONB NOT NULL, -- Array of card objects
  packs JSONB, -- Array of pack objects (for sealed pods)
  deck_builder_state JSONB, -- Optional: saved deck builder state
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_card_pools_share_id ON card_pools(share_id);
CREATE INDEX idx_card_pools_user_id ON card_pools(user_id);
CREATE INDEX idx_card_pools_created_at ON card_pools(created_at DESC);
```

#### 3. `draft_pods` (for future draft feature)
```sql
CREATE TABLE draft_pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT UNIQUE NOT NULL, -- Short, shareable room code
  host_id UUID REFERENCES users(id) ON DELETE SET NULL,
  set_code TEXT NOT NULL,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'drafting', 'completed'
  max_players INTEGER DEFAULT 8,
  current_players INTEGER DEFAULT 0,
  settings JSONB, -- Draft settings (packs per player, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_draft_pods_share_id ON draft_pods(share_id);
CREATE INDEX idx_draft_pods_status ON draft_pods(status);
```

#### 4. `draft_pod_players` (for future draft feature)
```sql
CREATE TABLE draft_pod_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_pod_id UUID REFERENCES draft_pods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  player_number INTEGER,
  card_pool_id UUID REFERENCES card_pools(id) ON DELETE SET NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(draft_pod_id, user_id)
);

CREATE INDEX idx_draft_pod_players_pod_id ON draft_pod_players(draft_pod_id);
```

## API Design

### Authentication Endpoints

#### `POST /api/auth/signin`
- Redirects to OAuth provider (Discord/Google)
- Handled by NextAuth.js

#### `GET /api/auth/callback/:provider`
- OAuth callback handler
- Handled by NextAuth.js

#### `GET /api/auth/session`
- Returns current user session
- Returns: `{ user: { id, email, username, avatar_url } }` or `null`

#### `POST /api/auth/signout`
- Signs out current user

### Card Pool Endpoints

#### `POST /api/pools`
Create a new card pool
- **Auth:** Optional (anonymous pools allowed)
- **Body:**
  ```json
  {
    "setCode": "SOR",
    "cards": [...],
    "packs": [...],
    "deckBuilderState": {...},
    "isPublic": false
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid",
    "shareId": "abc123",
    "shareUrl": "https://swupod.com/pool/abc123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
  ```

#### `GET /api/pools/:shareId`
Get a card pool by share ID
- **Auth:** Not required (if public or owner)
- **Response:**
  ```json
  {
    "id": "uuid",
    "shareId": "abc123",
    "setCode": "SOR",
    "cards": [...],
    "packs": [...],
    "deckBuilderState": {...},
    "isPublic": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "owner": { "id": "uuid", "username": "player1" }
  }
  ```

#### `GET /api/pools/user/:userId`
Get all pools for a user (pool history)
- **Auth:** Required (own pools only, or public pools)
- **Query params:** `?limit=20&offset=0`
- **Response:**
  ```json
  {
    "pools": [
      {
        "id": "uuid",
        "shareId": "abc123",
        "setCode": "SOR",
        "createdAt": "2024-01-01T00:00:00Z",
        "cardCount": 90
      }
    ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
  ```

#### `PUT /api/pools/:shareId`
Update a card pool (e.g., deck builder state)
- **Auth:** Required (owner only)
- **Body:** Same as POST, but all fields optional

#### `DELETE /api/pools/:shareId`
Delete a card pool
- **Auth:** Required (owner only)

### Draft Pod Endpoints (Future)

#### `POST /api/draft-pods`
Create a new draft pod
- **Auth:** Required
- **Body:**
  ```json
  {
    "setCode": "SOR",
    "maxPlayers": 8,
    "settings": {...}
  }
  ```

#### `GET /api/draft-pods/:shareId`
Get draft pod details
- **Auth:** Not required (if public)

#### `POST /api/draft-pods/:shareId/join`
Join a draft pod
- **Auth:** Required

#### `GET /api/draft-pods/user/:userId`
Get user's draft pods

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up basic infrastructure and authentication

1. **Database Setup**
   - [ ] Choose database provider (Vercel Postgres or Supabase)
   - [ ] Create database schema
   - [ ] Set up database connection utilities
   - [ ] Create migration scripts

2. **Authentication**
   - [ ] Set up NextAuth.js (Auth.js) in API routes
   - [ ] Configure Discord OAuth
   - [ ] Configure Google OAuth (optional)
   - [ ] Create session management utilities
   - [ ] Add auth context to frontend

3. **Project Structure**
   - [ ] Create `/api` directory structure
   - [ ] Set up environment variables
   - [ ] Create database client utilities
   - [ ] Set up error handling middleware

**Deliverables:**
- Users can sign in with Discord
- Session management working
- Database connected

---

### Phase 2: Card Pool Persistence (Week 2-3)
**Goal:** Enable saving and sharing card pools

1. **Backend API**
   - [ ] Implement `POST /api/pools` (create pool)
   - [ ] Implement `GET /api/pools/:shareId` (get pool)
   - [ ] Generate short shareable IDs (nanoid or similar)
   - [ ] Add validation for pool data

2. **Frontend Integration**
   - [ ] Add "Save Pool" button in SealedPod component
   - [ ] Add "Share Pool" button with URL copy
   - [ ] Create pool loading from URL (`/pool/:shareId` route)
   - [ ] Update DeckBuilder to save state to pool
   - [ ] Add API client utilities

3. **URL Sharing**
   - [ ] Create shareable URL format: `swupod.com/pool/abc123`
   - [ ] Add route handler for `/pool/:shareId`
   - [ ] Create PoolViewer component
   - [ ] Add copy-to-clipboard functionality

**Deliverables:**
- Users can save card pools
- Users can share pools via URL
- Users can load shared pools

---

### Phase 3: Pool History (Week 3-4)
**Goal:** Enable users to view and manage their pool history

1. **Backend API**
   - [ ] Implement `GET /api/pools/user/:userId`
   - [ ] Add pagination support
   - [ ] Add filtering (by set, date range)

2. **Frontend**
   - [ ] Create PoolHistory component
   - [ ] Add "My Pools" page/route
   - [ ] Add pool deletion functionality
   - [ ] Add pool search/filter UI
   - [ ] Show pool metadata (date, set, card count)

**Deliverables:**
- Users can view their pool history
- Users can delete old pools
- Users can filter/search pools

---

### Phase 4: Draft Pod Foundation (Week 4-5)
**Goal:** Set up draft pod infrastructure (ready for draft feature)

1. **Database**
   - [ ] Create `draft_pods` table
   - [ ] Create `draft_pod_players` table

2. **Backend API**
   - [ ] Implement `POST /api/draft-pods` (create room)
   - [ ] Implement `GET /api/draft-pods/:shareId` (get room)
   - [ ] Implement `POST /api/draft-pods/:shareId/join` (join room)
   - [ ] Add room status management

3. **Frontend (Basic)**
   - [ ] Create DraftPodLobby component
   - [ ] Add "Create Draft Pod" button
   - [ ] Add "Join Draft Pod" UI (enter room code)
   - [ ] Show room status and players

**Deliverables:**
- Users can create draft pods
- Users can join draft pods via room code
- Room status tracking (waiting, drafting, completed)

---

### Phase 5: Polish & Optimization (Week 5-6)
**Goal:** Improve UX and performance

1. **Performance**
   - [ ] Add database indexes
   - [ ] Add API response caching where appropriate
   - [ ] Optimize JSONB queries
   - [ ] Add rate limiting

2. **UX Improvements**
   - [ ] Add loading states
   - [ ] Add error handling and user feedback
   - [ ] Add pool preview cards
   - [ ] Add "Last saved" timestamps
   - [ ] Add pool naming/description (optional)

3. **Security**
   - [ ] Add input validation and sanitization
   - [ ] Add CORS configuration
   - [ ] Add rate limiting per user
   - [ ] Review and secure API endpoints

**Deliverables:**
- Fast, responsive application
- Good error handling
- Secure API endpoints

## Database Provider Comparison

### Option 1: Vercel Postgres
**Pros:**
- Native Vercel integration
- Simple setup
- Good for serverless
- Automatic connection pooling

**Cons:**
- Less feature-rich than Supabase
- Separate auth solution needed

**Best for:** Simple, lightweight backend

### Option 2: Supabase
**Pros:**
- Built-in auth (can replace NextAuth.js)
- Real-time subscriptions (useful for draft pods)
- Built-in storage
- More features out of the box

**Cons:**
- Slightly more complex setup
- More features than needed initially

**Best for:** If you want real-time features for draft pods

**Recommendation:** Start with **Vercel Postgres** for simplicity, migrate to Supabase later if real-time features are needed.

## Shareable ID Generation

Use **nanoid** for short, URL-safe IDs:
- Length: 8-10 characters
- Example: `abc123xy`
- Collision probability: Very low
- URL-safe characters only

```javascript
import { nanoid } from 'nanoid'
const shareId = nanoid(8) // e.g., "V1StGXR8"
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Auth (Discord)
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_CALLBACK_URL=https://swupod.com/api/auth/callback/discord

# Auth (Google)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://swupod.com/api/auth/callback/google

# NextAuth
NEXTAUTH_URL=https://swupod.com
NEXTAUTH_SECRET=...

# App
APP_URL=https://swupod.com
```

## File Structure

```
swupod/
├── api/                          # New: API routes
│   ├── auth/
│   │   ├── [...nextauth].js     # NextAuth.js handler
│   │   └── session.js            # Session endpoint
│   ├── pools/
│   │   ├── index.js              # POST /api/pools
│   │   ├── [shareId].js          # GET/PUT/DELETE /api/pools/:shareId
│   │   └── user/
│   │       └── [userId].js       # GET /api/pools/user/:userId
│   └── draft-pods/               # Future
│       ├── index.js
│       ├── [shareId].js
│       └── [shareId]/
│           └── join.js
├── src/
│   ├── components/
│   │   ├── PoolHistory.jsx       # New: Pool history view
│   │   ├── PoolViewer.jsx        # New: View shared pool
│   │   ├── ShareButton.jsx       # New: Share pool UI
│   │   └── AuthButton.jsx        # New: Login/logout button
│   ├── utils/
│   │   ├── api.js                 # Update: Add pool API calls
│   │   └── auth.js                # New: Auth utilities
│   └── contexts/
│       └── AuthContext.jsx        # New: Auth context provider
├── lib/                           # New: Shared utilities
│   ├── db.js                      # Database client
│   ├── auth.js                    # Auth configuration
│   └── utils.js                   # Helper functions
└── migrations/                    # New: Database migrations
    └── 001_initial_schema.sql
```

## Migration Strategy

### From sessionStorage to Database

1. **Phase 1:** Keep sessionStorage as fallback
   - Try to save to database first
   - Fall back to sessionStorage if not authenticated
   - Show "Sign in to save permanently" message

2. **Phase 2:** Migrate existing data
   - On login, offer to migrate sessionStorage pools to database
   - One-time migration script

3. **Phase 3:** Remove sessionStorage (optional)
   - Or keep for anonymous users

## Cost Considerations

### Vercel Postgres
- **Hobby:** Free tier available (limited)
- **Pro:** $20/month (includes database)
- **Storage:** ~$0.10/GB/month

### Supabase
- **Free tier:** 500MB database, 2GB bandwidth
- **Pro:** $25/month
- Good for development and small scale

### Vercel Functions
- **Hobby:** Free (100GB-hours/month)
- **Pro:** $20/month (unlimited)
- Should be sufficient for this use case

**Estimated Monthly Cost:** $0-25 (depending on usage and plan)

## Security Considerations

1. **Authentication**
   - Use secure, httpOnly cookies for sessions
   - Validate JWT tokens
   - Rate limit auth endpoints

2. **API Security**
   - Validate all inputs
   - Sanitize JSONB data
   - Check ownership before updates/deletes
   - Rate limit API endpoints

3. **Database**
   - Use parameterized queries (prevent SQL injection)
   - Limit query result sizes
   - Add indexes for performance

4. **CORS**
   - Configure CORS for production domain only
   - No wildcard origins

## Testing Strategy

1. **API Testing**
   - Unit tests for API endpoints
   - Integration tests for database operations
   - Test authentication flows

2. **Frontend Testing**
   - Test pool saving/loading
   - Test URL sharing
   - Test authentication UI

3. **E2E Testing** (Optional)
   - Test full user flows
   - Test draft pod creation/joining

## Deployment Checklist

- [ ] Set up Vercel Postgres or Supabase
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Set up OAuth apps (Discord/Google)
- [ ] Configure CORS
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Add rate limiting
- [ ] Test authentication flows
- [ ] Test API endpoints
- [ ] Deploy to production

## Future Enhancements

1. **Draft Feature**
   - Implement actual draft logic
   - Real-time updates via WebSockets or Supabase real-time
   - Draft timer
   - Pick tracking

2. **Social Features**
   - Comments on pools
   - Pool ratings
   - Follow other users

3. **Analytics**
   - Track popular pools
   - Track draft pod activity
   - User statistics

4. **Export Features**
   - Export pool to text
   - Export pool to image
   - Export to other formats

## Questions to Consider

1. **Anonymous Pools:** Should unauthenticated users be able to create pools?
   - **Recommendation:** Yes, but with expiration (e.g., 30 days)

2. **Pool Expiration:** Should pools expire after a certain time?
   - **Recommendation:** Only for anonymous pools

3. **Pool Limits:** Should there be limits on pools per user?
   - **Recommendation:** Start unlimited, add limits if needed

4. **Deck Builder State:** How much state should be saved?
   - **Recommendation:** Save card positions, filters, view mode, etc.

5. **Draft Pod Size:** Maximum players per draft pod?
   - **Recommendation:** 8 players (standard draft size)

## Next Steps

1. **Review this plan** and adjust as needed
2. **Choose database provider** (Vercel Postgres recommended)
3. **Set up OAuth apps** (Discord, optionally Google)
4. **Start with Phase 1** (Foundation)
5. **Iterate based on feedback**

---

**Estimated Timeline:** 5-6 weeks for full implementation
**Priority:** Phase 1-2 are critical, Phase 3-4 can be done incrementally
