import { BUILDINGS, UPGRADES } from '../data/gameData';

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

