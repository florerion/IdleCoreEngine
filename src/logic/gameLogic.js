import { BUILDINGS } from "../data/buildings";
import { UPGRADES } from "../data/upgrades";
import { ACHIEVEMENTS } from "../data/achievements";

export const MIN_BUILDING_CYCLE_MS = 10;

const assertBuildingExists = (buildingId) => {
  if (!BUILDINGS[buildingId]) {
    throw new TypeError(`Unknown building id: ${buildingId}`);
  }
};

const shouldApplyUpgradeToBuilding = (upgrade, buildingId) => {
  if (upgrade.type === 'global') return true;
  if (upgrade.type === 'building') return upgrade.targets?.includes(buildingId);
  return false;
};

/**
 * Calculates effective cycle duration for a building.
 * Supports developer-defined upgrade effects using additive and multiplicative modes.
 * Applies a hard lower bound via MIN_BUILDING_CYCLE_MS.
 *
 * @param {string} buildingId - Building identifier (key in BUILDINGS)
 * @param {import('../data/gameData').GameState} data - Current game state
 * @returns {number} Effective cycle duration in milliseconds
 * @throws {TypeError} If the building ID is invalid or cycle effect mode is unsupported
 * @example
 * const cycleMs = getBuildingCycleTimeMs('factory', gameData.current);
 * // 10000 by default, or lower/higher if upgrades define cycleTimeEffect
 */
export const getBuildingCycleTimeMs = (buildingId, data) => {
  assertBuildingExists(buildingId);

  let effectiveCycleTime = BUILDINGS[buildingId].cycleTime;

  if (!Number.isFinite(effectiveCycleTime) || effectiveCycleTime <= 0) {
    throw new TypeError(`Invalid base cycleTime for building: ${buildingId}`);
  }

  Object.values(UPGRADES).forEach((upgrade) => {
    if (!data.upgrades[upgrade.id]) return;
    if (!shouldApplyUpgradeToBuilding(upgrade, buildingId)) return;

    const effect = upgrade.cycleTimeEffect;
    if (!effect) return;

    if (effect.mode === 'additive') {
      effectiveCycleTime += effect.value;
      return;
    }

    if (effect.mode === 'multiplicative') {
      effectiveCycleTime *= effect.value;
      return;
    }

    throw new TypeError(
      `Invalid cycleTimeEffect mode for upgrade ${upgrade.id}: ${effect.mode}`
    );
  });

  return Math.max(MIN_BUILDING_CYCLE_MS, effectiveCycleTime);
};

/**
 * Calculates effective per-second production of one building type.
 * Includes owned count, building-specific upgrades, global multiplier, and prestige multiplier.
 *
 * @param {string} buildingId - Building identifier (key in BUILDINGS)
 * @param {import('../data/gameData').GameState} data - Current game state
 * @returns {number} Effective per-second production for the building type
 * @throws {TypeError} If `buildingId` does not correspond to a defined building
 * @example
 * const rate = getBuildingRatePerSecond('miner', gameData.current);
 * // e.g. 12.5
 */
export const getBuildingRatePerSecond = (buildingId, data) => {
  assertBuildingExists(buildingId);

  const ownedCount = data.owned[buildingId] || 0;
  let rate = BUILDINGS[buildingId].baseRate * ownedCount;

  Object.values(UPGRADES).forEach((upgrade) => {
    if (!data.upgrades[upgrade.id]) return;

    if (
      upgrade.type === 'building' &&
      upgrade.targets?.includes(buildingId) &&
      Number.isFinite(upgrade.multiplier)
    ) {
      rate *= upgrade.multiplier;
    }
  });

  return rate * (data.globalMultiplier || 1) * (data.prestigeMultiplier || 1);
};

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
  Object.keys(BUILDINGS).forEach((buildingId) => {
    totalGPS += getBuildingRatePerSecond(buildingId, data);
  });

  return totalGPS;
};

/**
 * Advances production cycles for all owned buildings and applies completed payouts.
 * Cycle progress is tracked per building in `data.buildingCycleProgress`, so partial
 * progress survives both active play and offline time calculations.
 * Also updates `buildingLastPayoutTime` when payouts occur for smooth progress rendering.
 *
 * @param {import('../data/gameData').GameState} data - Current game state (mutated)
 * @param {number} elapsedMs - Elapsed real time in milliseconds to process
 * @returns {{earnedGold: number, cycleCompletions: Object.<string, number>}} Earned gold and completed cycles per building
 * @throws {RangeError} If elapsedMs is negative or not finite
 * @example
 * const { earnedGold } = processProductionCycles(gameData.current, 5000);
 * console.log('Gold gained:', earnedGold);
 */
export const processProductionCycles = (data, elapsedMs) => {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError('elapsedMs must be a finite non-negative number');
  }

  if (!data.buildingCycleProgress || typeof data.buildingCycleProgress !== 'object') {
    data.buildingCycleProgress = {};
  }

  let earnedGold = 0;
  const cycleCompletions = {};

  Object.keys(BUILDINGS).forEach((buildingId) => {
    const ownedCount = data.owned[buildingId] || 0;

    if (ownedCount <= 0) {
      data.buildingCycleProgress[buildingId] = 0;
      return;
    }

    const cycleTimeMs = getBuildingCycleTimeMs(buildingId, data);
    const ratePerSecond = getBuildingRatePerSecond(buildingId, data);
    const currentProgressMs = data.buildingCycleProgress[buildingId] || 0;
    const progressedMs = currentProgressMs + elapsedMs;
    const completedCycles = Math.floor(progressedMs / cycleTimeMs);
    const nextProgressMs = progressedMs % cycleTimeMs;

    if (completedCycles > 0 && ratePerSecond > 0) {
      const payoutPerCycle = ratePerSecond * (cycleTimeMs / 1000);
      const payout = completedCycles * payoutPerCycle;
      data.gold += payout;
      earnedGold += payout;
      cycleCompletions[buildingId] = completedCycles;
    }

    data.buildingCycleProgress[buildingId] = nextProgressMs;
  });

  return { earnedGold, cycleCompletions };
};

/**
 * Gets the interpolated progress percentage (0-100) for a building's current production cycle.
 * Smoothly interpolates between game ticks by adding elapsed time since the last tick.
 *
 * @param {string} buildingId - Building identifier (key in BUILDINGS)
 * @param {import('../data/gameData').GameState} data - Current game state
 * @param {number} elapsedSinceLastTickMs - Milliseconds elapsed since the last game tick (0 to ~17ms in 60fps)
 * @returns {number} Interpolated progress percentage (0-100, capped at 100)
 * @throws {TypeError} If the building ID is invalid
 * @example
 * const elapsedMs = Date.now() - lastTickTime;
 * const progress = getBuildingProgressPercent('factory', gameData.current, elapsedMs);
 * // Returns 45.3 (smooth interpolated value between ticks)
 */
export const getBuildingProgressPercent = (buildingId, data, elapsedSinceLastTickMs = 0) => {
  assertBuildingExists(buildingId);

  const ownedCount = data.owned[buildingId] || 0;
  if (ownedCount <= 0) return 0;

  const cycleTimeMs = getBuildingCycleTimeMs(buildingId, data);
  const currentProgressMs = (data.buildingCycleProgress[buildingId] || 0) + elapsedSinceLastTickMs;
  const progressPercent = (currentProgressMs / cycleTimeMs) * 100;

  return Math.min(100, progressPercent);
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
  assertBuildingExists(id);
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

