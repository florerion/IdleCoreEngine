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
 * @property {number} multiplier - Multiplicative factor applied when purchased
 */

/**
 * Registry of all available one-time upgrades in the game.
 * Upgrades are purchased once and permanently boost production or click power.
 *
 * @type {Object.<string, UpgradeDefinition>}
 * @example
 * import { UPGRADES } from './data/upgrades';
 * const upgradeCost = UPGRADES.sharp_pickaxe.cost; // 150
 */
export const UPGRADES = {
  sharp_pickaxe: { id: 'sharp_pickaxe', name: 'Ostre Kilofy', cost: 150, description: 'Ręczne x2', type: 'click', multiplier: 2 },
  miner_motivation: { id: 'miner_motivation', name: 'Motywacja', cost: 300, description: 'Górnicy x2', type: 'building', targets: ['miner'], multiplier: 2 },
  cosmic_energy: { id: 'cosmic_energy', name: 'Energia', cost: 5000, description: 'Global x2', type: 'global', multiplier: 2 }
};