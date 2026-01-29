#!/bin/bash
set -e

# Migration script for Vercel -> Railway
# Usage: ./scripts/migrate-to-railway.sh

echo "=========================================="
echo "  SWUPOD Migration: Vercel -> Railway"
echo "=========================================="
echo ""

# Configuration - UPDATE THESE
VERCEL_PROJECT="swupod"  # Your Vercel project name
OLD_DB_URL=""  # Will prompt if not set
NEW_DB_URL="postgresql://postgres:nXhQVupkqoxsoDEHPshxpLblDTQYDuDr@shinkansen.proxy.rlwy.net:35971/railway"

# Check for required tools
command -v vercel >/dev/null 2>&1 || { echo "Error: vercel CLI required. Install with: npm i -g vercel"; exit 1; }

# Use PostgreSQL 17 if available (for newer Vercel/Railway DBs)
if [ -x "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
  PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
  PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"
  echo "Using PostgreSQL 17 tools"
else
  PG_DUMP="pg_dump"
  PSQL="psql"
  command -v pg_dump >/dev/null 2>&1 || { echo "Error: pg_dump required. Install PostgreSQL client tools."; exit 1; }
  command -v psql >/dev/null 2>&1 || { echo "Error: psql required. Install PostgreSQL client tools."; exit 1; }
fi

echo "Step 1: What would you like to do?"
echo "  1) Turn on maintenance mode (Vercel)"
echo "  2) Migrate database only"
echo "  3) Full migration (maintenance + db)"
echo "  4) Turn off maintenance mode (after DNS switch)"
read -p "Enter choice [1-4]: " choice

case $choice in
  1|3)
    echo ""
    echo "--- Enabling Maintenance Mode on Vercel ---"
    echo "Setting MAINTENANCE_MODE=true..."

    # Set maintenance mode env var
    vercel env add MAINTENANCE_MODE production <<< "true" 2>/dev/null || \
    vercel env rm MAINTENANCE_MODE production -y 2>/dev/null && \
    vercel env add MAINTENANCE_MODE production <<< "true"

    echo "Triggering redeploy..."
    vercel --prod --yes

    echo ""
    echo "✓ Maintenance mode enabled!"
    echo "  Visit your site to confirm maintenance page is showing."
    echo ""

    if [ "$choice" == "1" ]; then
      exit 0
    fi
    ;;
esac

case $choice in
  2|3)
    echo ""
    echo "--- Database Migration ---"

    # Get source DB URL if not set
    if [ -z "$OLD_DB_URL" ]; then
      echo "Enter your Vercel/old PostgreSQL connection string:"
      echo "(Find this in Vercel Dashboard -> Storage -> Your DB -> Connection String)"
      read -p "OLD_DB_URL: " OLD_DB_URL
    fi

    if [ -z "$OLD_DB_URL" ]; then
      echo "Error: OLD_DB_URL is required"
      exit 1
    fi

    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

    echo ""
    echo "Dumping from source database..."
    $PG_DUMP "$OLD_DB_URL" --no-owner --no-acl > "$BACKUP_FILE"

    echo "Backup saved to: $BACKUP_FILE"
    echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""

    read -p "Restore to Railway database? [y/N]: " confirm
    if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
      echo "Restoring to Railway database..."
      $PSQL "$NEW_DB_URL" < "$BACKUP_FILE"
      echo ""
      echo "✓ Database migration complete!"
    else
      echo "Skipped restore. Backup file: $BACKUP_FILE"
    fi
    ;;
esac

case $choice in
  4)
    echo ""
    echo "--- Disabling Maintenance Mode on Vercel ---"
    vercel env rm MAINTENANCE_MODE production -y 2>/dev/null || true
    echo "✓ Maintenance mode disabled on Vercel"
    echo ""
    echo "Note: If you've switched DNS to Railway, this won't affect anything."
    echo "Make sure MAINTENANCE_MODE is NOT set on Railway."
    ;;
esac

echo ""
echo "=========================================="
echo "  Migration Steps Remaining:"
echo "=========================================="
echo ""
echo "After database migration:"
echo "  1. Verify Railway deployment is working:"
echo "     - Check your Railway URL"
echo "     - Test login and basic functionality"
echo ""
echo "  2. Update DNS records:"
echo "     - Go to your domain registrar (e.g., Cloudflare, Namecheap)"
echo "     - Update A/CNAME record for protectthepod.com"
echo "     - Point to Railway's domain or IP"
echo "     - TTL changes can take 5min - 48hrs to propagate"
echo ""
echo "  3. Update Discord OAuth redirect:"
echo "     - Go to https://discord.com/developers/applications"
echo "     - Update redirect URI if domain changed"
echo ""
echo "  4. Verify everything works on new domain"
echo ""
