# Release Notes

## 02.12.2026

### 🎉 New Features
- **Multi-primary aspect filters**: Arena view now supports LAW set cards with multiple primary aspects (e.g., Aggression+Command). These appear as compact filter buttons below the standard combos in each aspect group. Iterating on this design to get it right before the release of A Lawless Time.
- **Chaos Sealed**: New casual format — build a sealed pool from any 6 packs across any combination of sets!
- **Casual format history**: Your casual games (Pack Wars, Pack Blitz, Chaos Draft, Chaos Sealed, Rotisserie) now appear in your history page.

### 🎨 UI Improvements
- **Mobile landscape**: Arena mode now works on phones turned sideways! Cost columns wrap into two rows of four. Nav bar compresses to a single row.
- **Arena deck sorting**: Cards in cost columns now sort by cost, then aspect color order, then alphabetically (instead of just alphabetical).
- **Mobile portrait mode**: Mobile is simply not wide enough to support the full arena view layout. Instead, we are disabling Arena mode in portrait and encouraging you to use your phone in landscape mode for Arena, or use the deckbuilder's other modes in portrait.
- **Error pages**: Nice little easter egg in the error pages for anyone old enough to remember Twitter's failwhale.
- **Casual set picker**: Beta sets now appear inline with released sets. Set buttons glow in their primary color on hover.

### 📦 Pack Generation
- **Foil rarity weights**: Fixed foil slot weights to match actual belt output. Special rarity foils in sets 4-6 now correctly appear at the same rate as Rare foils.
- **Hyperfoil tracking**: Fixed hyperfoil cards being tracked as regular foils instead of hyperspace foils.
- **Slot type accuracy**: Sealed packs now use position-based slot types for tracking, so uncommon-to-rare upgrades don't inflate rare slot statistics.

### 📊 Stats & Quality
- **Slot composition test**: New structural metric validates each pack has exactly 1 Leader, 1 Base, 9 Commons, 3 Uncommons, 1 Rare/Legendary, 1 Foil
- **Stats date filter**: Fixed stats to exclude data before position-based tracking was deployed, ensuring accurate structural metrics

### 🔧 Maintenance
- Stats page: Removed Code Quality tab, renamed QA tab to Overall
- Added QA tests for legendary rate, hyperfoil rate, and showcase leader rate (185 total QA tests)
- Documentation cleanup: organized plans vs. completed docs, removed stale files, updated indexes
- Removed unused debug scripts

## 02.11.2026

### 🎉 New Features
- **Casual Formats (Beta)**: New alternative limited formats for beta testers! Includes Chaos Draft, Rotisserie Draft, Pack Wars, and Pack Blitz. More details coming as each mode is implemented.

### 🎁 Patreon
- Some of you have asked about how to support Protect the Pod and I want be clear that the site is free to use. That being said, it does cost me a bit of money every month to host, as well as tokens to develop, so I certainly won't say no to help offsetting the cost! You can support Protect the Pod via [Patreon](https://patreon.com/ProtectthePod) with my thanks!
- We also have an about page now with shoutouts to my teammates.

### 🐞 Bug Fixes
- **Arena view filters**: Fixed a bug where filters were not being applied correctly

## 02.10.2026

### 🎨 UI Improvements
- **Arena view**: Lots of tweaks, optimizations, and style fixes
- **Deck image export**: Reduced image size for Discord upload compatibility

### 💽 Data
- Major improvements to hyperspace collation that should make packs more realistic.
- A few things to prepare for A Lawless Time!

## 02.07.2026

### 🎉 New Features
- **Arena View**: Magic Arena fans rejoice. New deckbuilder layout for desktop with split-screen pool/deck, aspect filters, and cost-column organization inspired by everyone's favorite online limited deckbuilder. Thanks to Eric Hunter for the idea.
- **Pool Image Export**: When viewing a deck image, click "Show Pool" to generate a full pool image showing your deck, other leaders, rare bases, and remaining pool cards. Great for sharing your sealed pool with friends.

## 02.06.2026
### 💽 Data
- Tracking pack generation data for a near-term feature related to quality control

### 🎨 UI Improvements
- Some increased consistency in UI elements around the site
- Stats page: Renamed tabs to "Code Quality" and "Pack Quality" for clarity
- Stats page: All numbers now display with comma formatting (1,234 instead of 1234)

### 🐞 Bug Fixes
- Fixed Discord login button on Play page not working when logged out

## 02.04.2026

### 🐞 Bug Fixes
- Fixed user menu dropdown flickering and failing to load recent pools/drafts
- Fixed showcase collection attribution so your pulled showcases properly appear in your collection

## 02.01.2026

### 📦 Pack Generation
- **Incorporated results from data collection efforts**: Thanks to the Discord community for their contributions, we now fill the common slots in booster packs in a way much more closely resembling physical packs.
- **Improved belt refill**: Updated the way belts refill themselves from printer sheets to ensure constraints across the "seams". End result is 100% compliance with collation rules such as distance between duplicates and aspect diversity.

