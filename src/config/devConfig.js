/**
 * Development and encryption configuration
 * Controls DEV_MODE behavior and save encryption settings
 */

// Convenient access to environment variables
const env = import.meta.env;

/**
 * Development mode flag
 * When true: saves are stored as plain JSON (readable, modifiable by player)
 * When false: saves are encrypted to prevent tampering
 * @type {boolean}
 */
export const DEV_MODE = env.VITE_DEV_MODE === 'true';

/**
 * Encryption seed for save protection
 * WARNING: Changing this will break all existing saves!
 * Only change when you plan to handle migration
 * @type {string}
 */
export const ENCRYPTION_SEED = env.VITE_ENCRYPTION_SEED || 'idle-core-engine-default';

/**
 * Legacy encryption seeds for backward compatibility
 * If you need to change ENCRYPTION_SEED, add the old seed here
 * Example: { 'v1-seed': 'old-seed-value' }
 * @type {Object}
 */
export const LEGACY_SEEDS = {
  // Add old seeds here if migration is needed
};

/**
 * Auto-backup interval in milliseconds
 * Creates a new backup every N minutes
 * @type {number}
 */
export const AUTO_BACKUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Maximum number of backups to keep in localStorage
 * When limit is exceeded, oldest backup is deleted
 * @type {number}
 */
export const MAX_BACKUPS = 5;

/**
 * Current save format version
 * Increment this when you make breaking changes to game state structure
 * Increment, then add migration logic in encryption.js:migrateGameState()
 * @type {number}
 */
export const SAVE_FORMAT_VERSION = 1;