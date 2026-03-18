# 🎮 Idle Core Engine

A modern, feature-rich idle/clicker game engine built with **React + Vite**. Perfect for creating incremental games with beautiful UI, achievement systems, and persistent saves.

## ✨ Features

### 🎯 Core Gameplay
- **Passive Income System** - Earn gold per second from buildings
- **Buildings & Upgrades** - Expandable progression system with cost scaling
- **Prestige System** - Reset and rebirth mechanics with permanent bonuses
- **Achievement System** - Unlock achievements with custom rewards
- **Offline Earnings** - Continue earning while game is closed

### 💾 Save Management
- **Encrypted Saves** - Protect game state from tampering
- **Auto-Backups** - Automatic backup every 5 minutes (max 5 backups)
- **File Import/Export** - Download saves as `.dat` files or restore from backups
- **DEV_MODE** - Unencrypted JSON saves for easy testing and scenario creation
- **Smart Validation** - Detects corrupted or tampered saves

### 🎨 User Experience
- **Multi-Language Support** - Polish, English, Spanish (easily extensible)
- **Toast Notification System** - Non-intrusive notifications with multiple positions and skins
- **Confirmation Modals** - Beautiful Bootstrap modals for critical actions
- **Game Logs** - Persistent in-game log of important events
- **Responsive Design** - Bootstrap 5 based, mobile-friendly UI

### 🔐 Security & Dev Tools
- **AES Encryption** - crypto-js powered save encryption
- **Development Mode** - Toggle unencrypted saves for testing
- **Anti-Cheat Validation** - Basic state validation on load
- **Environment Configuration** - Secure seed-based encryption

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/IdleCoreEngine.git
cd IdleCoreEngine

# Install dependencies
npm install

```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure variables:

```env
# Enable/disable development mode (no encryption, readable JSON saves)
VITE_DEV_MODE=false

# Encryption seed for save protection
# WARNING: Changing this breaks existing saves!
VITE_ENCRYPTION_SEED=idle-core-engine-default
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ProgressButton.jsx
│   ├── BuildingProgressBar.jsx
│   ├── AchievementsList.jsx
│   ├── Toast.jsx               # Universal toast notifications
│   ├── ToastContainer.jsx
│   └── ConfirmModal.jsx        # Confirmation modals
├── config/
│   └── devConfig.js           # Dev mode & encryption config
├── context/
│   └── ToastContext.jsx       # Global toast state
├── data/                       # Game data definitions
│   ├── buildings.js
│   ├── upgrades.js
│   ├── achievements.js
│   └── gameData.js
├── hooks/
│   └── useToast.js            # Toast hook
├── locales/                    # Internationalization
│   ├── pl.js                   # Polish
│   ├── en.js                   # English
│   └── es.js                   # Spanish
├── logic/
│   └── gameLogic.js           # Core game calculations
├── utils/
│   ├── encryption.js          # Save encryption/decryption
│   ├── saveManager.js         # localStorage management
│   └── fileHandler.js         # File import/export
├── App.jsx                     # Main app component
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

## 🎮 Game Systems

### Buildings
Passive income generators with exponential cost scaling. Each building generates gold per second.

**Data Location:** `src/data/buildings.js`

Example:
```javascript
export const buildings = {
  'clicker': {
    name: 'Clicker',
    desc: 'A button that produces gold',
    icon: 'Mouse',
    baseCost: 10,
    baseGPS: 0.1
  }
};
```

### Upgrades
Permanent multipliers and bonuses. Can affect buildings, GPS, or prestige gains.

**Data Location:** `src/data/upgrades.js`

### Achievements
Unlock bonuses by reaching specific milestones. Grants permanent gold, GPS, or prestige multipliers.

**Data Location:** `src/data/achievements.js`

### Prestige System
Reset progress to earn prestige points, granting permanent multipliers for future runs.

**Implementation:** `src/logic/gameLogic.js` - `calculatePrestigeGain()`, `handlePrestige()`

## 💾 Save System

### How It Works

1. **Auto-Save** - Game state saved every 5 seconds to localStorage
2. **Auto-Backup** - Backup created every 5 minutes (max 5 stored)
3. **Encryption** - Saves encrypted with AES when `DEV_MODE=false`
4. **Validation** - Loaded saves are validated for integrity

### Save File Structure

