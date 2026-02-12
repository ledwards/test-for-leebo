# Release Notes

## 02.11.2026

### 🦾 Testing
- If this works we should see this posted to the test channel for release notes on push.

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

---

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
