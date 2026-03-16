export const BUILDINGS = {
  miner: { 
    id: 'miner', 
    name: 'Górnik', 
    icon: 'Pickaxe', // Nazwa ikony z biblioteki
    baseCost: 15, 
    baseRate: 1, 
    description: 'Wydobywa 1/s' 
  },
  drill: { 
    id: 'drill', 
    name: 'Wiertło', 
    icon: 'Drill', 
    baseCost: 100, 
    baseRate: 5, 
    description: 'Generuje 5/s' 
  },
  factory: { 
    id: 'factory', 
    name: 'Fabryka', 
    icon: 'Factory', 
    baseCost: 1000, 
    baseRate: 25, 
    description: 'Produkcja 25/s' 
  }
};

export const UPGRADES = {
  sharp_pickaxe: { id: 'sharp_pickaxe', name: 'Ostre Kilofy', cost: 150, description: 'Ręczne x2', type: 'click', multiplier: 2 },
  miner_motivation: { id: 'miner_motivation', name: 'Motywacja', cost: 300, description: 'Górnicy x2', type: 'building', targets: ['miner'], multiplier: 2 },
  cosmic_energy: { id: 'cosmic_energy', name: 'Energia', cost: 5000, description: 'Global x2', type: 'global', multiplier: 2 }
};

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
  lastUpdate: Date.now()
});