### 🔧 Maintenance
- Added comprehensive QA tests for seam-aware belt behavior
- Documentation audit: Improved documentation for code generation agents

### 🤖 AI Players
- Added list of most powerful cards in the SEC limited format based on great videos by wooooo and Thorkk. Drafting bots will favor these powerful cards in their aspects.

- ## 01.31.2026

### 🎉 New Features
- **Easter egg**: If you can find it...

## 01.30.2026

### 🎉 New Features
- Fancy pack opening animation that makes the app look like it's professional 😉
- Mon Mothma ignores aspect penalty on Officials. Hera Syndulla (SOR) ignores aspect penalties on Spectres. Will have to consider how to handle optional aspect penalty ignoring leaders like Anakin Skywalker (LOF) and Hera Syndulla (LAW).

### 🎨 UI Improvements
- Mobile: Overhauled pack opening with carousel layout and cards that fit on screen
- Mobile: Deckbuilder redesigned with full-width blocks and streamlined controls
- Pack opening animation now skippable at request of Teddy

### 💽 Data Changes
- Hyperspace Foil variants now properly appear in booster packs at ~1/50 rate
- Improved variant downgrade for deck exports (foil/hyperspace cards correctly map to base versions)
- Not pleased with data quality I was getting from third party sources, so I made my own api that directly sources starwarsunlimited.com, launched that too, and am consuming it here now. This should also help with adding LAW as soon as possible.

### 🐞 Bug Fixes
- Fixed missing aspect penalty on mobile
- Fixes to a number of bugs related to users who are not logged in
- More reliably save deck state during deckbuilder if you leave the page or refresh
- Fix deck image export on Chrome
- Fix bug that sometimes made a deck appear empty

### 🔧 Maintenance
- Added robust variant downgrade utility with full test coverage
- Fixed flaky statistical tests in belt system

## 01.29.2026
Great news, with this update, I'm excited to announce the migration to Railway.app as our new hosting platform. This move enables a shift to a lightning-fast, robust realtime architecture based on socket.io, ensuring more reliable multiplayer experiences.

We've also revamped the deckbuilder based on some community feedback, making it more intuitive and consistent across Sealed and Draft modes.

After a few more UI updates, the next focus area will be data quality and improving pack generation even further.

Additionally, we've got a Discord now: [https://discord.gg/u6fkdDzWqF](https://discord.gg/u6fkdDzWqF). Join to find games and give feedback on the app. See you there!

### 🦾 Infrastructure
- Brand new hosting on Railway.app
- Robust socket.io-based realtime architecture

### 🎨 UI Features
- Brand new deckbuilder design that is consistent between Sealed and Draft modes and better reflects how players construct limited decks.
- Fancier deck images
- Maintenance mode, 404, and 500 error pages using failpurrgils

## 01.28.2026

### 🎉 New Features
- Release notes display on landing page (lol)

### 🦾 Infrastructure
- Improved draft reliability with new real-time event-based architecture

### 🐞 Bug Fixes
- Fixed player circle positioning on mobile devices
- Fixed leader card clipping in sealed pools on mobile
- Removed hover effects on touch devices for opponent leaders
- Improved support for smaller desktop displays
- Fixed mobile layout flex-direction causing off-center player circle

---

## 01.14.2026 - Initial Release

### 🎉 New Features
- Sealed pool generation with proper booster pack simulation
- Draft pod creation and management with 2-8 players
- Leader draft phase with 3-round drafting
- Pack draft phase with dynamic pass-left/pass-right rotation
- Bot players with random drafting behavior
- Real-time multiplayer synchronization
- Discord authentication and user accounts
- Draft and sealed pool history
- Comprehensive deck builder
- Mobile-responsive design

### 📦 Pack Generation
- Accurate booster pack simulation for all 6 sets
- 4,973 cards from SOR, SHD, TWI, JTL, LOF, SEC
- Proper rarity distribution including foils, hyperspace, and showcase variants
- Statistical QA validation (100 packs per set)

### 🎨 UI Features
- Card preview on hover
- Timer panels with pause/resume
- Player status indicators
- Aspect-based card coloring
- Multiple deck builder view modes

---

## How to Update Release Notes

1. Add new date section at the top (above the previous date)
2. Use US date format (MM.DD.YYYY)
3. Use emoji categories:
   - 🎉 New Features
   - 🐞 Bug Fixes
   - 🎨 UI Improvements
   - ⚡ Performance
   - 🦾 Infrastructure
   - 🔒 Security
   - 📝 Documentation
   - 🔧 Maintenance
   - 📦 Pack Changes
   - 💽 Data Changes
   - 🤖 AI Players
4. Keep entries concise and user-friendly

Run `node scripts/postbuild.js` to update the release notes on website.
