import { ACHIEVEMENTS } from "./achievements";
import { BUILDINGS } from "./buildings";
import { UPGRADES } from "./upgrades";

/**
 * @typedef {Object} AchievementState
 * @property {boolean} unlocked - Whether this achievement has been unlocked
 * @property {number|null} unlockedAt - Timestamp (ms) when unlocked, or null if not yet
 * @property {number} progress - Current numeric progress toward the goal
 */

/**
 * @typedef {Object} GameState
 * @property {number} gold - Current amount of gold
 * @property {number} gps - Current gold-per-second production rate
 * @property {number} clickPower - Gold earned per manual click
 * @property {number} globalMultiplier - Multiplier applied to all building output
 * @property {number} prestigePoints - Accumulated prestige points across resets
 * @property {number} prestigeMultiplier - Bonus multiplier derived from prestige points
 * @property {Object.<string, number>} owned - Map of building ID to owned count
 * @property {Object.<string, number>} buildingCycleProgress - Map of building ID to cycle progress in milliseconds
 * @property {Object.<string, boolean>} upgrades - Map of upgrade ID to purchased state
 * @property {Object.<string, AchievementState>} achievementData - Per-achievement runtime data
 * @property {number} lastUpdate - Timestamp (ms) of the last game tick
 */

/**
 * Creates a fresh achievement data map with all achievements set to locked and zero progress.
 * Used when starting a new game or merging saved data with newly added achievements.
 *
 * @returns {Object.<string, AchievementState>} Initial achievement state keyed by achievement ID
 * @example
 * const achievementData = getInitialAchievementData();
 * // { firstGold: { unlocked: false, unlockedAt: null, progress: 0 }, ... }
 */
export const getInitialAchievementData = () =>
  Object.keys(ACHIEVEMENTS).reduce((acc, key) => ({
    ...acc,
    [key]: {
      unlocked: false,
      unlockedAt: null,
      progress: 0
    }
  }), {});

/**
 * Creates a fresh owned-buildings map with all buildings set to zero.
 * Ensures every building key exists even if the save file predates new buildings.
 *
 * @returns {Object.<string, number>} Map of building ID to owned count (all zero)
 * @example
 * const owned = getInitialOwned();
 * // { miner: 0, drill: 0, factory: 0 }
 */
export const getInitialOwned = () => 
  Object.keys(BUILDINGS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

/**
 * Creates a fresh map for per-building cycle progress.
 * Each value stores elapsed milliseconds in the current cycle,
 * allowing partial progress to persist across saves and offline time.
 *
 * @returns {Object.<string, number>} Map of building ID to cycle progress in ms
 * @example
 * const progress = getInitialBuildingCycleProgress();
 * // { miner: 0, drill: 0, factory: 0 }
 */
export const getInitialBuildingCycleProgress = () =>
  Object.keys(BUILDINGS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

/**
 * Creates a fresh upgrades-purchased map with all upgrades set to false.
 * Ensures every upgrade key exists even if the save file predates new upgrades.
 *
 * @returns {Object.<string, boolean>} Map of upgrade ID to purchased state (all false)
 * @example
 * const upgrades = getInitialUpgrades();
 * // { sharp_pickaxe: false, miner_motivation: false, cosmic_energy: false }
 */
export const getInitialUpgrades = () => 
  Object.keys(UPGRADES).reduce((acc, key) => ({ ...acc, [key]: false }), {});

/**
 * Creates a complete default game state object.
 * Always returns a new object instance — safe to use as the starting point
 * for a fresh game or as the base when applying a saved game over it.
 *
 * @returns {GameState} A fresh game state with all values reset to defaults
 * @example
 * const state = getNewGameState();
 * state.gold; // 0
 * state.prestigePoints; // 0
 */
export const getNewGameState = () => ({
  gold: 0,
  gps: 0,
  clickPower: 10,
  globalMultiplier: 1,
  prestigePoints: 0,
  prestigeMultiplier: 1,
  owned: getInitialOwned(),
  buildingCycleProgress: getInitialBuildingCycleProgress(),
  upgrades: getInitialUpgrades(),
  achievementData: getInitialAchievementData(),
  lastUpdate: Date.now()
});