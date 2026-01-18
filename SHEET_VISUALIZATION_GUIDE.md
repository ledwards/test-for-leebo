# Sheet Visualization Guide

## Quick Start

```bash
# Visualize a specific set
npm run visualize-sheets SOR

# Visualize all sets
npm run visualize-sheets
```

## What It Does

The sheet visualization system generates visual representations of the 11×11 print sheets used in pack generation. This lets you:

1. **Inspect sheet composition** - See exactly which cards are on each sheet
2. **Verify card counts** - Count how many copies of each card appear
3. **Check blank positions** - See where blank slots are placed
4. **Understand the system** - Visualize how the printer-based collation works

## Output Files

When you run `npm run visualize-sheets SOR`, it creates files in `sheets/SOR/`:

### Index Page (Start Here!)

**`index.html`** - A convenient landing page with links to all generated sheets, organized by category:

```bash
# macOS
open sheets/SOR/index.html

# Linux
xdg-open sheets/SOR/index.html

# Windows
start sheets/SOR/index.html
```

The index page includes:
- **Base Sheets**: R/L, Uncommon, Leader, Bases
- **Common Sheets**: 3 sheets with column color uniformity  
- **Common Belts**: Belt A and Belt B
- **Foil Sheets**: 8 sheets for full coverage
- **Hyperspace Variants**: R/L, Uncommon, Leader, Bases, Common Belts
- **Hyperspace Foil Sheets**: 8 hyperspace foil sheets

### Individual HTML Files

All sheets are also available as individual files:

**Base Sheets**:
- **`rare-legendary-base.html`** - R/L sheet (96 rares + 16 legendaries)
- **`uncommon-1.html`** - Uncommon sheet (60 uncommons × 2 copies)
- **`common-1.html`**, **`common-2.html`**, **`common-3.html`** - Common sheets with column uniformity
- **`commonBeltA-base.html`** - Common Belt A (odd columns taped together)
- **`commonBeltB-base.html`** - Common Belt B (even columns taped together)
- **`leader-base.html`** - Leader sheet (8 common + 10 rare leaders)
- **`bases-base.html`** - Bases sheet (12 bases × ~10 copies)

**Foil Sheets** (8 sheets for full coverage):
- **`foil-foil-1.html`** through **`foil-foil-8.html`** - Mixed rarities

**Hyperspace Variants**:
- **`rare-legendary-hyperspace.html`** - Hyperspace R/L sheet
- **`uncommon-1-hyperspace-1.html`** - Hyperspace uncommon sheet
- **`leader-hyperspace.html`** - Hyperspace leader sheet
- **`bases-hyperspace.html`** - Hyperspace bases sheet
- **`commonBeltA-hyperspace.html`** - Hyperspace Belt A
- **`commonBeltB-hyperspace.html`** - Hyperspace Belt B

**Hyperspace Foil Sheets** (8 sheets):
- **`foil-hyperspace-1.html`** through **`foil-hyperspace-8.html`** - Hyperspace foil variants

### Text Files (Detailed)
Detailed card counts and positions:

- **`rare-legendary-base-detailed.txt`** - Full breakdown of R/L sheet
- **`leader-base-detailed.txt`** - Full breakdown of leader sheet

## HTML Visualization Features

The HTML files provide two viewing modes:

### Text View
Shows card names and rarities in a grid layout:

#### 1. Header Information
- Sheet type and variant
- Set code
- Size (11×11 = 121 cards)
- Fill count and blanks
- Toggle links to switch between Text and Image views

#### 2. Rarity Distribution Stats
Shows how many cards of each rarity are on the sheet:
```
Rarity Distribution
Rare: 96 cards
Legendary: 16 cards
```

#### 3. Interactive Grid
- 11×11 grid showing all 121 positions
- Color-coded borders by aspect:
  - **Blue border** - Vigilance
  - **Green border** - Command
  - **Red border** - Aggression
  - **Yellow border** - Cunning
  - **Gray border** - Neutral/Hero/Villain
