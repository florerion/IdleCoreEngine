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