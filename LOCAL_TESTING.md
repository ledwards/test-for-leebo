# Local Testing Guide

This guide will help you test the API locally before deploying to Vercel.

## ⚠️ Important: Using Next.js

This application uses **Next.js** with the App Router. API routes are in `app/api/` and use Next.js route handlers. Simply run `npm run dev` to start both the frontend and API routes.

## Quick Start

```bash
# 1. Set up .env file (see below)

# 2. Run database migration
npm run migrate

# 3. Start Next.js dev server (this runs both frontend and API)
npm run dev
```

This will start:
- Frontend on `http://localhost:3000` (Next.js default port)
- API routes at `http://localhost:3000/api/*`

## Prerequisites

1. **Database Setup**
   - You need a PostgreSQL database (local or remote)
   - Options:
     - **Neon (Recommended)**: Available through Vercel Marketplace
       - Go to Vercel dashboard → Storage → Browse Storage → Neon
       - Free tier available, perfect for development
     - **Local PostgreSQL**: Install and run locally
     - **Supabase**: Create a free project at supabase.com
     - **Other**: Any PostgreSQL database

2. **Discord OAuth App**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Get Client ID and Client Secret
   - Add redirect URI: `http://localhost:3000/api/auth/callback/discord` (or whatever port Vercel uses)

## Step 1: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Database (points to dev database for local development)
POSTGRES_URL=postgresql://user:password@dev-host/devdb

# Application URL (Next.js runs on port 3000 by default)
APP_URL=http://localhost:3000

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-key-here
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Run Database Migration

```bash
npm run migrate:dev
```

This will create all the necessary tables in your development database. You should see:
```
✅ Migration completed! Applied X migration(s)
```

## Step 3: Test Database Connection

**Option 1: Using pg library (recommended, works with new setup)**

```bash
node -e "
import('pg').then(({ default: pg }) => {
  const { Client } = pg;
  const client = new Client({ connectionString: process.env.POSTGRES_URL_DEV || process.env.POSTGRES_URL });
  client.connect()
    .then(() => client.query('SELECT 1'))
    .then(() => { console.log('✅ Database connected!'); client.end(); })
    .catch(e => { console.error('❌ Error:', e.message); client.end(); });
});
"
```

**Option 2: Using @vercel/postgres (requires POSTGRES_URL env var)**

If you want to use this method, temporarily set `POSTGRES_URL` to your dev database:
```bash
export POSTGRES_URL=$POSTGRES_URL_DEV
node -e "import('@vercel/postgres').then(({sql}) => sql.query('SELECT 1').then(() => console.log('✅ Database connected!')).catch(e => console.error('❌ Error:', e.message)))"
```

**Option 3: Use the database test script (recommended)**

```bash
npm run test-db
# or for production:
npm run test-db:prod
```

This will test the connection and show database info.

**Option 4: Use the migration status command**

```bash
npm run migrate:status
```

This will show the connection status and migration state for both dev and prod databases.

## Step 4: Start Development Server

**Using Next.js (Recommended)**
```bash
npm run dev
```
This starts both frontend and API on `http://localhost:3000` (Next.js default port). All API routes will work automatically.

## Step 5: Test API Endpoints

**Note:** Next.js runs on port 3000 by default. All API endpoints are available at `http://localhost:3000/api/*`

### Test 1: Check Session (should return null initially)

```bash
curl http://localhost:3000/api/auth/session
```

Expected response:
```json
{
  "success": true,
  "data": null,
  "message": "No active session"
}
```

### Test 2: Create a Pool (anonymous)

```bash
curl -X POST http://localhost:3000/api/pools \
  -H "Content-Type: application/json" \
  -d '{
    "setCode": "SOR",
    "cards": [{"id": "test1", "name": "Test Card"}],
    "isPublic": false
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "shareId": "abc123xy",
    "shareUrl": "http://localhost:3000/pool/abc123xy",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Save the `shareId` from the response for the next test.**

### Test 3: Get Pool by Share ID

```bash
curl http://localhost:3000/api/pools/YOUR_SHARE_ID_HERE
```

Replace `YOUR_SHARE_ID_HERE` with the shareId from Test 2.

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shareId": "abc123xy",
    "setCode": "SOR",
    "cards": [{"id": "test1", "name": "Test Card"}],
    "packs": null,
    "deckBuilderState": null,
    "isPublic": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "owner": null
  }
}
```

