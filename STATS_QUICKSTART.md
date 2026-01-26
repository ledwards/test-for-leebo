# Stats Feature - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Run the Migration

```bash
# Development database
npm run migrate:dev

# Production database (requires confirmation)
npm run migrate:prod
```

This creates two new tables:
- `card_generations` - tracks every card generated
- `qa_test_results` - stores QA test results

### Step 2: Generate Some Data

The tracking is automatic! Just use the site:
- Create a draft → all cards are tracked
- Generate a sealed pool → all cards are tracked

**Tip:** Generate at least 100+ packs for meaningful statistics.

### Step 3: View Statistics

Navigate to `/stats` in your browser!

---

## 📊 What You'll See

### Set Tabs (SOR, SHD, TWI)
Tables showing generation statistics for each card:

| Card # | Name | Type | Aspects | Base | Hyperspace | Foil | Hyper Foil | Showcase |
|--------|------|------|---------|------|------------|------|------------|----------|
| 001 | Darth Vader | Unit | 🔴🔵 | **50**/51.2 (-2%) | **10**/9.8 (+2%) | ... | ... | ... |

**Color Coding:**
- 🟢 **Green** - Within expected range (normal)
- 🟡 **Yellow** - Statistical outlier (monitor)
- 🔴 **Red** - Extreme outlier (possible bug!)

### Reference Tab
- Pack construction details
- Drop rates by set
- Card counts by rarity
- Statistical interpretation guide

### QA Tab
- View automated test results
- See latest test run timestamp
- Monitor pack generation health
- Run tests locally with `npm run qa`

---

## 🔍 Understanding the Numbers

### Format: `observed/expected (±%)`

**Example 1:** `50/51.2 (-2.3%)`
- Generated 50 times
- Expected 51.2 times
- 2.3% below expected
- ✅ Normal variation

**Example 2:** `5/50.0 (-90%)`
- Generated only 5 times
- Expected 50 times
- 90% below expected
- ⚠️ **BUG DETECTED!**

---

## 🔧 How It Works

### Statistical Method: Z-Test for Proportions

```
Z = (observed - expected) / sqrt(n × p × (1-p))

Where:
- observed = actual count
- expected = probability × total opportunities  
- n = total packs generated
- p = probability of generating this card
```

### Significance Thresholds

| Color | Z-Score Range | Confidence Interval | Meaning |
|-------|---------------|---------------------|---------|
| Green | \|z\| < 1.96 | 95% CI | Expected variation |
| Yellow | 1.96 ≤ \|z\| < 2.58 | 95-99% CI | Outlier (1 in 20-100) |
| Red | \|z\| ≥ 2.58 | >99% CI | Extreme (1 in 100+) |

**Translation:** 
- Green = "Everything is fine"
- Yellow = "Worth checking, but might be normal"
- Red = "Something is probably broken"

---

## 🧪 Running QA Tests

### From Command Line (Recommended)
```bash
npm run qa
```

This will:
1. Run all statistical tests (takes 1-2 minutes)
2. Output results to console
3. Save results to `src/qa/results.json`
4. Results automatically appear on `/stats` page

### Viewing Results
1. Go to `/stats` → QA tab
2. See latest test results and summary
3. No need to wait - results load instantly from file

### Tests Include:
✓ Pack contains exactly 16 cards  
✓ Exactly 1 leader, 1 base  
✓ 9 commons, 2-3 uncommons, 1-2 rare/legendary  
✓ Exactly 1 foil  
✓ No duplicate cards in same pack  
✓ All 6 aspects present in commons  
✓ Rarity distribution matches expected rates  
✓ Statistical anomaly detection  

---

## 📈 Sample Workflow

### Scenario: Testing a New Set Release

1. **Before Release:**
   ```bash
   npm run migrate:dev
   ```

2. **Test Generation:**
   - Create 10 test drafts (80 packs)
   - Generate 20 sealed pools (120 packs)
   - Total: ~200 packs

3. **Check Statistics:**
   - Go to `/stats`
   - Select new set tab
   - Look for red/yellow cells
   - Investigate any outliers

4. **Run QA:**
   ```bash
   npm run qa
   ```
   - Verify all tests pass
   - Check `/stats` → QA tab for results
   - Fix any failures before release

5. **Production:**
   ```bash
   npm run migrate:prod
   ```

---

## 🐛 Troubleshooting

### "No statistics available"
- Migration not run → Run `npm run migrate:dev`
- No data generated → Create some drafts/pools
- API error → Check browser console

### Statistics look wrong
- Small sample size → Need 100+ packs for accuracy
- Wrong set selected → Check tab matches your data
- Database issue → Check logs

### QA tests failing
- Run `npm run qa` to regenerate results
- Check console output for specific errors
- Data file mismatch → Run `npm run fetch-cards`
- Configuration issue → Check `src/utils/setConfigs/`

### QA page shows "No results"
- Run `npm run qa` to generate results
- Check that `src/qa/results.json` exists
- Refresh the page after running tests

---

## 🎯 Pro Tips

1. **Generate data regularly** during development to catch regressions early
2. **Monitor yellow outliers** - they might indicate subtle bugs
3. **Hover over cells** to see Z-scores and detailed stats
4. **Export results** (coming soon) for historical comparison
5. **Set up CI/CD** to run QA tests on every deploy

---

## 📚 Further Reading

- [Full Documentation](./STATS_IMPLEMENTATION.md) - Complete technical details
- [Statistical Methods](./STATS_IMPLEMENTATION.md#statistical-analysis) - Math behind the analysis
- [API Endpoints](./STATS_IMPLEMENTATION.md#api-endpoints) - Integration guide

---

## ✨ What's Next?

Future enhancements planned:
- Time-series tracking (detect changes over time)
- Export to CSV
- Automated alerts for outliers
- Comparison between deployments
- Real-time updates

---

**Questions?** Check the [full documentation](./STATS_IMPLEMENTATION.md) or review the code!