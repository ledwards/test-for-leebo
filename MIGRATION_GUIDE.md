# Database Migration Guide

This guide explains how to set up and use separate development and production databases with the migration system.

## Overview

The migration system supports:
- **Separate databases** for development and production
- **Migration tracking** to know which migrations have been applied
- **Safety checks** to prevent accidental production migrations
- **Idempotent migrations** (safe to run multiple times)

## Setup

### 1. Create Your Databases

#### Development Database (Recommended: Neon via Vercel)

1. Go to your Vercel dashboard
2. Navigate to your project → Storage tab
3. Click "Create New" → Browse Storage
4. Select **Neon** (Serverless Postgres) from Marketplace
5. Create a development database
6. Copy the connection string

#### Production Database

1. Create a separate Neon database for production (or use Vercel Postgres)
2. Copy the connection string

### 2. Configure Environment Variables

**In Vercel Dashboard:**
- Set `POSTGRES_URL` to **production database** for **Production** environment
- Set `POSTGRES_URL` to **development database** for **Development** environment  
- Set `POSTGRES_URL` to **production database** for **Preview** environment (preview uses prod)

**In Local `.env` file:**

For local development, set:
```env
# Development Database (for local dev work)
POSTGRES_URL=postgresql://user:password@dev-host/devdb
```

For local production testing (optional):
```env
# Production Database (only if testing prod migrations locally)
POSTGRES_URL=postgresql://user:password@prod-host/proddb
```

**Important:** Never commit your `.env` file to version control!

### 3. Install Dependencies

```bash
npm install
```

This will install the `pg` package needed for migrations.

## Usage

### Migrate Development Database

```bash
npm run migrate:dev
```

This will:
- Connect to your development database (using `POSTGRES_URL` from your `.env`)
- Run all pending migrations
- Track which migrations have been applied

**Note:** Make sure your local `.env` has `POSTGRES_URL` pointing to your dev database.

### Migrate Production Database

```bash
npm run migrate:prod
```

This will:
- **Ask for confirmation** before proceeding (type "yes" to continue)
- Connect to your production database (using `POSTGRES_URL` from your `.env`)
- Run all pending migrations
- Track which migrations have been applied

**Note:** For production migrations, temporarily set `POSTGRES_URL` in your `.env` to point to production, or set it as an environment variable when running the command.

### Check Migration Status

```bash
npm run migrate:status
```

This shows the migration status for both dev and prod databases:
- Which migrations have been applied
- When they were applied
- Which migrations are pending

## Migration Files

Migrations are stored in the `migrations/` directory:

- `000_migration_tracking.sql` - Creates the migration tracking table (auto-applied)
- `001_initial_schema.sql` - Initial database schema
- `002_*.sql` - Future migrations (numbered sequentially)

### Creating New Migrations

1. Create a new file in `migrations/` with the next sequential number:
   ```
   migrations/002_add_new_feature.sql
   ```

2. Write your SQL migration (should be idempotent):
   ```sql
   -- Example: Add a new column
   ALTER TABLE users ADD COLUMN IF NOT EXISTS new_field TEXT;
   ```

3. Run the migration:
   ```bash
   npm run migrate:dev  # Test in dev first!
   ```

4. After testing, apply to production:
   ```bash
   npm run migrate:prod
   ```

## Best Practices

### 1. Always Test in Dev First

```bash
# 1. Test migration in dev
npm run migrate:dev

# 2. Test your application with the new schema

# 3. Only then migrate production
npm run migrate:prod
```

### 2. Make Migrations Idempotent

Use `IF NOT EXISTS`, `IF EXISTS`, etc. to make migrations safe to run multiple times:

```sql
-- ✅ Good: Idempotent
CREATE TABLE IF NOT EXISTS new_table (...);
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_field TEXT;

-- ❌ Bad: Not idempotent
CREATE TABLE new_table (...);  -- Will fail if table exists
```

### 3. Use Transactions When Possible

For complex migrations, wrap in a transaction:

```sql
BEGIN;

-- Your migration SQL here

COMMIT;
```

### 4. Backup Production Before Migrating

Before running production migrations:
1. Create a database backup
2. Test the migration in a staging environment if possible
3. Have a rollback plan

## Troubleshooting

### "POSTGRES_URL_DEV is not set"

Make sure you have `POSTGRES_URL_DEV` in your `.env` file.

### "POSTGRES_URL_PROD is not set"

Make sure you have `POSTGRES_URL_PROD` in your `.env` file for production migrations.

### Connection Errors

- Verify your connection strings are correct
- Check that your database is accessible from your network
- For Neon databases, ensure SSL is enabled if required

### Migration Already Applied

If a migration shows as "already applied" but you want to re-run it:
1. Remove the entry from the `migrations` table:
   ```sql
   DELETE FROM migrations WHERE migration_name = '001_initial_schema.sql';
   ```
2. Re-run the migration

**Warning:** Only do this in development! Never modify the migrations table in production.

## Environment-Specific Configuration

### Local Development

Use a local `.env` file with `POSTGRES_URL_DEV` pointing to your dev database.

### Vercel Production

Set environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add `POSTGRES_URL_PROD` for Production environment
- Add `POSTGRES_URL_DEV` for Development/Preview environments

### CI/CD

In your CI/CD pipeline, set environment variables:
```bash
export POSTGRES_URL_DEV=...
export POSTGRES_URL_PROD=...
npm run migrate:dev  # or migrate:prod for production builds
```

## Why Separate Databases?

1. **Safety**: Prevents accidental data loss or corruption in production
2. **Testing**: Allows testing migrations and schema changes safely
3. **Isolation**: Dev and prod data don't interfere with each other
4. **Flexibility**: Can reset dev database without affecting production

## Neon Database Recommendation

We recommend using **Neon** for both dev and prod because:

- ✅ **Free tier available** for development
- ✅ **Serverless** - scales automatically
- ✅ **Easy setup** via Vercel Marketplace
- ✅ **Branching support** - can create preview branches for PRs
- ✅ **Same environment** as production (no surprises)

### Setting Up Neon

1. In Vercel → Storage → Create New
2. Select Neon from Marketplace
3. Create separate databases for dev and prod
4. Copy connection strings to your `.env` file
