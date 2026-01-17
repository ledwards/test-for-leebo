# Quick Start Guide

Get up and running in 5 minutes!

## 1. Prerequisites

- Node.js 20.19.0 or higher (or 22.12.0+)
- npm

## 2. Set Up Environment Variables

Create a `.env` file:

```bash
# Database (get from Neon via Vercel Marketplace, Supabase, or local PostgreSQL)
# If using Neon through Vercel, the connection string will be auto-added
# For local dev, copy it from Vercel dashboard → Storage → Neon → Connection String
POSTGRES_URL=postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@host:port/database

# App URL (Vercel dev will use localhost:3000)
APP_URL=http://localhost:3000

# Discord OAuth (get from https://discord.com/developers/applications)
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_secret_here
```

## 3. Run Database Migration

```bash
npm run migrate
```

## 4. Start Development Server

```bash
npm run dev
```

This will:
- Start Next.js development server
- Run both frontend and API routes
- Use your `.env` file for configuration
- Start on `http://localhost:3000` (Next.js default port)

## 5. Test It!

Open your browser to the URL shown (usually `http://localhost:3000`)

Or test the API directly:
```bash
npm run test-api
```

## Troubleshooting

**"vercel: command not found"**
- Make sure you installed it: `npm install -g vercel`

**Database connection error**
- Check your `POSTGRES_URL` is correct
- Make sure database is accessible from your network

**OAuth redirect error**
- Make sure Discord redirect URI matches: `http://localhost:3000/api/auth/callback/discord`
- Check `APP_URL` in `.env` matches the port Vercel uses

**API routes return 404**
- Make sure you're using `npm run dev` (Next.js)
- Check that files are in `app/api/` directory (Next.js App Router)
- Verify route files are named `route.js` and export HTTP methods

## Next Steps

- See `LOCAL_TESTING.md` for detailed testing instructions
- See `API_SETUP.md` for production deployment
- See `PROJECT_PLAN.md` for full feature roadmap
