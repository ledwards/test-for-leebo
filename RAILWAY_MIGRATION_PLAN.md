# Railway Migration Plan

## Decisions

| Decision | Choice |
|----------|--------|
| Database | Migrate to Railway Postgres |
| Custom domain | Yes, flip when ready (test on Railway subdomain first) |
| Vercel | Keep running during migration, switch DNS when confident |
| Staging | Railway staging later, not now |
| Maintenance mode | Add before migration |

## Overview

Migrate swupod from Vercel (serverless) to Railway (persistent server) to fix real-time performance issues.

## Branch Strategy

```
main ──────────────────────────────────────────────►
         │
         │ (broken commits)
         │
df3b4ed ─┼──► maintenance-mode ──► deploy to Vercel
         │
         └──► railway-migration ──► deploy to Railway
```

- **df3b4ed**: Last known good commit (currently on Vercel prod)
- **maintenance-mode**: Branch off df3b4ed, add maintenance page, deploy to Vercel
- **railway-migration**: Branch off df3b4ed, add Socket.io changes, deploy to Railway

## Human Steps (Web UI Tasks)

Do these in the Railway/Vercel dashboards while Claude writes code:

### Railway Setup (do during Phase 1)
1. Go to https://railway.app and sign up/login
2. Click "New Project" → "Empty Project"
3. Click "Add Service" → "Database" → "PostgreSQL"
4. Wait for Postgres to provision (~30 seconds)
5. Click on the Postgres service → "Variables" tab
6. Copy `DATABASE_URL` - you'll need this

### Get Neon Credentials (do during Phase 2)
1. Go to Vercel dashboard → your project → Settings → Environment Variables
2. Find and copy `POSTGRES_URL` or `DATABASE_URL` (the Neon connection string)
3. Also copy these (you'll need them for Railway):
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`

### Railway Environment Variables (do during Phase 12)
1. In Railway dashboard, click "New Service" → "Empty Service"
2. This will be your app service (separate from Postgres)
3. Go to the app service → "Variables" tab
4. Add these variables:
   ```
   DATABASE_URL = (reference the Postgres service variable)
   DISCORD_CLIENT_ID = (from Vercel)
   DISCORD_CLIENT_SECRET = (from Vercel)
   NEXTAUTH_SECRET = (from Vercel)
   NEXTAUTH_URL = https://your-app.up.railway.app
   NODE_ENV = production
   ```

### Enable Maintenance Mode on Vercel (do during Phase 2)
1. Vercel dashboard → Project → Settings → Environment Variables
2. Add: `MAINTENANCE_MODE` = `true`
3. Go to Deployments → click "..." on latest → "Redeploy"
4. Verify site shows maintenance page

---

## Pre-Migration Checklist

- [ ] Add maintenance mode (branch off df3b4ed, deploy to Vercel)
- [ ] Test ALL code changes locally before deploying anywhere
- [ ] Export production database from Neon
- [ ] Note all environment variables from Vercel
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Create Railway account at https://railway.app

---

## Phase 0: Add Maintenance Mode (20 min)

Add this BEFORE migration so you can freeze the site during DB migration.

**Important:** Branch off `df3b4ed` (current Vercel production) - NOT main.

### 0.1 Create the branch

```bash
git checkout df3b4ed
git checkout -b maintenance-mode
```

### 0.2 Create middleware.js in project root

```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Check maintenance mode
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Allow access to maintenance page and static assets
    const { pathname } = request.nextUrl
    if (
      pathname === '/maintenance' ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/icons') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next()
    }

    // Redirect everything else to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/health).*)'], // Allow health checks through
}
```

### 0.3 Create app/maintenance/page.jsx

```javascript
// app/maintenance/page.jsx
export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a2e',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Scheduled Maintenance
      </h1>
      <p style={{ color: '#888', maxWidth: '400px', lineHeight: 1.6 }}>
        We're upgrading our servers for better performance.
        Be back in a few minutes!
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        background: '#2a2a4e',
        borderRadius: '8px'
      }}>
        🚀 Improving real-time draft experience
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Maintenance - Protect the Pod',
}
```

### 0.4 Test locally

```bash
# Test that the app still works
npm run dev

