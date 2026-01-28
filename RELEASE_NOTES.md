# Release Notes

## v0.2.0 - TBD

### 🎉 New Features
- Release notes display on landing page
- Homepage logo now links to root URL for SEO

### 🐛 Bug Fixes
- Fixed player circle centering on mobile devices
- Fixed leader card clipping in sealed pools on mobile
- Removed hover effects on touch devices for opponent leaders
- Fixed mobile layout flex-direction causing off-center player circle

### 🎨 UI Improvements
- Bots no longer show as disconnected in player status

---

## v0.1.0 - Initial Release

### 🎉 New Features
- Sealed pool generation with proper booster pack simulation
- Draft pod creation and management with 2-8 players
- Leader draft phase with 3-round Rochester-style drafting
- Pack draft phase with dynamic pass-left/pass-right rotation
- Bot players with intelligent drafting behavior
- Real-time multiplayer synchronization
- Discord authentication and user accounts
- Draft and sealed pool history
- Comprehensive deck builder with drag-and-drop
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

1. Add new version section at the top (above the previous version)
2. Use semantic versioning (MAJOR.MINOR.PATCH)
3. Use emoji categories:
   - 🎉 New Features
   - 🐛 Bug Fixes
   - 🎨 UI Improvements
   - ⚡ Performance
   - 🔒 Security
   - 📝 Documentation
   - 🔧 Maintenance
   - 📦 Pack/Data Changes
4. Keep entries concise and user-friendly
5. Use format: `## vX.Y.Z - YYYY-MM-DD` or `## vX.Y.Z - TBD` for unreleased
6. After publishing, update TBD to actual date