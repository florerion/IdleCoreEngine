# IdleCoreEngine - AI Agent Instructions

A React + Vite-based idle/clicker game engine with encryption, achievements, and persistent saves. This document provides guidance for AI agents and developers to maintain consistency and productivity.

## 🎯 Architecture Overview

**Project Type**: Modern React SPA with game state management
**Key Framework**: React 19 + Vite with Bootstrap 5 UI

### Core Systems

1. **Data-Driven Design** — Game content (buildings, upgrades, achievements) defined in `src/data/`
2. **Game Logic** — Pure functions in `src/logic/gameLogic.js` (calculations, validations)
3. **Save System** — Encrypted saves with auto-backups in `src/utils/`
4. **Toast Notifications** — Context-based system in `src/context/` and `src/components/`
5. **Multi-Language** — Translations in `src/locales/` (pl, en, es)

## 📦 Scripts & Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Production build (output: dist/)
npm run preview    # Preview production build
npm run lint       # Check code with ESLint
```

**Dev Mode**: Set `VITE_DEV_MODE=true` in `.env.local` for unencrypted JSON saves (testing only)

## 📁 Directory Structure & Responsibilities

| Path | Purpose |
|------|---------|
| `src/components/` | React UI components (buttons, modals, toasts, progress bars) |
| `src/data/` | Game content definitions (buildings.js, upgrades.js, achievements.js, gameData.js type defs) |
| `src/logic/` | Pure game calculation functions (GPS, costs, prestige, achievements) |
| `src/utils/` | Utility modules (saveManager.js, encryption.js, fileHandler.js) |
| `src/config/` | Configuration (devConfig.js for encryption seeds, backup limits, save version) |
| `src/context/` | React Context (ToastContext.jsx for global notifications) |
| `src/hooks/` | Custom React hooks (useToast.js) |
| `src/locales/` | Translation objects (pl.js, en.js, es.js) |

## 🎮 Key Files & Their Roles

### Game Data (`src/data/gameData.js`)
- **Exports**: `getNewGameState()`, `getInitialOwned()`, `getInitialUpgrades()`, `getInitialAchievementData()`
- **JSDoc Types**: `GameState`, `AchievementState` — Always refer to these when working with state
- **Purpose**: Single source of truth for game state structure and initial values

### Game Logic (`src/logic/gameLogic.js`)
- **Key Functions**:
  - `calculateCurrentGPS(data)` — Total gold/sec production (pure, no side effects)
  - `getBuildingCost(id, ownedCount)` — Exponential cost calculation: `baseCost × 1.15^N`
  - `calculatePrestigeGain(data)` — Prestige calculation
  - `checkAchievements(data)` — Achievement unlock detection
- **Convention**: Functions are documented with @param, @returns, @example JSDoc

### Save & Encryption (`src/utils/`)
- `saveManager.js` — localStorage operations, auto-backups (every 10 min, max 5 stored)
- `encryption.js` — AES encryption (crypto-js), seed-based, supports legacy seeds
- **Config** (`src/config/devConfig.js`): `ENCRYPTION_SEED`, `DEV_MODE`, `SAVE_FORMAT_VERSION`
- **Warning**: Changing ENCRYPTION_SEED breaks existing saves; use LEGACY_SEEDS for migration

### Components
- **Toast System** — `ToastContainer.jsx` + `useToast()` hook (context-based, non-intrusive)
- **ConfirmModal** — Bootstrap modal for critical actions
- **ProgressButton** — Clickable income button with visual feedback
- **AchievementsList** — Achievement display and management
- **Logger** — In-game event log

## 🛠️ Code Style & Conventions

### JSDoc Standard
All exported functions and types use JSDoc. Always document:
- `@param {type} name - description`
- `@returns {type} description`
- `@example code snippet` (especially for complex functions)

Example:
```javascript
/**
 * Calculates total gold-per-second production.
 * @param {import('../data/gameData').GameState} data - Current game state
 * @returns {number} Total GPS value
 * @example
 * const gps = calculateCurrentGPS(gameData.current);
 */
