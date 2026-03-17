import { BUILDINGS } from "../data/buildings";
import { UPGRADES } from "../data/upgrades";
import { ACHIEVEMENTS } from "../data/achievements";

/**
 * Calculates the total gold-per-second (GPS) production for the current game state.
 * For each building, the base rate is multiplied by the owned count, then further
 * scaled by any applicable building-specific upgrades. Finally, the summed rate is
 * multiplied by both the global upgrade multiplier and the prestige multiplier.
 *
 * @param {import('../data/gameData').GameState} data - Current game state
 * @returns {number} Total GPS value (may be 0 if no buildings are owned)
 * @example
 * const gps = calculateCurrentGPS(gameData.current);
 * gameData.current.gold += gps * deltaTimeSeconds;
 */
export const calculateCurrentGPS = (data) => {
  let totalGPS = 0;
  Object.keys(BUILDINGS).forEach(id => {
    let rate = BUILDINGS[id].baseRate * data.owned[id];
    // Apply building-specific upgrade multipliers
    Object.values(UPGRADES).forEach(upg => {
      if (data.upgrades[upg.id] && upg.targets?.includes(id)) rate *= upg.multiplier;
    });
    totalGPS += rate;
  });
  // Apply global and prestige multipliers on top of the summed building output
  return totalGPS * (data.globalMultiplier || 1) * (data.prestigeMultiplier || 1);
};

/**
 * Calculates the gold cost to purchase the next unit of a given building.
 * Uses an exponential scaling formula: cost = baseCost × 1.15^N,
 * where N is the number of units already owned.
 *
 * @param {string} id - Building identifier (key in BUILDINGS)
 * @param {number} ownedCount - Number of this building already owned
 * @returns {number} Floored gold cost for the next purchase
 * @throws {TypeError} If `id` does not correspond to a defined building
 * @example
 * const cost = getBuildingCost('miner', 5);
 * // Math.floor(15 * 1.15^5) = 30
 */
export const getBuildingCost = (id, ownedCount) => {
  return Math.floor(BUILDINGS[id].baseCost * Math.pow(1.15, ownedCount));
};

/**
 * Calculates prestige points that would be gained by resetting with the given gold amount.
 * Prestige is only available above a minimum gold threshold (1,000,000).
 * Formula: floor(sqrt(currentGold / 10000))
 *
 * @param {number} currentGold - Current accumulated gold before the reset
 * @returns {number} Number of prestige points earned; 0 if below the threshold
 * @example
 * calculatePrestigeGain(1000000); // floor(sqrt(100)) = 10
 * calculatePrestigeGain(500000);  // 0 — below the 1M threshold
 */
export const calculatePrestigeGain = (currentGold) => {
  if (currentGold < 1000000) return 0; // Minimum gold threshold for prestige
  return Math.floor(Math.sqrt(currentGold / 10000));
};

/**
 * Scans all achievements and unlocks any whose condition is newly satisfied.
 * Also updates the numeric progress for every achievement on each call.
 * Mutates `data.achievementData` in place.
 *
 * @param {import('../data/gameData').GameState} data - Current game state (mutated)
 * @returns {string[]} Array of achievement IDs that were unlocked during this call
 * @example
 * const newAchievements = checkAchievements(gameData.current);
 * newAchievements.forEach(id => applyAchievementReward(gameData.current, id));
 */
export const checkAchievements = (data) => {
  const newUnlocked = [];

  Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
    const isAlreadyUnlocked = data.achievementData[id]?.unlocked;

    if (!isAlreadyUnlocked && achievement.condition(data)) {
      newUnlocked.push(id);
      data.achievementData[id].unlocked = true;
      data.achievementData[id].unlockedAt = Date.now();
    }

    // Update progress even for already-unlocked achievements
    if (achievement.progress) {
      data.achievementData[id].progress = Math.min(
        achievement.progress(data),
        achievement.progressMax
      );
    }
  });

  return newUnlocked;
};

/**
 * Applies the reward defined for an achievement to the current game state.
 * A multiplier reward increases `globalMultiplier`; a gold reward adds flat gold.
 * Safe to call with an ID that has no reward — does nothing in that case.
 * Mutates `data` in place.
 *
 * @param {import('../data/gameData').GameState} data - Current game state (mutated)
 * @param {string} achievementId - ID of the achievement whose reward should be applied
 * @example
 * applyAchievementReward(gameData.current, 'firstGold');
 * // gameData.current.globalMultiplier is now multiplied by 1.05
 */
export const applyAchievementReward = (data, achievementId) => {
  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement?.reward) return;

  if (achievement.reward.multiplier) {
    data.globalMultiplier = (data.globalMultiplier || 1) * achievement.reward.multiplier;
  }
  if (achievement.reward.gold) {
    data.gold += achievement.reward.gold;
  }
};

