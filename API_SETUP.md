# API Setup Guide

This guide will help you set up the backend API for Protect the Pod.

## Prerequisites

1. A Vercel account
2. A Discord application (for OAuth)
3. (Optional) A Google Cloud project (for Google OAuth)

## Step 1: Set Up Database

### Option A: Neon (Recommended - Vercel Marketplace)

Neon is a serverless Postgres database available through Vercel's Marketplace.

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to the "Storage" tab
4. Click "Create New" or "Browse Storage"
5. In the Marketplace Database Providers section, click on **Neon** (Serverless Postgres)
6. Follow the prompts to create a Neon database
7. Once created, Vercel will automatically add the connection string as `POSTGRES_URL` environment variable
8. Copy the connection string for your local `.env` file

**Note:** Neon offers a free tier that's perfect for development!

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

## Step 2: Run Database Migration

1. Copy `.env.example` to `.env` (if it doesn't exist)
2. Add your database connection string to `.env`:
   ```
   POSTGRES_URL=postgresql://user:password@host:port/database
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the migration:
   ```bash
   npm run migrate
   ```

This will create all necessary tables in your database.

## Step 3: Set Up Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Protect the Pod")
4. Go to "OAuth2" → "General"
5. Copy the "Client ID" and "Client Secret"
6. Add a redirect URI:
   - For local development: `http://localhost:3000/api/auth/callback/discord`
   - For production: `https://your-domain.vercel.app/api/auth/callback/discord`
7. **Required URLs** (in "OAuth2" → "General" section):
   - **Terms of Service URL** (Required): `https://your-domain.vercel.app/terms-of-service`
     - For local development: `http://localhost:3000/terms-of-service`
   - **Privacy Policy URL** (Required): `https://your-domain.vercel.app/privacy-policy`
     - For local development: `http://localhost:3000/privacy-policy`
8. Save changes

## Step 4: Configure Environment Variables

Add these to your `.env` file:

```env
# Database
POSTGRES_URL=your_postgres_connection_string
DATABASE_URL=your_postgres_connection_string

# Application URL
APP_URL=http://localhost:3000
# For production: APP_URL=https://your-domain.vercel.app
# Note: When using vercel dev, it typically runs on port 3000

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-key-here
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Deploy to Vercel

1. Push your code to GitHub (or your Git provider)
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file
   - **Important:** `POSTGRES_URL` is automatically set if you use Neon from Vercel Marketplace
4. Deploy
   - **Migrations run automatically** during the build process
   - You don't need production database credentials on your local machine
   - The build script runs `migrate-on-deploy.js` which applies any pending migrations

## Step 6: Update Discord Redirect URI

After deploying, update your Discord OAuth redirect URI to match your production URL:
- Go back to Discord Developer Portal
- Update the redirect URI to: `https://your-domain.vercel.app/api/auth/callback/discord`

## Testing the API

### Test Database Connection

**Option 1: Use the test script (Recommended)**
```bash
npm run test-db
```

**Option 2: Manual test with dotenv**
```bash
node -e "import('dotenv').then(dotenv => { dotenv.config(); return import('@vercel/postgres'); }).then(({sql}) => sql.query('SELECT 1').then(() => console.log('✅ Connected')))"
```

**Note:** 
- The test script automatically loads your `.env` file. If using `node -e` directly, you need to load dotenv first.
- `npm run test-db:prod` only **tests the connection** - it does NOT migrate the database.
- **Production migrations run automatically** during Vercel deployment - you don't need prod credentials locally.

### Test Authentication

1. Start your Next.js dev server: `npm run dev`
   - The server will start on `http://localhost:3000` (Next.js default port)
2. Visit: `http://localhost:3000/api/auth/signin/discord`
3. You should be redirected to Discord for authorization
4. After authorizing, you'll be redirected back to your app

**Troubleshooting Step 2:**
- **If you get a 500 error:** Check your terminal where `npm run dev` is running for error messages
- **If redirect doesn't work:** Verify your Discord OAuth redirect URI matches EXACTLY:
  - Go to Discord Developer Portal → Your App → OAuth2 → General
  - Check "Redirects" section - it must include: `http://localhost:3000/api/auth/callback/discord`
  - Make sure there are no trailing slashes or typos
  - The port number must be 3000 (Next.js default)
- **If you see "Discord OAuth not configured":** Make sure `DISCORD_CLIENT_ID` is set in your `.env` file
- **If you get redirected but see an error:** Check the callback route logs in your terminal

### Test API Endpoints

```bash
# Get session
curl http://localhost:3000/api/auth/session

# Create a pool (after auth)
curl -X POST http://localhost:3000/api/pools \
  -H "Content-Type: application/json" \
  -d '{"setCode":"SOR","cards":[],"isPublic":false}'
```

## Troubleshooting

### Database Connection Issues

- Make sure `POSTGRES_URL` is set correctly
- Check that your database is accessible from Vercel
- For local development, you may need to whitelist your IP in the database settings

### OAuth Issues

- Verify redirect URIs match exactly (including http/https and trailing slashes)
- Check that client ID and secret are correct
- Make sure the OAuth app is not in "Public Bot" mode (should be OAuth2)

### API Route Not Found

- Make sure you're using `npm run dev` (Next.js development server)
- Check that API files are in the `app/api/` directory (Next.js App Router)
- Verify the route file exports the HTTP method (e.g., `export async function GET()`)
- Next.js runs on port 3000 by default (or next available port)

## Next Steps

Once the API is set up, you can:
1. Test authentication in the frontend
2. Implement pool saving/sharing (Phase 2)
3. Add pool history UI (Phase 3)
