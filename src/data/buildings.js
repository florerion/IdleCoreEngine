/**
 * @typedef {Object} BuildingDefinition
 * @property {string} id - Unique identifier of the building
 * @property {string} name - Display name of the building
 * @property {string} icon - Icon component name from the lucide-react library
 * @property {number} baseCost - Base purchase cost before exponential scaling
 * @property {number} baseRate - Base gold production rate per second (unmodified)
 * @property {number} cycleTime - Production cycle duration in milliseconds
 * @property {string} description - Short display description of the building
 */

/**
 * Registry of all available buildings in the game.
 * Each building defines its production pacing with cycleTime (ms), while
 * baseRate remains the average per-second output used by production logic.
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
    cycleTime: 1000,
    description: 'Wydobywa 1/s' 
  },
  drill: { 
    id: 'drill', 
    name: 'Wiertło', 
    icon: 'Drill', 
    baseCost: 100, 
    baseRate: 5, 
    cycleTime: 5000,
    description: 'Generuje 5/s' 
  },
  factory: { 
    id: 'factory', 
    name: 'Fabryka', 
    icon: 'Factory', 
    baseCost: 1000, 
    baseRate: 25, 
    cycleTime: 10000,
    description: 'Produkcja 25/s' 
  }
};