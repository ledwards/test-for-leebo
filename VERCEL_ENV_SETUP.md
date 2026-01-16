# Vercel Environment Variables Setup Guide

## Simplified Setup: Using POSTGRES_URL

We use a single environment variable `POSTGRES_URL` with different values per environment:
- **Production:** Points to production database
- **Development:** Points to development database
- **Preview:** Points to production database (preview uses prod)

## Step-by-Step: Setting Up Environment Variables

### Step 1: Answer "No" to Initial Pull (For Now)

When Vercel CLI asks:
```
? Would you like to pull environment variables now? (Y/n)
```

**Answer: `n` (no)**

We'll set them up in Vercel first, then pull them.

### Step 2: Set Up Variables in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to **Settings** → **Environment Variables**

2. **Set POSTGRES_URL for Production:**
   - Click **Add New** (or edit existing if it exists)
   - **Name:** `POSTGRES_URL`
   - **Value:** (paste your **production** database connection string)
     - Get it from: Storage → Your production database → Connection String
   - **Environments:** Check **only "Production"**
   - Click **Save**

3. **Set POSTGRES_URL for Development:**
   - Click **Add New** again (or create another `POSTGRES_URL` entry)
   - **Name:** `POSTGRES_URL`
   - **Value:** (paste your **development** database connection string)
     - Get it from: Storage → Your dev database → Connection String
   - **Environments:** Check **only "Development"**
   - Click **Save**

4. **Set POSTGRES_URL for Preview:**
   - Click **Add New** again
   - **Name:** `POSTGRES_URL`
   - **Value:** (paste your **production** database connection string - same as Production)
   - **Environments:** Check **only "Preview"**
   - Click **Save**

   **Note:** Preview uses production database, so use the same connection string as Production.

5. **Add Other Required Variables:**
   Make sure these are also set (for all environments or as needed):
   - `APP_URL` = Your production URL (for Production) or `http://localhost:3000` (for Development)
   - `DISCORD_CLIENT_ID` = Your Discord app client ID
   - `DISCORD_CLIENT_SECRET` = Your Discord app client secret
   - `JWT_SECRET` = A random secret string

### Step 3: Verify Your Setup

In Vercel Dashboard → Environment Variables, you should see:

- `POSTGRES_URL` (Production) → Production database URL
- `POSTGRES_URL` (Development) → Development database URL
- `POSTGRES_URL` (Preview) → Production database URL (same as Production)

### Step 4: Pull Environment Variables to Local

Now that Vercel has the correct variables, pull them:

```bash
vercel env pull .env
```

**What this does:**
- Downloads all environment variables from Vercel
- Updates your local `.env` file
- For `POSTGRES_URL`, it will pull the **Development** value (since that's what you need locally)

**Note:** This will overwrite your current `.env` file. Make a backup if needed:
```bash
cp .env .env.backup
```

### Step 5: Verify Your Local .env File

After pulling, your `.env` should have:
```env
# From Vercel (Development environment)
POSTGRES_URL=postgresql://... (your dev database)

# Other variables
APP_URL=http://localhost:3000
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
JWT_SECRET=...
```

### Step 6: Test the Setup

```bash
# Test dev database connection
npm run test-db

# Test dev migrations
npm run migrate:dev

# Check migration status
npm run migrate:status
```

## How It Works

### In Vercel (Deployments):

- **Production deployments:** Use `POSTGRES_URL` = Production database
- **Preview deployments (PRs):** Use `POSTGRES_URL` = Production database
- **Development (vercel dev):** Uses `POSTGRES_URL` = Development database (from your local `.env`)

### Locally:

- Your `.env` file has `POSTGRES_URL` = Development database
- When you run `npm run migrate:dev`, it uses the dev database
- When you run `npm run migrate:prod`, you need to temporarily set `POSTGRES_URL` to production (or set it as an env var)

## Running Production Migrations Locally

If you need to run production migrations from your local machine:

**Option 1: Temporarily update .env**
```bash
# Edit .env, change POSTGRES_URL to production database
# Then run:
npm run migrate:prod
# Then change it back to dev database
```

**Option 2: Set environment variable inline**
```bash
POSTGRES_URL=postgresql://prod-db-url npm run migrate:prod
```

**Option 3: Use Vercel CLI (recommended)**
```bash
# This uses Vercel's production environment variables
vercel env pull .env.production --environment=production
# Then temporarily use that file
mv .env .env.dev
mv .env.production .env
npm run migrate:prod
mv .env .env.production
mv .env.dev .env
```

## Recommendation: Should You Pull Now?

### ✅ **YES, Pull Now** - Recommended Approach

**After you've set up the variables in Vercel Dashboard:**

1. **Set up variables in Vercel first** (as described above)
2. **Then pull:** `vercel env pull .env`
3. **This gives you:**
   - All variables synced from Vercel
   - `POSTGRES_URL` pointing to dev database (for local work)
   - Other variables (Discord, JWT, etc.) already configured
   - No conflicts - Vercel is the source of truth

**Benefits:**
- ✅ Single source of truth (Vercel dashboard)
- ✅ Easy to keep local and remote in sync
- ✅ No manual copying of connection strings
- ✅ Team members can pull the same setup

**Workflow:**
```bash
# Initial setup (one time)
vercel link
# Set up variables in Vercel dashboard
vercel env pull .env

# Daily development
npm run migrate:dev
npm run test-db
vercel dev
```

### ❌ **NO, Don't Pull** - Manual Approach

Only if you prefer to:
- Keep local `.env` completely separate
- Manually manage connection strings
- Not sync with Vercel

**Not recommended** because it's more error-prone and harder to maintain.

## Summary

1. ✅ Answer "no" to initial pull prompt
2. ✅ Set up `POSTGRES_URL` in Vercel dashboard:
   - Production → Production database
   - Development → Development database
   - Preview → Production database (same as Production)
3. ✅ Add other required variables (Discord, JWT, etc.)
4. ✅ Pull variables: `vercel env pull .env`
5. ✅ Test locally: `npm run test-db` and `npm run migrate:dev`

## Troubleshooting

### "Variable conflict" when pulling

If you have local variables that conflict:
- The pull will overwrite them with Vercel's values
- This is usually what you want
- Make a backup first: `cp .env .env.backup`

### Wrong database in local .env after pulling

If `POSTGRES_URL` points to production after pulling:
- Check Vercel dashboard - make sure Development environment has the dev database URL
- Pull again: `vercel env pull .env`
- Or manually edit `.env` to point to dev database

### Preview deployments using wrong database

- Make sure Preview environment in Vercel has `POSTGRES_URL` = Production database
- Redeploy the preview to pick up the change
