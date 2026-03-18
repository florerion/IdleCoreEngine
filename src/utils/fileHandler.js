import { createSavePackage, loadSavePackage, validateGameState } from './encryption';

/**
 * Exports game state as downloadable file
 * File is encrypted based on current DEV_MODE setting
 * @param {Object} gameState - Current game state
 * @param {string} [filename='idle-save.dat'] - Downloaded file name
 * @throws {Error} If export fails
 * @example
 * downloadSaveFile(gameData.current, 'my-save.dat');
 */
export const downloadSaveFile = (gameState, filename = 'idle-save.dat') => {
  try {
    const savePackage = createSavePackage(gameState);
    const blob = new Blob([savePackage], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download save:', error);
    throw error;
  }
};

/**
 * Imports game state from uploaded file
 * Validates DEV_MODE compatibility and save integrity
 * @param {File} file - File object from input element
 * @returns {Promise<Object>} Restored game state
 * @throws {Error} If file is invalid or incompatible
 * @example
 * const gameState = await importSaveFile(fileInputElement.files[0]);
 */
export const importSaveFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const gameState = loadSavePackage(content);
        validateGameState(gameState);
        resolve(gameState);
      } catch (error) {
        reject(new Error(`Failed to import save: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};