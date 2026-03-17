/**
 * @typedef {Object} AchievementReward
 * @property {number} [multiplier] - Global production multiplier applied on unlock (e.g. 1.05 = +5%)
 * @property {number} [gold] - Flat gold bonus granted on unlock
 */

/**
 * @typedef {Object} AchievementDefinition
 * @property {string} id - Unique identifier of the achievement
 * @property {string} name - Display name of the achievement
 * @property {string} description - Description of the unlock condition
 * @property {string} icon - Icon component name from the lucide-react library
 * @property {function(Object): boolean} condition - Returns true when the achievement should unlock
 * @property {function(Object): number} progress - Returns current numeric progress toward the goal
 * @property {number} progressMax - Maximum value for the progress bar (100% = unlocked)
 * @property {AchievementReward} reward - Reward granted on first unlock
 */

/**
 * Registry of all achievements available in the game.
 * Achievements are checked periodically and unlock automatically when their
 * condition function returns true for the current game state.
 *
 * @type {Object.<string, AchievementDefinition>}
 * @example
 * import { ACHIEVEMENTS } from './data/achievements';
 * const isUnlocked = ACHIEVEMENTS.firstGold.condition(gameData); // true if gold >= 100
 */
export const ACHIEVEMENTS = {
  firstGold: {
    id: 'firstGold',
    name: 'Pierwsze kroki',
    description: 'Zarabiaj 100 złota',
    icon: 'Star',
    condition: (data) => data.gold >= 100,
    progress: (data) => data.gold,
    progressMax: 100,
    reward: { multiplier: 1.05 }
  },
  
  minerCollector: {
    id: 'minerCollector',
    name: 'Kolekcjoner górników',
    description: 'Posiadaj 5 górników',
    icon: 'Pickaxe',
    condition: (data) => data.owned.miner >= 5,
    progress: (data) => data.owned.miner,
    progressMax: 5,
    reward: { multiplier: 1.10 }
  },

  moneyMaker: {
    id: 'moneyMaker',
    name: 'Zarobek',
    description: 'Zarabiaj 10000 złota',
    icon: 'Coins',
    condition: (data) => data.gold >= 10000,
    progress: (data) => data.gold,
    progressMax: 10000,
    reward: { gold: 500 }
  },

  speedDemon: {
    id: 'speedDemon',
    name: 'Szybkie tempo',
    description: 'Osiągnij 50 GPS',
    icon: 'Zap',
    condition: (data) => data.gps >= 50,
    progress: (data) => data.gps || 0,
    progressMax: 50,
    reward: { multiplier: 1.15 }
  }
};