export const calculateCurrentGPS = (data) => {
  // ...
};
```

### Data Definitions
Game content uses consistent object structure in `src/data/`:
```javascript
export const BUILDINGS = {
  buildingId: {
    id: 'buildingId',
    name: 'Building Name',
    description: 'What it does',
    baseRate: 0.1,    // GPS or CPS
    baseCost: 10,
    maxLevel: null,   // null = unlimited
    icon: 'IconName'  // lucide-react icon name
  },
  // ...
};
```

### React Conventions
- Use **functional components** with hooks (React 19+)
- Use **React Context** for global state (toasts, language)
- Props drilling for local state is acceptable for simplicity
- Use **lucide-react** for icons

### Component Props & State Management
- Main game state in `App.jsx` via `useState` + `useRef`
- Toast notifications via `useToast()` hook (no prop drilling)
- Game state passed via props to children (conscious simplicity over Redux)

### ESLint Rules
- Rule: `no-unused-vars` ignores uppercase/underscore patterns (e.g., `TRANSLATIONS`, `_unused`)
- No import order enforcement; use logical grouping
- React Hook Linter active; follow React hook rules closely

## 🔧 Common Development Patterns

### Adding a New Building/Upgrade/Achievement

1. **Define in data file** (`src/data/buildings.js`, etc.)
   ```javascript
   export const BUILDINGS = {
     // ... existing
     newBuilding: {
       id: 'newBuilding',
       name: 'New Building',
       // ... required fields
     }
   };
   ```

2. **No component changes needed** — App.jsx iterates over BUILDINGS, UPGRADES, ACHIEVEMENTS

3. **If logic is needed** (new calculation type), add to `src/logic/gameLogic.js` with JSDoc

4. **Add translations** — Add key to all locale files (`src/locales/{pl,en,es}.js`)

5. **Test in DEV_MODE** — JSON saves are human-readable for scenario testing

### Creating a New Component
- Place in `src/components/`
- Export as default
- Use functional component with hooks
- If using toast: import `useToast` hook
- Document props with JSDoc comments

### Modifying Game State
- Always preserve the GameState shape (see `gameData.js` typedef)
- Use `mergeWithDefaults()` pattern when loading saves (in `App.jsx`)
- Validate state with `validateGameState()` from encryption.js

### Working with Locales
- All user-visible strings in `src/locales/{lang}.js`
- Import language object: `import { en } from './locales/en'`
- Access translations via object chaining: `TRANSLATIONS[language].buildingName`
- When adding new strings: add key to **all** three locale files

## ⚠️ Common Pitfalls & Tips

### Save System
- **New ENCRYPTION_SEED breaks saves** — Only change if you can handle migration (use LEGACY_SEEDS)
- **Auto-backups don't save every tick** — Respect AUTO_BACKUP_INTERVAL (10 min default)
- **DEV_MODE should be false in production** — Don't ship with DEV_MODE=true

### Achievement System
- Achievements tracked via `checkAchievements()` in game loop
- Progress field supports numeric goals (e.g., "own 1000 buildings")
- Unlocked timestamp helps prevent double-rewards

### Performance
- Game loop runs in `useEffect` with `requestAnimationFrame` (smooth 60 FPS target)
- No unnecessary re-renders — use `useRef` for state updates between renders
- GPS calculation is O(buildings × upgrades) — generally fine up to 100+ buildings

### React Hooks
- Must import and use `useToast()` hook correctly (from context setup)
- Don't create new React.Fragment unnecessarily — use implicit fragment syntax `<>`

## 🧪 Testing & Debugging

### Quick Scenario Testing
1. Set `VITE_DEV_MODE=true` in `.env.local`
2. Edit JSON saves directly in localStorage (DevTools → Application → Local Storage)
3. Reload; changes persist instantly
4. Use `npm run build` then `npm run preview` to test production build locally

### Common Debug Points
- Game loop state updates: check `useRef` assignments
- Achievement unlocks: inspect `checkAchievements()` conditions
- Save corruption: validate with `validateGameState()` in encryption.js
- Toast visibility: check `ToastContext` provider wrapping the app

## 📚 Dependencies & Tools

| Dependency | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| Bootstrap 5 | CSS framework |
| crypto-js | AES save encryption |
| lucide-react | Icon library |
| ESLint | Code linting |

## 🚀 Agent-Specific Guidance

When helping with code changes:
- **Always check type defs** in gameData.js before modifying state
- **Preserve JSDoc** on all exported functions
- **Test with `npm run lint`** before wrapping up
- **Use data-driven patterns** — add to data files, not hardcoded logic
- **Check locales** — if adding UI text, update all three language files
- **Respect file boundaries** — don't put game logic in components, save logic in utils, etc.

### Example Workflow for New Feature
1. **Define in data** (`src/data/`) if it's content
2. **Implement logic** in `src/logic/gameLogic.js` with full JSDoc
3. **Add UI** in components if needed, using `useToast()` for feedback
4. **Add translations** to all three locales
5. **Test**: `npm run lint` && `npm run dev`
6. **Production**: `npm run build` and verify with `npm run preview`

---

**Last Updated**: March 2026  
**Maintained By**: IdleCoreEngine Team  
**Version**: 1.0