- Blank slots shown in gray
- Card names and rarities displayed in each cell

#### 4. Responsive Layout
- Grid adapts to screen size
- Hover effects for better visibility
- Clean, professional design

### Image View
Shows actual card images in a grid layout:

#### 1. Header Information
- Same header as text view
- Toggle links to switch between Text and Image views

#### 2. Card Image Grid
- 11×11 grid displaying actual card images
- Images load lazily for better performance
- Hover to see card name and rarity overlay
- Cards without images fall back to text display
- Aspect-colored borders match text view

#### 3. Image Loading
- Uses `loading="lazy"` for performance
- Graceful fallback if image fails to load
- Shows count of cards with available images

#### 4. Visual Features
- Full card images in proper aspect ratio (5:7)
- Smooth hover transitions
- Professional sheet-like appearance

## Text File Format

The detailed text files show:

### Card Distribution Section
```
=== CARD DISTRIBUTION ===
  2x The Emperor's Legion (Rare)
  2x Electrostaff (Rare)
  1x Darth Vader (Legendary)
  1x Luke Skywalker (Legendary)
  ...
```

### Blank Positions Section
```
=== BLANK POSITIONS ===
Positions: 112, 113, 114, 115, 116, 117, 118, 119, 120
```

### Grid Section
```
=== GRID ===
 0| The Emperor's Legion | Electrostaff | K-2SO | ...
 1| Traitorous | Don't Get Cocky | Del Meeko | ...
 ...
```

## Use Cases

### 1. Verify Sheet Composition
Check that sheets match the expected configuration:
```bash
npm run visualize-sheets SOR
open sheets/SOR/rare-legendary-base.html
```

Look for:
- ✅ 96 rares (each appearing 2×)
- ✅ 16 legendaries (each appearing 1×)
- ✅ 9 blank slots

### 2. Debug Belt System
Verify that Belt A and Belt B have no overlapping cards:
```bash
npm run visualize-sheets SOR
open sheets/SOR/common-beltA-1-base.html
open sheets/SOR/common-beltB-1-base.html
```

Manually check that no card appears in both belts.

### 3. Compare Sets
See the differences between sets 1-3 and 4-6:
```bash
npm run visualize-sheets SOR
npm run visualize-sheets JTL
open sheets/SOR/rare-legendary-base.html
open sheets/JTL/rare-legendary-base.html
```

Notice:
- SOR: 16 legendaries
- JTL: 20 legendaries (more!)

### 4. Inspect Foil Sheets
Check foil sheet composition:
```bash
npm run visualize-sheets JTL
open sheets/JTL/foil-foil.html
```

For sets 4-6, you should see Special rarity cards in the foil sheet.

### 5. Verify Hyperspace Sheets
Confirm hyperspace sheets mirror base sheets:
```bash
npm run visualize-sheets SOR
open sheets/SOR/rare-legendary-base.html
open sheets/SOR/rare-legendary-hyperspace.html
```

Should have identical card selection, just hyperspace variants.

## Example Workflow

### Investigating Legendary Rates

1. **Generate visualizations**:
   ```bash
   npm run visualize-sheets SOR
   npm run visualize-sheets JTL
   ```

2. **Open R/L sheets**:
   ```bash
   open sheets/SOR/rare-legendary-base.html
   open sheets/JTL/rare-legendary-base.html
   ```

3. **Count legendaries**:
   - SOR: Count orange-bordered cards = 16
   - JTL: Count orange-bordered cards = 20

4. **Calculate ratio**:
   - SOR: 16 / (96 + 16) = 14.29%
   - JTL: 20 / (90 + 20) = 18.18%

5. **Conclusion**: JTL has higher legendary rate ✓

## Tips

### Opening Multiple Files
```bash
# macOS
open sheets/SOR/*.html

# Linux
xdg-open sheets/SOR/*.html

# Windows
start sheets/SOR/*.html
```

