# Database Setup Guide

## Quick Answer: Use Neon from Vercel Marketplace

When setting up storage in Vercel, **select Neon** from the "Marketplace Database Providers" section. It's the "Serverless Postgres" option.

## Step-by-Step: Setting Up Neon Database

1. **In Vercel Dashboard:**
   - Go to your project
   - Click on the **"Storage"** tab
   - Click **"Create New"** or **"Browse Storage"**

2. **In the Storage Modal:**
   - You'll see "Marketplace Database Providers" section
   - Click on **Neon** (the one that says "Serverless Postgres")
   - Click **"Continue"**

3. **Create Neon Database:**
   - If you don't have a Neon account, you'll be prompted to create one (free)
   - Follow the prompts to create your database
   - Vercel will automatically:
     - Create the database in Neon
     - Add `POSTGRES_URL` environment variable to your Vercel project
     - Link the database to your project

4. **Get Connection String for Local Dev:**
   - In Vercel dashboard → Storage → Your Neon database
   - Copy the connection string
   - Add it to your local `.env` file as `POSTGRES_URL`

## Alternative Options

### Option 2: Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier available)
3. Go to Settings → Database
4. Copy the connection string
5. Add to `.env` as `POSTGRES_URL`

### Option 3: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb protectthepod` (or any name you prefer)
3. Connection string: `postgresql://localhost:5432/protectthepod`
4. Add to `.env` as `POSTGRES_URL`

### Option 4: Other Cloud Providers

- **AWS RDS**: Available through Vercel Marketplace
- **Upstash**: Available through Vercel Marketplace (Redis-focused)
- **Any PostgreSQL**: As long as you have a connection string

## After Setup

Once you have your database:

1. **Run the migration:**
   ```bash
   npm run migrate
   ```

2. **Verify connection:**
   ```bash
   node -e "import('@vercel/postgres').then(({sql}) => sql.query('SELECT 1').then(() => console.log('✅ Connected!')).catch(e => console.error('❌ Error:', e.message)))"
   ```

## Neon Free Tier Limits

- 0.5 GB storage
- 1 project
- Perfect for development and small projects

## Troubleshooting

**"No databases found" in Vercel:**
- Make sure you selected Neon from the Marketplace, not the direct storage options
- The direct options (Edge Config, Blob) are not PostgreSQL databases

**Connection string not working:**
- Make sure you copied the full connection string
- Check that the database is active in Neon dashboard
- Verify network access settings in Neon

**Migration fails:**
- Check that `POSTGRES_URL` is set correctly
- Make sure the database exists
- Verify you have CREATE TABLE permissions
