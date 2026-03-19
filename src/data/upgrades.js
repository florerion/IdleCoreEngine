/**
 * @typedef {Object} UpgradeDefinition
 * @property {string} id - Unique identifier of the upgrade
 * @property {string} name - Display name of the upgrade
 * @property {number} cost - One-time gold cost to purchase
 * @property {string} description - Short display description
 * @property {'click'|'building'|'global'} type - Effect scope:
 *   'click' multiplies manual click power,
 *   'building' multiplies specific building output,
 *   'global' multiplies all building output
 * @property {string[]} [targets] - Building IDs affected (only for type 'building')
 * @property {number} [multiplier] - Optional multiplicative factor applied when purchased
 * @property {{mode: 'additive'|'multiplicative', value: number}} [cycleTimeEffect] - Optional cycle time modifier
 */

/**
 * Registry of all available one-time upgrades in the game.
 * Upgrades are purchased once and permanently boost production, click power,
 * or building cycle timing depending on configured fields.
 *
 * @type {Object.<string, UpgradeDefinition>}
 * @example
 * import { UPGRADES } from './data/upgrades';
 * const upgradeCost = UPGRADES.sharp_pickaxe.cost; // 150
 */
export const UPGRADES = {
  sharp_pickaxe: { id: 'sharp_pickaxe', name: 'Ostre Kilofy', cost: 150, description: 'Ręczne x2', type: 'click', multiplier: 2 },
  miner_motivation: { id: 'miner_motivation', name: 'Motywacja', cost: 300, description: 'Górnicy x2', type: 'building', targets: ['miner'], multiplier: 2 },
  cosmic_energy: { id: 'cosmic_energy', name: 'Energia', cost: 5000, description: 'Global x2', type: 'global', multiplier: 2 },
  miner_rhythm_training: {
    id: 'miner_rhythm_training',
    name: 'Trening Rytmu',
    cost: 1200,
    description: 'Cykl Górnika -200 ms',
    type: 'building',
    targets: ['miner'],
    cycleTimeEffect: { mode: 'additive', value: -200 }
  },
  drill_cooling: {
    id: 'drill_cooling',
    name: 'Aktywne Chłodzenie',
    cost: 8500,
    description: 'Cykl Wiertła x0.8',
    type: 'building',
    targets: ['drill'],
    cycleTimeEffect: { mode: 'multiplicative', value: 0.8 }
  },
  factory_shift_optimization: {
    id: 'factory_shift_optimization',
    name: 'Optymalizacja Zmiany',
    cost: 45000,
    description: 'Fabryka x1.25, cykl x0.7',
    type: 'building',
    targets: ['factory'],
    multiplier: 1.25,
    cycleTimeEffect: { mode: 'multiplicative', value: 0.7 }
  },
  temporal_coordination: {
    id: 'temporal_coordination',
    name: 'Koordynacja Czasowa',
    cost: 125000,
    description: 'Globalny cykl x0.9',
    type: 'global',
    multiplier: 1.1,
    cycleTimeEffect: { mode: 'multiplicative', value: 0.9 }
  },
  nano_dispatch: {
    id: 'nano_dispatch',
    name: 'Nano-Dyspozycja',
    cost: 320000,
    description: 'Globalny cykl -50 ms',
    type: 'global',
    cycleTimeEffect: { mode: 'additive', value: -50 }
  }
};