### Comparing Sheets Side-by-Side
Open two browser windows and arrange them side-by-side to compare:
- Belt A vs Belt B (check for duplicates)
- Set 1 vs Set 4 (compare legendary counts)
- Base vs Hyperspace (verify mirroring)

### Searching for Specific Cards
Use browser's Find function (Ctrl+F / Cmd+F) to search for card names in the HTML visualization.

### Printing Sheets
The HTML files are print-friendly. Use browser print (Ctrl+P / Cmd+P) to create PDFs of sheets for offline inspection.

## Output Directory Structure

```
sheets/
├── SOR/
│   ├── rare-legendary-base.html (text view)
│   ├── rare-legendary-base-images.html (image view)
│   ├── rare-legendary-base-detailed.txt
│   ├── uncommon-1-base.html
│   ├── uncommon-1-base-images.html
│   ├── common-beltA-1-base.html
│   ├── common-beltA-1-base-images.html
│   ├── common-beltA-2-base.html
│   ├── common-beltA-2-base-images.html
│   ├── common-beltA-3-base.html
│   ├── common-beltA-3-base-images.html
│   ├── common-beltB-1-base.html
│   ├── common-beltB-1-base-images.html
│   ├── common-beltB-2-base.html
│   ├── common-beltB-2-base-images.html
│   ├── common-beltB-3-base.html
│   ├── common-beltB-3-base-images.html
│   ├── leader-base.html
│   ├── leader-base-images.html
│   ├── leader-base-detailed.txt
│   ├── base-base.html
│   ├── base-base-images.html
│   ├── foil-foil.html
│   ├── foil-foil-images.html
│   ├── rare-legendary-hyperspace.html
│   ├── rare-legendary-hyperspace-images.html
│   ├── foil-hyperspace.html
│   └── foil-hyperspace-images.html
├── JTL/
│   └── (same structure)
└── (other sets)
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Run from project root:
```bash
cd /Users/lee/Repos/ledwards/swupod
npm run visualize-sheets SOR
```

### Issue: No files generated
**Solution**: Check that card cache is initialized. The script should automatically initialize it.

### Issue: HTML files don't display correctly
**Solution**: Make sure you're opening them in a modern browser (Chrome, Firefox, Safari, Edge).

### Issue: Want to regenerate sheets
**Solution**: Just run the command again. It will overwrite existing files:
```bash
npm run visualize-sheets SOR
```

## Advanced Usage

### Visualize All Sets at Once
```bash
npm run visualize-sheets
```

This generates visualizations for all 6 sets (SOR, SHD, TWI, JTL, LOF, SEC).

### Custom Output Directory
Edit `scripts/visualizeSheets.js` to change the output directory:
```javascript
const outputDir = path.join(process.cwd(), 'my-custom-dir')
```

### Programmatic Usage
```javascript
import { generateCompleteSheetSet } from './src/utils/packBuilder.js'
import { visualizeAllSheets } from './src/utils/sheetVisualization.js'
import { getCachedCards } from './src/utils/cardCache.js'

const cards = getCachedCards('SOR')
const sheets = generateCompleteSheetSet(cards, 'SOR')
const files = visualizeAllSheets(sheets, './my-output-dir')
console.log('Generated:', files)
```

## Related Commands

```bash
npm run test-inspect      # Quick sheet composition check
npm run test-legendary    # Test legendary rates
npm run visualize-sheets  # Generate visual sheets
```

## Notes

- The `sheets/` directory is in `.gitignore` (not committed to git)
- Sheets are regenerated each time you run the command
- HTML files are self-contained (no external dependencies)
- Text files are useful for scripting/automation
- Visualizations reflect the current sheet generation algorithm

## See Also

- `README.md` - Project overview and set differences
- `TESTING_GUIDE.md` - Testing instructions
- `MANUFACTURING_RULES.md` - Manufacturing rules and belt system
- `src/utils/sheetVisualization.js` - Implementation code
