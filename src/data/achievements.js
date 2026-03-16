export const ACHIEVEMENTS = {
  firstGold: {
    id: 'firstGold',
    name: 'Pierwsze kroki',
    description: 'Zarabiaj 100 złota',
    icon: 'Star', // ← Nazwa ikony z lucide-react
    condition: (data) => data.gold >= 100,
    progress: (data) => data.gold,
    progressMax: 100,
    reward: { multiplier: 1.05 }
  },
  
  minerCollector: {
    id: 'minerCollector',
    name: 'Kolekcjoner górników',
    description: 'Posiadaj 5 górników',
    icon: 'Pickaxe', // ← Już używana w BUILDINGS['miner']
    condition: (data) => data.owned.miner >= 5,
    progress: (data) => data.owned.miner,
    progressMax: 5,
    reward: { multiplier: 1.10 }
  },

  moneyMaker: {
    id: 'moneyMaker',
    name: 'Zarobek',
    description: 'Zarabiaj 10000 złota',
    icon: 'Coins', // ← Ikona monet
    condition: (data) => data.gold >= 10000,
    progress: (data) => data.gold,
    progressMax: 10000,
    reward: { gold: 500 }
  },

  speedDemon: {
    id: 'speedDemon',
    name: 'Szybkie tempo',
    description: 'Osiągnij 50 GPS',
    icon: 'Zap', // ← Ikona błyskawicy
    condition: (data) => {
      return true; // Logika w checkAchievements
    },
    progress: (data) => data.gps || 0,
    progressMax: 50,
    reward: { multiplier: 1.15 }
  }
};