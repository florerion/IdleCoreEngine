import React, { useMemo } from 'react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import './ToastContainer.css';

/**
 * Toast Container - renders all active toasts grouped by position
 * Place this at root level (in App.jsx)
 * @example
 * <ToastContainer />
 */
const ToastContainer = () => {
  const { toasts } = useToast();

  // Group toasts by position
  const toastsByPosition = useMemo(() => {
    const grouped = {
      'top-left': [],
      'top-center': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-center': [],
      'bottom-right': []
    };

    Object.values(toasts).forEach(toast => {
      if (grouped[toast.position]) {
        grouped[toast.position].push(toast);
      }
    });

    return grouped;
  }, [toasts]);

  // Render positions
  const positions = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  return (
    <>
      {positions.map(position => (
        <div key={position} className={`toast-stack toast-${position}`}>
          {toastsByPosition[position].map(toast => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div>
      ))}
    </>
  );
};

export default ToastContainer;