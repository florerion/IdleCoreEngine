import { 
  createSavePackage, 
  loadSavePackage, 
  validateGameState 
} from './encryption';
import { MAX_BACKUPS, AUTO_BACKUP_INTERVAL } from '../config/devConfig';

// Track last backup time to respect AUTO_BACKUP_INTERVAL
let lastBackupTime = 0;

/**
 * Saves game state to localStorage
 * Encrypts if needed
 * Backups are created based on AUTO_BACKUP_INTERVAL, not on every save
 * @param {Object} gameState - Current game state object
 * @throws {Error} If save operation fails
 * @example
 * saveGameToStorage(gameData.current);
 */
export const saveGameToStorage = (gameState) => {
  try {
    const savePackage = createSavePackage(gameState);
    localStorage.setItem('idleGameSave', savePackage);
    
    // Create backup only if enough time has passed
    const now = Date.now();
    if (now - lastBackupTime >= AUTO_BACKUP_INTERVAL) {
      createAutoBackup(gameState);
      lastBackupTime = now;
    }
  } catch (error) {
    console.error('Failed to save game:', error);
    throw error;
  }
};

/**
 * Loads game state from localStorage
 * Handles decryption and validation
 * @returns {Object|null} Game state or null if no save found
 * @throws {Error} If save is corrupted or tampered
 * @example
 * const gameState = loadGameFromStorage();
 * if (gameState) {
 *   // Load successful
 * }
 */
export const loadGameFromStorage = () => {
  const saved = localStorage.getItem('idleGameSave');
  
  if (!saved) {
    return null;
  }
  
  try {
    const gameState = loadSavePackage(saved);
    validateGameState(gameState);
    return gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    throw error;
  }
};

/**
 * Creates a timestamped backup in localStorage
 * Automatically removes oldest backup if limit is exceeded
 * This is called by saveGameToStorage based on AUTO_BACKUP_INTERVAL
 * @param {Object} gameState - Current game state
 * @throws {Error} If backup creation fails
 * @example
 * createAutoBackup(gameData.current);
 */
export const createAutoBackup = (gameState) => {
  try {
    const backupsJson = localStorage.getItem('idleGameBackups') || '[]';
    const backups = JSON.parse(backupsJson);
    
    const backup = {
      timestamp: Date.now(),
      data: createSavePackage(gameState)
    };
    
    backups.push(backup);
    
    // Remove oldest backup if exceeding limit
    if (backups.length > MAX_BACKUPS) {
      backups.shift();
    }
    
    localStorage.setItem('idleGameBackups', JSON.stringify(backups));
  } catch (error) {
    console.error('Failed to create backup:', error);
    // Don't throw - backup failure shouldn't break the game
  }
};

/**
 * Lists all available backups with metadata
 * @returns {Array} Array of backup metadata objects
 * @example
 * const backups = listBackups();
 * // Returns: [{ timestamp: 1234567890, dateStr: '...' }, ...]
 */
export const listBackups = () => {
  try {
    const backupsJson = localStorage.getItem('idleGameBackups') || '[]';
    const backups = JSON.parse(backupsJson);
    
    return backups.map((backup, index) => ({
      index,
      timestamp: backup.timestamp,
      dateStr: new Date(backup.timestamp).toLocaleString()
    }));
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};

/**
 * Restores game state from a specific backup
 * @param {number} index - Backup index from listBackups()
 * @returns {Object} Restored game state
 * @throws {Error} If backup not found or restoration fails
 * @example
 * const gameState = restoreBackup(0); // Restore first (oldest) backup
 */
export const restoreBackup = (index) => {
  try {
    const backupsJson = localStorage.getItem('idleGameBackups') || '[]';
    const backups = JSON.parse(backupsJson);
    
    if (index < 0 || index >= backups.length) {
      throw new Error('Backup not found');
    }
    
    const gameState = loadSavePackage(backups[index].data);
    validateGameState(gameState);
    
    return gameState;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    throw error;
  }
};

/**
 * Clears all backups from localStorage
 * @example
 * clearAllBackups();
 */
export const clearAllBackups = () => {
  try {
    localStorage.removeItem('idleGameBackups');
    lastBackupTime = 0; // Reset backup timer
  } catch (error) {
    console.error('Failed to clear backups:', error);
  }
};