# Test maintenance mode by temporarily setting env var
MAINTENANCE_MODE=true npm run dev
# Visit http://localhost:3000 - should redirect to /maintenance
# Visit http://localhost:3000/maintenance - should show page
```

### 0.5 Deploy maintenance mode branch to Vercel

```bash
git add middleware.js app/maintenance/
git commit -m "Add maintenance mode"
git push -u origin maintenance-mode

# Deploy this specific branch to production
vercel --prod
```

Or in Vercel dashboard: Deploy the `maintenance-mode` branch to production.

### 0.6 To enable/disable maintenance

In Vercel dashboard → Settings → Environment Variables:
- Add `MAINTENANCE_MODE=true` to enable
- Remove or set `MAINTENANCE_MODE=false` to disable
- Redeploy for changes to take effect

---

## Phase 1: Railway Setup (15 min)

```bash
# Login to Railway
railway login

# Initialize project in your repo
cd /Users/lee/Repos/ledwards/swupod
railway init

# Add PostgreSQL plugin
railway add --plugin postgresql

# View your new database URL
railway variables
```

Save the `DATABASE_URL` - you'll need it.

---

## Phase 2: Database Migration (15 min)

### 2.1 Export from Neon

```bash
# Get your Neon URL from Vercel env vars, then:
pg_dump "postgres://user:pass@neon-host/dbname?sslmode=require" > backup.sql
```

### 2.2 Enable maintenance mode on Vercel

1. Go to Vercel dashboard → Environment Variables
2. Add `MAINTENANCE_MODE=true`
3. Redeploy (or trigger redeploy)
4. Verify site shows maintenance page

### 2.3 Export again (to catch any last changes)

```bash
pg_dump "postgres://user:pass@neon-host/dbname?sslmode=require" > backup.sql
```

### 2.4 Import to Railway

```bash
# Using Railway CLI
railway run psql < backup.sql

