import { BUILDINGS } from "../data/buildings";
import { UPGRADES } from "../data/upgrades";
import { ACHIEVEMENTS } from "../data/achievements";

export const calculateCurrentGPS = (data) => {
  let totalGPS = 0;
  Object.keys(BUILDINGS).forEach(id => {
    let rate = BUILDINGS[id].baseRate * data.owned[id];
    Object.values(UPGRADES).forEach(upg => {
      if (data.upgrades[upg.id] && upg.targets?.includes(id)) rate *= upg.multiplier;
    });
    totalGPS += rate;
  });
  return totalGPS * (data.globalMultiplier || 1) * (data.prestigeMultiplier || 1);
};

// cost = base * 1.15^N
export const getBuildingCost = (id, ownedCount) => {
  return Math.floor(BUILDINGS[id].baseCost * Math.pow(1.15, ownedCount));
};

// Funkcja obliczająca, ile punktów dostaniemy za reset
// Wzór: pierwiastek ze zgromadzonego złota (przykładowo)
export const calculatePrestigeGain = (currentGold) => {
  if (currentGold < 1000000) return 0; // Próg wejścia: 1M złota
  return Math.floor(Math.sqrt(currentGold / 10000));
};

/**
 * Sprawdza wszystkie achievementy i zwraca listę nowych odblokowanych
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

    // Aktualizuj progress (nawet jeśli osiągnięty)
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
 * Aplikuje nagrodę za osiągnięcie
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

