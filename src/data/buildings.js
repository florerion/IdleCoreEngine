/**
 * @typedef {Object} BuildingDefinition
 * @property {string} id - Unique identifier of the building
 * @property {string} name - Display name of the building
 * @property {string} icon - Icon component name from the lucide-react library
 * @property {number} baseCost - Base purchase cost before exponential scaling
 * @property {number} baseRate - Base gold production rate per second (unmodified)
 * @property {string} description - Short display description of the building
 */

/**
 * Registry of all available buildings in the game.
 * Each building produces gold per second based on its baseRate, which can be
 * further scaled by upgrades and global multipliers.
 *
 * @type {Object.<string, BuildingDefinition>}
 * @example
 * import { BUILDINGS } from './data/buildings';
 * const minerBaseCost = BUILDINGS.miner.baseCost; // 15
 * const minerBaseRate = BUILDINGS.miner.baseRate;  // 1
 */
export const BUILDINGS = {
  miner: { 
    id: 'miner', 
    name: 'Górnik', 
    icon: 'Pickaxe',
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