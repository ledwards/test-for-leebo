# Statistics Feature Implementation

## Overview

This feature adds comprehensive statistics tracking and analysis for card and pack generation. It tracks every card generated in drafts and sealed pools, performs statistical analysis to detect anomalies, and provides a web interface to view the data.

## Architecture

### 1. Database Schema

**`card_generations` table** - Tracks every card generated:
- Card identification (id, name, type, rarity, aspects)
- Treatment type (base, hyperspace, foil, hyperspace_foil, showcase)
- Pack information (type, slot)
- Source tracking (draft/sealed, source ID)
- Timestamp

**`qa_test_results` table** - Stores QA test results:
- Test suite, name, status
- Error messages
- Execution time
- Git commit and deployment ID (for CI/CD integration)

### 2. Generation Tracking

**`src/utils/trackGeneration.js`** - Utility functions:
- `trackCardGeneration()` - Track single card
- `trackPackGeneration()` - Track multiple cards
- `trackBulkGenerations()` - Bulk insert for performance

**Integration points:**
- `app/api/draft/[shareId]/start/route.js` - Tracks draft pack generation
- `app/api/pools/route.js` - Tracks sealed pool generation

### 3. Statistical Analysis

**`src/utils/statsCalculations.js`** - Statistical utilities:
- **Z-test for proportions** - Tests if observed frequency differs significantly from expected
- **Significance categorization:**
  - Green: Within 95% CI (expected)
  - Yellow: 95-99% CI (outlier)
  - Red: Beyond 99% CI (extreme outlier - possible issue)
- Probability calculations for each card treatment type
- Expected value calculations based on pack constants

**Statistical Method:**
```
Z = (observed - expected) / sqrt(n * p * (1-p))

Where:
- observed = actual count
- expected = probability × total opportunities
- n = total opportunities
- p = probability of generation
```

### 4. API Endpoints

**`GET /api/stats/generations?setCode=SOR`**
- Returns generation statistics for a set
- Includes per-card analysis with significance testing
- Returns reference data (pack constants, drop rates)

**`GET /api/stats/qa`**
- Returns QA test results
- Groups by test run
- Shows latest run summary

**`POST /api/stats/qa`**
- Runs QA tests
- Stores results in database
- Returns summary and detailed results

### 5. UI

**`/stats` page** with tabs:

**Per-Set Tabs (SOR, SHD, TWI):**
- Table showing each card with generation statistics
- Columns: Card #, Name, Type, Aspects, Base, Hyperspace, Foil, Hyperspace Foil, Showcase
- Each treatment cell shows: `observed/expected (+X%)`
- Color-coded by statistical significance
- Hover shows Z-score and interpretation

**Reference Tab:**
- Set selector (SOR, SHD, TWI)
- Pack construction details
- Card counts by rarity
- Drop rates
- Statistical interpretation legend

**QA Tab:**
- Latest test run summary (total, passed, failed)
- Detailed test results
- "Run QA Tests" button
- Test execution times
- Error messages for failed tests

## Setup Instructions

### 1. Run Migration

```bash
# Development
npm run migrate:dev

# Production
npm run migrate:prod
```

This creates the `card_generations` and `qa_test_results` tables.

### 2. Start Generating Data

The tracking is automatic - just use the site normally:
- Create drafts → cards are tracked
- Generate sealed pools → cards are tracked

### 3. View Statistics

Navigate to `/stats` to view generation statistics.

## Usage

### Viewing Statistics

1. Go to `/stats`
2. Select a set tab (SOR, SHD, TWI)
3. Review the generation statistics table
4. Look for yellow/red cells indicating outliers
5. Hover over cells to see Z-scores and interpretation

### Understanding the Colors

- **Green** - Normal variation, everything is working as expected
- **Yellow** - Statistical outlier (1 in 20-100 chance) - worth monitoring
- **Red** - Extreme outlier (less than 1 in 100 chance) - likely indicates a bug

### Running QA Tests

1. Go to `/stats` → QA tab
2. Click "Run QA Tests"
3. Wait for tests to complete
4. Review results for failures

### Interpreting Statistics

**Example:** Darth Vader shows as `50/51.2 (-2.3%)`
- Observed: 50 generations
- Expected: 51.2 generations
- 2.3% below expected (within normal range)

