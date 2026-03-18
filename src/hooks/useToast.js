import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Hook for showing toast notifications from anywhere in the app
 * @returns {Object} Toast control object with showToast method
 * @example
 * const { showToast } = useToast();
 * showToast({
 *   type: 'success',
 *   title: 'Saved!',
 *   message: 'Game saved successfully',
 *   position: 'top-right',
 *   duration: 3000,
 *   addToLog: true
 * });
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  
  return context;
};