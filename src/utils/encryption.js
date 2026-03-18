import CryptoJS from 'crypto-js';
import { DEV_MODE, ENCRYPTION_SEED, LEGACY_SEEDS, SAVE_FORMAT_VERSION } from '../config/devConfig';

/**
 * Encrypts game state using AES encryption
 * Only called when DEV_MODE is false
 * @param {Object} data - Game state object to encrypt
 * @param {string} [seed] - Optional seed override (for legacy decryption)
 * @returns {string} Base64 encrypted string
 * @throws {Error} If encryption fails
 * @example
 * const encrypted = encryptSave(gameState);
 * // Returns: "U2FsdGVkX1..."
 */
export const encryptSave = (data, seed = ENCRYPTION_SEED) => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, seed).toString();
    return encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypts encrypted save string
 * Attempts to use provided seed, falls back to legacy seeds if needed
 * @param {string} encrypted - Encrypted save string
 * @param {string} [seed] - Optional seed override
 * @returns {Object} Decrypted game state
 * @throws {Error} If decryption fails (indicates tampering or corruption)
 * @example
 * const gameState = decryptSave(encryptedString);
 * // Returns: { gold: 1000, gps: 5, ... }
 */
export const decryptSave = (encrypted, seed = ENCRYPTION_SEED) => {
  /**
   * Try to decrypt with a specific seed and return parsed JSON.
   * Throws if decryption fails or produces an empty result.
   */
  const tryDecryptWithSeed = (enc, currentSeed) => {
    const decrypted = CryptoJS.AES.decrypt(enc, currentSeed);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!jsonString) {
      throw new Error('Decryption produced empty result - possible tampering or wrong seed');
    }

    return JSON.parse(jsonString);
  };

  let lastError;

  // First, try with the provided/current seed
  try {
    return tryDecryptWithSeed(encrypted, seed);
  } catch (error) {
    lastError = error;
  }

  // If that fails, attempt to decrypt with each legacy seed
  const seedsToTry = Array.isArray(LEGACY_SEEDS) ? LEGACY_SEEDS : [];
  for (const legacySeed of seedsToTry) {
    // Skip if the legacy seed is the same as the primary seed we already tried
    if (legacySeed === seed) continue;

    try {
      return tryDecryptWithSeed(encrypted, legacySeed);
    } catch (error) {
      lastError = error;
    }
  }

  // If all seeds fail, surface a final error
  throw new Error(
    `Decryption failed: ${lastError && lastError.message ? lastError.message : 'All seeds failed'}`
  );
};

/**
 * Creates a complete save package with metadata
 * Package includes version info, timestamp, and encrypted/plain data
 * @param {Object} gameState - Current game state
 * @returns {string} JSON stringified save package
 * @example
 * const savePackage = createSavePackage(gameData);
 * localStorage.setItem('idleGameSave', savePackage);
 */
export const createSavePackage = (gameState) => {
  const pkg = {
    version: SAVE_FORMAT_VERSION,
    timestamp: Date.now(),
    devMode: DEV_MODE,
    // If DEV_MODE: store plain JSON; otherwise: encrypt it
    data: DEV_MODE ? gameState : encryptSave(gameState)
  };
  
  return JSON.stringify(pkg);
};

/**
 * Loads and validates a save package
 * Handles decryption, DEV_MODE validation, and state migration
 * @param {string} saveString - Raw save package JSON string
 * @returns {Object} Validated and decrypted game state
 * @throws {Error} If save is corrupted, tampered, or incompatible with DEV_MODE
 * @example
 * const gameState = loadSavePackage(localStorage.getItem('idleGameSave'));
 */
export const loadSavePackage = (saveString) => {
  let pkg;
  
  // Parse package
  try {
    pkg = JSON.parse(saveString);
  } catch (error) {
    throw new Error(`Invalid save format: ${error.message}`);
  }

  const isObject = pkg !== null && typeof pkg === 'object';
  const hasPackageShape =
    isObject && ('data' in pkg || 'version' in pkg || 'devMode' in pkg);

  // Handle legacy saves that were stored as raw game state JSON
  // (no packaging metadata like version/devMode/data)
  if (!hasPackageShape) {
    const legacyState = pkg;
    // Treat legacy saves as coming from version 0
    return migrateGameState(legacyState, 0);
  }
  
  // At this point we expect a packaged save object
  if (!('data' in pkg)) {
    throw new Error('Invalid save package: missing data field.');
  }
  
  // Validate DEV_MODE compatibility
  if (pkg.devMode && !DEV_MODE) {
    throw new Error(
      'This save was created in DEV_MODE but the app is running in PRODUCTION mode. ' +
      'Enable DEV_MODE to load this save.'
    );
  }
  
  // Warn if loaded encrypted save in DEV_MODE
  if (!pkg.devMode && DEV_MODE) {
    console.warn(
      'Loading an encrypted save in DEV_MODE. ' +
      'This save was not created in DEV_MODE but is being loaded anyway.'
    );
  }
  
  // Decrypt data if needed
  let gameState;
  if (pkg.devMode) {
    // Plain JSON in DEV_MODE
    gameState = pkg.data;
  } else {
    // Encrypted data - validate and try to decrypt
    if (typeof pkg.data !== 'string') {
      throw new Error('Invalid save package: expected encrypted data to be a string.');
    }
    try {
      gameState = decryptSave(pkg.data);
    } catch (error) {
      throw new Error(`Failed to decrypt save: ${error.message}`);
    }
  }
  
  // Migrate game state if format version changed
  const fromVersion = typeof pkg.version === 'number' ? pkg.version : 0;
  gameState = migrateGameState(gameState, fromVersion);
  
  return gameState;
};

/**
 * Handles game state migration between format versions
 * Add migration logic here when you change SAVE_FORMAT_VERSION
 * @param {Object} state - Game state to migrate
 * @param {number} fromVersion - Version the save was created with
 * @returns {Object} Migrated game state
 * @example
 * // Example: adding a new field in version 2
 * if (fromVersion === 1 && SAVE_FORMAT_VERSION >= 2) {
 *   state.newField = state.newField || defaultValue;
 * }
 */
export const migrateGameState = (state, fromVersion) => {
  if (fromVersion === SAVE_FORMAT_VERSION) {
    return state; // No migration needed
  }
  
  // Add migration logic here as game evolves
  // Example:
  // if (fromVersion < 2) {
  //   state.newFieldInV2 = state.newFieldInV2 || 0;
  // }
  
  return state;
};

/**
 * Validates game state structure and values
 * Prevents obviously invalid or tampered saves from loading
 * @param {Object} state - Game state to validate
 * @throws {Error} If state is invalid
 * @example
 * validateGameState(loadedState); // Throws if invalid
 */
export const validateGameState = (state) => {
  // Check required fields exist
  if (typeof state.gold !== 'number') {
    throw new Error('Invalid save: gold must be a number');
  }
  if (!state.owned || typeof state.owned !== 'object') {
    throw new Error('Invalid save: missing owned buildings data');
  }
  if (!state.upgrades || typeof state.upgrades !== 'object') {
    throw new Error('Invalid save: missing upgrades data');
  }
  
  // Check for unrealistic negative values
  if (state.gold < 0) {
    throw new Error('Invalid save: gold cannot be negative');
  }
  
  // Note: We don't validate max gold - idle games have huge numbers
  // This is intentional to allow for various progression speeds
};