### Test 4: Test Authentication Flow

1. **Open browser**: http://localhost:3000/api/auth/signin/discord
2. **You'll be redirected to Discord** for authorization
3. **Authorize the app**
4. **You'll be redirected back** to `http://localhost:3000/?auth=success`

5. **Check session again**:
```bash
curl http://localhost:3000/api/auth/session \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

Or in browser, open DevTools → Application → Cookies and check for `swupod_session`.

### Test 5: Create Pool as Authenticated User

First, get your session cookie from the browser (after signing in), then:

```bash
curl -X POST http://localhost:3000/api/pools \
  -H "Content-Type: application/json" \
  -H "Cookie: swupod_session=YOUR_JWT_TOKEN_HERE" \
  -d '{
    "setCode": "SOR",
    "cards": [{"id": "test2", "name": "Authenticated Card"}],
    "isPublic": true
  }'
```

### Test 6: Get User Pools

```bash
curl http://localhost:3000/api/pools/user/YOUR_USER_ID \
  -H "Cookie: swupod_session=YOUR_JWT_TOKEN_HERE"
```

Replace `YOUR_USER_ID` with your user ID (you can get it from the session endpoint).

## Step 6: Test Frontend Integration

1. **Add AuthButton to LandingPage** (if not already added):
   ```jsx
   import AuthButton from './AuthButton'
   
   // In LandingPage component:
   <AuthButton />
   ```

2. **Start dev server**: `npm run dev` (Next.js)
3. **Open**: http://localhost:3000
4. **Click "Sign in with Discord"**
5. **Complete OAuth flow**
6. **Verify**: You should see your username/avatar in the auth button

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Make sure PostgreSQL is running
- Check connection string format
- Verify database exists

**Error: "password authentication failed"**
- Double-check username/password in connection string
- For Vercel Postgres, use the exact connection string from dashboard

### OAuth Issues

**Error: "Invalid redirect_uri"**
- Make sure redirect URI in Discord app matches exactly: `http://localhost:3000/api/auth/callback/discord`
- Check for typos (http vs https, trailing slashes)

**Error: "Invalid client"**
- Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
- Make sure they're in your `.env` file

### API Route Not Found

**Error: 404 on API routes**
- Make sure files are in `app/api/` directory (Next.js App Router)
- Check that route files are named `route.js` and export HTTP methods (e.g., `export async function GET()`)
- Verify you're using `npm run dev` (Next.js dev server)
- Check the Next.js terminal output for any route compilation errors

## Quick Test Script

**Option 1: Use the automated test script**
```bash
npm run test-api
```
This will test all endpoints automatically (make sure `npm run dev` is running first). The test script includes 5-second timeouts for each route - if a route doesn't respond within 5 seconds, the test will fail.

**Option 2: Manual testing with curl**

Run this to test all endpoints quickly (Next.js runs on port 3000 by default):

```bash
# Test session
echo "Testing session..."
curl -s http://localhost:3000/api/auth/session | jq

# Test create pool
echo "Creating pool..."
POOL_RESPONSE=$(curl -s -X POST http://localhost:3000/api/pools \
  -H "Content-Type: application/json" \
  -d '{"setCode":"SOR","cards":[{"id":"test","name":"Test"}],"isPublic":false}')

echo $POOL_RESPONSE | jq
SHARE_ID=$(echo $POOL_RESPONSE | jq -r '.data.shareId')

# Test get pool
echo "Getting pool $SHARE_ID..."
curl -s http://localhost:3000/api/pools/$SHARE_ID | jq
```

(Requires `jq` for JSON parsing: `brew install jq` on Mac)
