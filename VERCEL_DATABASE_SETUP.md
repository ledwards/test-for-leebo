# Vercel Database Setup Guide

## Removing a Database from a Specific Environment

If you've added a Neon database to all environments but want to use a different database for Development, follow these steps:

### Option 1: Remove Environment Variable for Development (Recommended)

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to **Settings** → **Environment Variables**

2. **Find the POSTGRES_URL variable:**
   - Look for `POSTGRES_URL` (or the variable name your first database uses)
   - Click on it to edit

3. **Remove from Development:**
   - In the "Environment" section, you'll see checkboxes for:
     - Production
     - Preview
     - Development
   - **Uncheck "Development"** for the first database's `POSTGRES_URL`
   - Save changes

4. **Add your new dev database:**
   - Go to **Storage** tab
   - Click on your new dev database
   - Copy the connection string
   - Go back to **Settings** → **Environment Variables**
   - Click **Add New**
   - Name: `POSTGRES_URL_DEV`
   - Value: (paste your dev database connection string)
   - **Check only "Development"** (and Preview if you want)
   - Save

### Option 2: Use Different Variable Names (Better Approach)

Instead of using `POSTGRES_URL` for both, use separate variables:

1. **For Production Database:**
   - Go to **Storage** → Your production database
   - Copy connection string
   - Go to **Settings** → **Environment Variables**
   - Add new variable:
     - Name: `POSTGRES_URL_PROD`
     - Value: (production connection string)
     - **Check only "Production"**
     - Save

2. **For Development Database:**
   - Go to **Storage** → Your dev database
   - Copy connection string
   - Go to **Settings** → **Environment Variables**
   - Add new variable:
     - Name: `POSTGRES_URL_DEV`
     - Value: (dev connection string)
     - **Check only "Development" and "Preview"**
     - Save

3. **Remove or Update the Original POSTGRES_URL:**
   - Edit the original `POSTGRES_URL` variable
   - **Uncheck "Development"** (keep Production if you want, or remove entirely)
   - Or delete it if you're using separate variables

### Option 3: Delete and Recreate (If Needed)

If you can't edit the environment variable settings:

1. **Go to Storage tab:**
   - Find your first database
   - Click the three dots (⋯) or settings icon
   - Look for "Disconnect" or "Remove" option
   - This will remove it from all environments

2. **Re-add databases separately:**
   - Add production database first, set to Production only
   - Add dev database second, set to Development and Preview

## Recommended Setup

For the migration system we've set up, use this configuration:

### Environment Variables in Vercel:

**Production Environment:**
- `POSTGRES_URL` = Production database connection string
- (Only checked for "Production")

**Development Environment:**
- `POSTGRES_URL` = Development database connection string
- (Only checked for "Development")

**Preview Environment:**
- `POSTGRES_URL` = Production database connection string (preview uses prod)
- (Only checked for "Preview")

### Local `.env` File:

```env
# Development Database (for local development)
POSTGRES_URL=postgresql://user:password@dev-host/devdb
```

**Note:** For local production migrations, temporarily change `POSTGRES_URL` to point to production, or set it as an environment variable when running the command.

## Troubleshooting

### "Can't connect database to environment"

- Make sure no other database is already connected to that environment
- Check that you've removed the old database from the environment variable settings
- Try disconnecting and reconnecting the database

### "Environment variable already exists"

- Vercel might have auto-created `POSTGRES_URL` when you added the database
- Edit the existing variable instead of creating a new one
- Or delete it and create a new one with the name you want

### Verifying Your Setup

1. **Check Environment Variables:**
   - Go to Settings → Environment Variables
   - Verify `POSTGRES_URL_PROD` is only in Production
   - Verify `POSTGRES_URL_DEV` is only in Development/Preview

2. **Test Locally:**
   ```bash
   # Test dev connection
   npm run migrate:dev
   
   # Test prod connection (will ask for confirmation)
   npm run migrate:prod
   ```

3. **Check in Vercel:**
   - Go to Storage tab
   - You should see both databases listed
   - Each should show which environments they're connected to

## Quick Reference

**To remove a database from Development:**
1. Settings → Environment Variables
2. Find the database's environment variable
3. Edit it
4. Uncheck "Development"
5. Save

**To add a new database to Development:**
1. Storage → Your database
2. Copy connection string
3. Settings → Environment Variables → Add New
4. Set name (e.g., `POSTGRES_URL_DEV`)
5. Paste connection string
6. Check only "Development" (and "Preview" if desired)
7. Save
