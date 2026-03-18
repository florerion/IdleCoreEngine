import React, { createContext, useState, useCallback } from 'react';

/**
 * Toast context for global toast state management
 * Provides showToast method and manages active toasts
 */
export const ToastContext = createContext();

/**
 * Toast Provider - wrap your App with this
 * Manages all toast notifications globally
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState({});

  /**
   * Shows a toast notification
   * @param {Object} config - Toast configuration
   * @param {string} config.type - Toast type/skin (success, error, warning, info, achievement)
   * @param {string} config.title - Toast title
   * @param {string} [config.message] - Toast message
   * @param {string} [config.position='top-center'] - Toast position
   * @param {number} [config.duration=3000] - Auto-hide duration in ms
   * @param {boolean} [config.addToLog=false] - Add to game logs
   * @param {Function} [config.onClose] - Callback when toast closes
   * @example
   * showToast({
   *   type: 'success',
   *   title: 'Done!',
   *   message: 'Operation completed',
   *   position: 'top-right',
   *   duration: 3000,
   *   addToLog: true
   * });
   */
  const showToast = useCallback((config) => {
    const {
      type = 'info',
      title,
      message = '',
      position = 'top-center',
      duration = 3000,
      addToLog = false,
      onClose
    } = config;

    const id = `toast-${Date.now()}-${Math.random()}`;

    const toastData = {
      id,
      type,
      title,
      message,
      position,
      addToLog,
      onClose
    };

    setToasts(prev => ({
      ...prev,
      [id]: toastData
    }));

    // Auto-hide if duration is set
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  /**
   * Manually remove a toast by ID
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => {
      const { [id]: removed, ...rest } = prev;
      if (removed?.onClose) {
        removed.onClose();
      }
      return rest;
    });
  }, []);

  /**
   * Clear all toasts
   */
  const clearAllToasts = useCallback(() => {
    setToasts({});
  }, []);

  const value = {
    showToast,
    removeToast,
    clearAllToasts,
    toasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};