# Verify data
railway run psql -c "SELECT COUNT(*) FROM users;"
railway run psql -c "SELECT COUNT(*) FROM draft_pods;"
```

---

## Phase 3: Create Railway Migration Branch (2 min)

```bash
# Start from the known good commit
git checkout df3b4ed
git checkout -b railway-migration
```

---

## Phase 4: Install Dependencies (2 min)

```bash
npm install socket.io socket.io-client
```

Note: We don't need `express` - Next.js handles HTTP.

---

## Phase 5: Create Custom Server (10 min)

### 4.1 Create server.js

```javascript
// server.js
import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  // Socket.io setup
  const io = new Server(server, {
    cors: { origin: '*' }
  })

  // Store globally so API routes can access it
  global.io = io

  // Handle connections
  io.on('connection', (socket) => {
    socket.on('join-draft', (shareId) => {
      socket.join(`draft:${shareId}`)
    })

    socket.on('leave-draft', (shareId) => {
      socket.leave(`draft:${shareId}`)
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
```

### 4.2 Update package.json scripts

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "npm run copy-release-notes && node scripts/migrate-on-deploy.js && next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

---

## Phase 6: Create Socket Broadcast Helper (10 min)

### 6.1 Create src/lib/socketBroadcast.js

```javascript
// src/lib/socketBroadcast.js
import { queryRow, queryRows } from '@/lib/db.js'

/**
 * Broadcast draft state to all connected clients
 */
export async function broadcastDraftState(shareId) {
  const io = global.io
  if (!io) {
    console.warn('Socket.io not initialized')
    return
  }

  const pod = await queryRow(
    `SELECT dp.id, dp.share_id, dp.status, dp.state_version, dp.draft_state,
            dp.timed, dp.timer_enabled, dp.timer_seconds, dp.pick_timeout_seconds,
            dp.started_at, dp.completed_at, dp.pick_started_at,
            dp.paused, dp.paused_at, dp.paused_duration_seconds
     FROM draft_pods dp WHERE dp.share_id = $1`,
    [shareId]
  )

  if (!pod) {
    io.to(`draft:${shareId}`).emit('deleted')
    return
  }

  const players = await queryRows(
    `SELECT dpp.id, dpp.user_id, dpp.seat_number, dpp.pick_status, dpp.is_bot,
            dpp.leaders, dpp.drafted_leaders, dpp.drafted_cards,
            u.username, u.avatar_url
     FROM draft_pod_players dpp
     JOIN users u ON dpp.user_id = u.id
     WHERE dpp.draft_pod_id = $1
     ORDER BY dpp.seat_number`,
    [pod.id]
  )

  const draftState = typeof pod.draft_state === 'string'
    ? JSON.parse(pod.draft_state)
    : pod.draft_state || {}

  const isLeaderDraftPhase = draftState?.phase === 'leader_draft'

  const formattedPlayers = players.map(p => {
    const draftedLeaders = p.drafted_leaders
      ? (typeof p.drafted_leaders === 'string' ? JSON.parse(p.drafted_leaders) : p.drafted_leaders)
      : []
    const leadersPack = p.leaders
      ? (typeof p.leaders === 'string' ? JSON.parse(p.leaders) : p.leaders)
      : []

    return {
      id: p.id,
      odId: p.user_id,
      username: p.username,
      avatarUrl: p.avatar_url,
      seatNumber: p.seat_number,
      pickStatus: p.pick_status,
      isBot: p.is_bot === true,
      leaderPack: isLeaderDraftPhase ? leadersPack.map(l => ({
        name: l.name,
        aspects: l.aspects || [],
        imageUrl: l.imageUrl,
        backImageUrl: l.backImageUrl,
      })) : null,
      draftedCardsCount: p.drafted_cards
        ? (typeof p.drafted_cards === 'string' ? JSON.parse(p.drafted_cards) : p.drafted_cards).length
        : 0,
      draftedLeadersCount: draftedLeaders.length,
      draftedLeaders: draftedLeaders.map(l => ({
        name: l.name,
        aspects: l.aspects || [],
        imageUrl: l.imageUrl,
        backImageUrl: l.backImageUrl,
      })),
    }
  })

  io.to(`draft:${shareId}`).emit('state', {
    stateVersion: pod.state_version,
    status: pod.status,
    draftState,
    players: formattedPlayers,
    timed: pod.timed !== false,
    timerEnabled: pod.timer_enabled,
    timerSeconds: pod.timer_seconds,
    pickTimeoutSeconds: pod.pick_timeout_seconds || 120,
    startedAt: pod.started_at,
    completedAt: pod.completed_at,
    pickStartedAt: pod.pick_started_at,
    paused: pod.paused === true,
    pausedAt: pod.paused_at,
    pausedDurationSeconds: pod.paused_duration_seconds || 0,
  })
}
```

---

## Phase 7: Create Client Hook (15 min)

### 7.1 Create src/hooks/useDraftSocket.js

```javascript
// src/hooks/useDraftSocket.js
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { loadDraft } from '@/src/utils/draftApi.js'

export function useDraftSocket(shareId, { enabled = true } = {}) {
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleted, setDeleted] = useState(false)
  const [connected, setConnected] = useState(false)

  const socketRef = useRef(null)
  const stateVersionRef = useRef(0)

  // Fetch user-specific data (myPlayer)
  const fetchMyPlayer = useCallback(async () => {
    if (!shareId) return null
    try {
      const data = await loadDraft(shareId)
      return {
        myPlayer: data.myPlayer,
        isHost: data.isHost,
        isPlayer: data.isPlayer,
      }
    } catch (err) {
      console.error('Error fetching myPlayer:', err)
      return null
    }
  }, [shareId])

  // Initial load
  const loadInitial = useCallback(async () => {
    if (!shareId) return
    setLoading(true)
    setError(null)
    try {
      const data = await loadDraft(shareId)
      setDraft(data)
      stateVersionRef.current = data.stateVersion || 0
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [shareId])

  useEffect(() => {
    if (!shareId || !enabled) return

    loadInitial()

    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join-draft', shareId)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('state', async (data) => {
      if (data.stateVersion > stateVersionRef.current) {
        stateVersionRef.current = data.stateVersion

        setDraft(prev => ({
          ...prev,
          status: data.status,
          draftState: data.draftState,
          players: data.players,
          timed: data.timed,
          timerEnabled: data.timerEnabled,
          timerSeconds: data.timerSeconds,
          pickTimeoutSeconds: data.pickTimeoutSeconds,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          pickStartedAt: data.pickStartedAt,
          stateVersion: data.stateVersion,
          paused: data.paused,
          pausedAt: data.pausedAt,
          pausedDurationSeconds: data.pausedDurationSeconds,
        }))

        // Fetch user-specific data
        const userData = await fetchMyPlayer()
        if (userData) {
          setDraft(p => ({ ...p, ...userData }))
        }
      }
    })

    socket.on('deleted', () => {
      setDeleted(true)
    })

    return () => {
      socket.emit('leave-draft', shareId)
      socket.disconnect()
    }
  }, [shareId, enabled, loadInitial, fetchMyPlayer])

  const refresh = useCallback(async () => {
    await loadInitial()
  }, [loadInitial])

  return {
    draft,
    loading,
    error,
    deleted,
    connected,
    refresh,
    isHost: draft?.isHost || false,
    isPlayer: draft?.isPlayer || false,
    players: draft?.players || [],
    myPlayer: draft?.myPlayer || null,
    draftState: draft?.draftState || {},
    status: draft?.status || 'loading',
  }
}

export default useDraftSocket
```

---

## Phase 8: Update API Routes (20 min)

Change the import in these files:

**From:**
```javascript
import { broadcastDraftState } from '@/src/lib/sseBroadcast.js'
```

**To:**
```javascript
import { broadcastDraftState } from '@/src/lib/socketBroadcast.js'
```

**Files to update:**
- [ ] `app/api/draft/[shareId]/start/route.js`
- [ ] `app/api/draft/[shareId]/pick/route.js`
- [ ] `app/api/draft/[shareId]/select/route.js`
- [ ] `app/api/draft/[shareId]/join/route.js`
- [ ] `app/api/draft/[shareId]/leave/route.js`
- [ ] `app/api/draft/[shareId]/settings/route.js`
- [ ] `app/api/draft/[shareId]/pause/route.js`
- [ ] `app/api/draft/[shareId]/dev/add-bots/route.js`

---

## Phase 9: Update Components (10 min)

**Change import in components using useDraftSSE:**

**From:**
```javascript
import { useDraftSSE } from '@/src/hooks/useDraftSSE.js'
// or
import useDraftSSE from '@/src/hooks/useDraftSSE.js'
```

**To:**
```javascript
import { useDraftSocket } from '@/src/hooks/useDraftSocket.js'
```

**And rename usage:**
```javascript
const { draft, loading, ... } = useDraftSocket(shareId)
```

**Files to check:**
- [ ] `app/draft/[shareId]/page.jsx`
- [ ] Any other files importing useDraftSSE

---

## Phase 10: Delete Old Files (5 min)

```bash
rm src/hooks/useDraftSSE.js
rm src/lib/redis.js
rm src/lib/sseConnections.js
rm src/lib/sseBroadcast.js
rm -rf app/api/draft/[shareId]/stream
rm -rf app/api/draft/[shareId]/heartbeat
```

Also remove from package.json dependencies:
```bash
npm uninstall @upstash/redis
```

---

## Phase 11: Update Database Connection (5 min)

Railway provides `DATABASE_URL`. Check `lib/db.js` uses this:

```javascript
// lib/db.js should work with DATABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
```

---

## Phase 12: Environment Variables (10 min)

### Railway env vars (set in Railway dashboard):

```
DATABASE_URL=<railway provides this>
DISCORD_CLIENT_ID=<from Vercel>
DISCORD_CLIENT_SECRET=<from Vercel>
NEXTAUTH_SECRET=<from Vercel>
NEXTAUTH_URL=https://your-app.up.railway.app
NODE_ENV=production
```

### No longer needed:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `UPSTASH_REDIS_*`
- `POSTGRES_URL` (Railway uses `DATABASE_URL`)

---

## Phase 13: Test Locally (20 min)

**BEFORE deploying to Railway, test everything locally.**

### 13.1 Start local dev server

```bash
npm run dev
```

### 13.2 Test checklist (local)

Open http://localhost:3000

- [ ] App loads without errors
- [ ] Can create a new draft
- [ ] Open second browser/incognito, join the draft
- [ ] Add bots - should be instant
- [ ] Start draft
- [ ] Complete leader draft (3 picks each)
- [ ] Pack draft works, cards pass correctly
- [ ] Both browsers update in real-time (no polling delay)
- [ ] Complete full draft

### 13.3 Check console for errors

- No Socket.io connection errors
- No "global.io not initialized" warnings
- WebSocket connection established (check Network tab)

---

## Phase 14: Deploy to Railway (10 min)

```bash
# Commit all changes
git add -A
git commit -m "Migrate to Railway with Socket.io"

# Deploy to Railway
railway up
```

Or connect GitHub repo in Railway dashboard for auto-deploy.

---

## Phase 15: Test on Railway Subdomain (20 min)

Railway gives you a URL like `swupod-production.up.railway.app`

Test checklist:
- [ ] Can log in with Discord
- [ ] Can create new draft
- [ ] Can join draft as second user (incognito)
- [ ] Adding bots is instant (no delay)
- [ ] Start draft works
- [ ] Leader draft completes (all 3 picks)
- [ ] Pack draft works (real-time updates)
- [ ] Timer works
- [ ] Complete a full draft
- [ ] Check mobile

---

## Phase 16: Switch Custom Domain (5 min)

Once testing passes:

### 16.1 Add domain in Railway
1. Railway dashboard → Settings → Domains
2. Add your custom domain (e.g., `swupod.com` or `protectthepod.com`)
3. Railway gives you a CNAME target

### 16.2 Update DNS
1. Go to your DNS provider
2. Change CNAME from Vercel to Railway's target
3. Wait for propagation (usually minutes)

### 16.3 Update NEXTAUTH_URL
In Railway env vars:
```
NEXTAUTH_URL=https://yourcustomdomain.com
```

### 16.4 Disable maintenance mode
Once DNS propagates and traffic goes to Railway, the maintenance page is no longer needed.

---

## Rollback Plan

If something breaks after DNS switch:

1. Point DNS back to Vercel (still running at df3b4ed)
2. Vercel connects to Neon (old DB)
3. Note: Any data created on Railway won't be on Neon

To sync data back if needed:
```bash
# Export from Railway
railway run pg_dump > railway_backup.sql

# Import to Neon
psql $NEON_URL < railway_backup.sql
```

---

## Timeline Summary

| Phase | Task | Time |
|-------|------|------|
| 0 | Add maintenance mode (branch off df3b4ed) | 20 min |
| 1 | Railway setup | 15 min |
| 2 | Database migration | 15 min |
| 3 | Create railway-migration branch | 2 min |
| 4 | Install dependencies | 2 min |
| 5 | Custom server | 10 min |
| 6 | Socket broadcast helper | 10 min |
| 7 | Client hook | 15 min |
| 8 | Update API routes | 20 min |
| 9 | Update components | 10 min |
| 10 | Delete old files | 5 min |
| 11 | Database connection | 5 min |
| 12 | Environment variables | 10 min |
| 13 | **Test locally** | 20 min |
| 14 | Deploy to Railway | 10 min |
| 15 | Test on Railway subdomain | 20 min |
| 16 | Switch domain | 5 min |
| **Total** | | **~3.5 hours** |

---

## Quick Reference Commands

```bash
# Start maintenance mode (Vercel dashboard)
# Set MAINTENANCE_MODE=true, redeploy

# Export Neon DB
pg_dump "$NEON_DATABASE_URL" > backup.sql

# Import to Railway
railway run psql < backup.sql

# Deploy to Railway
railway up

# View logs
railway logs

# Open Railway shell
railway shell

# Check Railway variables
railway variables
```
