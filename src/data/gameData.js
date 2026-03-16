import { ACHIEVEMENTS } from "./achievements";
import { BUILDINGS } from "./buildings";
import { UPGRADES } from "./upgrades";

export const getInitialAchievementData = () =>
  Object.keys(ACHIEVEMENTS).reduce((acc, key) => ({
    ...acc,
    [key]: {
      unlocked: false,
      unlockedAt: null,
      progress: 0
    }
  }), {});

// Funkcje generujące "czyste" mapy posiadania
export const getInitialOwned = () => 
  Object.keys(BUILDINGS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

export const getInitialUpgrades = () => 
  Object.keys(UPGRADES).reduce((acc, key) => ({ ...acc, [key]: false }), {});

// Wzorzec stanu (używamy funkcji, by za każdym razem dostać nowy obiekt)
export const getNewGameState = () => ({
  gold: 0,
  goldPerSec: 0,
  clickPower: 10,
  globalMultiplier: 1,
  prestigePoints: 0,
  prestigeMultiplier: 1,
  owned: getInitialOwned(),
  upgrades: getInitialUpgrades(),
  achievementData: getInitialAchievementData(),
  lastUpdate: Date.now()
});