**Red Flag Example:** A card shows `5/50.0 (-90%)`
- Only generated 5 times when expected 50
- This indicates a bug in the generation logic

## Reference Data

The stats page shows all relevant constants for each set:

### Pack Construction
- 16 total cards per pack
- 1 leader, 1 base
- 9 commons
- 2-3 uncommons (3rd can upgrade)
- 1-2 rare/legendary
- 1 foil

### Drop Rates (SOR example)
- Legendary in rare/legendary slot: 19%
- Rare/legendary upgrade chance: 25%
- Foil common: 50%
- Foil uncommon: 30%
- Foil rare: 15%
- Foil legendary: 5%

## QA Test Integration

### Current QA Tests
- Pack construction validation
- Rarity distribution
- Aspect balance in commons
- No duplicate cards in packs
- Leader/base variety
- Foil distribution
- Statistical anomaly detection

### CI/CD Integration (Future)

To run QA tests on deploy:

```javascript
// In your build script or Vercel build command
import { runAllTests } from '@/src/qa/packGeneration.test.js'

const results = await runAllTests()
const failed = results.filter(r => r.status === 'failed').length

if (failed > 0) {
  console.error('QA tests failed!')
  process.exit(1)
}
```

## Performance Considerations

### Bulk Inserts
- Draft generation: Tracks ~144 cards (8 players × 3 packs × 6 cards) in one bulk insert
- Sealed generation: Tracks ~96 cards (6 packs × 16 cards) in one bulk insert
- Non-blocking: Tracking happens async, doesn't slow down generation

### Database Indexes
- `card_id`, `set_code`, `treatment` - For filtering
- `generated_at` - For time-based queries
- Composite index on `(set_code, card_id, treatment, pack_type)` - For stats queries

### Query Optimization
- Stats endpoint uses GROUP BY to aggregate counts
- Results are cached in React state on client
- Reference data is computed once per set

## Future Enhancements

1. **Time-series analysis** - Track statistics over time to detect regressions
2. **Deployment tracking** - Associate generations with specific deployments
3. **Alerts** - Notify when extreme outliers are detected
4. **Export functionality** - Download stats as CSV
5. **Comparison mode** - Compare statistics between deployments
6. **Real-time updates** - WebSocket updates when new data arrives
7. **Advanced filters** - Filter by date range, source type, etc.

## Troubleshooting

### No statistics showing
- Ensure migration has been run
- Generate some packs/drafts
- Check browser console for API errors
- Verify database connection

### Statistics seem wrong
- Check if sample size is large enough (need 100+ packs for accurate stats)
- Review pack constants in set config files
- Verify probability calculations in `statsCalculations.js`
- Check for data type mismatches (string vs number)

### QA tests failing
- Check if card cache is initialized
- Verify set codes match data files
- Review error messages in QA tab
- Run tests locally: `node src/qa/packGeneration.test.js`

## Files Modified/Created

### New Files
- `migrations/004_card_generations.sql`
- `src/utils/trackGeneration.js`
- `src/utils/statsCalculations.js`
- `app/api/stats/generations/route.js`
- `app/api/stats/qa/route.js`
- `app/stats/page.js`
- `app/stats/stats.css`

### Modified Files
- `app/api/draft/[shareId]/start/route.js` - Added generation tracking
- `app/api/pools/route.js` - Added generation tracking
- `src/qa/packGeneration.test.js` - Added export function for API usage

## Testing

### Manual Testing
1. Create a draft → verify cards tracked in database
2. Generate sealed pool → verify cards tracked
3. Visit `/stats` → verify data displays correctly
4. Check color coding → verify significance levels
5. Run QA tests → verify results display

### SQL Queries for Verification

```sql
-- Count total generations
SELECT COUNT(*) FROM card_generations;

-- Generations by set
SELECT set_code, COUNT(*) 
FROM card_generations 
GROUP BY set_code;

-- Generations by treatment
SELECT treatment, COUNT(*) 
FROM card_generations 
GROUP BY treatment;

-- Top 10 most generated cards
SELECT card_name, COUNT(*) as count
FROM card_generations
GROUP BY card_name
ORDER BY count DESC
LIMIT 10;
```

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check database for data integrity
4. Review browser console for errors
5. Check server logs for tracking errors