```javascript
{
  "version": 1,                    // Save format version
  "timestamp": 1234567890,
  "devMode": false,
  "data": "U2FsdGVkX1..."         // Encrypted state or plain JSON
}
```

### Import/Export

Users can:
- Download save file for backup/sharing
- Upload save file to restore progress
- Restore from auto-backups created during gameplay

**Location in UI:** Saves view (button in navbar)

### Development Mode

When `VITE_DEV_MODE=true`:
- Saves stored as plain JSON
- Easy to edit saves manually for testing
- Perfect for scenario creation and bug testing
- Warnings displayed to user

⚠️ **Note:** Saves created in DEV_MODE cannot be loaded in production mode and vice versa.

## 🌐 Internationalization

Support for multiple languages. Add new language by:

1. Create `src/locales/[lang].js`
2. Export translations object matching existing structure
3. Update language selector in `App.jsx`

Current languages:
- 🇵🇱 Polish (pl)
- 🇬🇧 English (en)
- 🇪🇸 Spanish (es)

## 📢 Toast Notifications

Universal toast system for all notifications:

```javascript
const { showToast } = useToast();

showToast({
  type: 'success',           // success, error, warning, info, achievement
  title: 'Achievement!',
  message: 'You did it!',
  position: 'top-right',     // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
  duration: 4000,            // ms (0 = no auto-hide)
  addToLog: true             // Also add to game logs
});
```

### Available Skins
- `achievement` - Golden, trophy icon
- `success` - Green, checkmark icon
- `error` - Red, alert icon
- `warning` - Yellow, warning icon
- `info` - Blue, info icon

Easily extensible - add new skins in `Toast.jsx` skinConfig.

## 🔐 Security Notes

### Encryption
- Uses **crypto-js AES encryption**
- Seed-based (not cryptographically secure for real security)
- Main purpose: prevent casual tampering
- **Not suitable for:** Anti-cheat in multiplayer games

### Best Practices
- Change `VITE_ENCRYPTION_SEED` only if you plan migration
- Keep `.env.local` out of version control
- Validate save data on load (already implemented)
- Never hardcode secrets in source

## 📦 Dependencies

### Core
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Bootstrap 5** - CSS framework
- **lucide-react** - Icon library

### Game State
- **crypto-js** - Encryption for saves

## 🛠️ Development

### Adding a New Building

1. Add to `src/data/buildings.js`
2. Add icon import from lucide-react in `App.jsx`
3. Test cost scaling and GPS calculation
4. Create related upgrade/achievement if needed

### Adding a New Achievement

1. Define in `src/data/achievements.js`
2. Add check in `checkAchievements()` in `src/logic/gameLogic.js`
3. Add translations to all language files
4. Test toast notification appearance

### Adding a New Language

1. Create `src/locales/[code].js`
2. Match all keys from existing language files
3. Update language selector
4. Test all views with new language

## 📊 Game Balance

Key constants in `src/logic/gameLogic.js`:
- **Cost Scaling:** Exponential (1.15x per owned)
- **Prestige Threshold:** 1e7 gold
- **Achievement Rewards:** Configurable per achievement

Adjust these values for your game's difficulty/progression.

## 🐛 Debugging

### Enable DEV_MODE
```env
VITE_DEV_MODE=true
```

Then:
- Edit saves manually as JSON
- See unencrypted localStorage in DevTools
- No validation warnings
- Easy scenario testing

### Check Logs
In-game logs (bottom left) show all important events:
- Achievements unlocked
- Save events
- Offline earnings
- Errors

### Browser DevTools
- **Application > Storage > Local Storage** - View raw save data
- **Console** - Game errors and warnings
- **Network** - Build performance

## 📈 Performance Tips

- Game tick runs every 50ms (good for 60fps)
- Achievement checks every 1000ms
- Auto-save every 5000ms
- Backups every 5 minutes

For larger games:
- Consider debouncing achievement checks
- Optimize recalculations (memoize if needed)
- Profile with React DevTools

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

Areas for improvement:
- More achievements
- New building types
- Additional prestige mechanics
- More language support
- UI/UX enhancements

## 📝 License

MIT

## 🙏 Credits

Built with:
- React & Vite 
- Bootstrap components
- lucide-react icons
- crypto-js library
- Discussions with LLM

---

**Ready to create your idle game?** Start by editing `src/data/buildings.js` and `src/config/devConfig.js` to match your vision! 🚀
