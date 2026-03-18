import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './Toast.css';

/**
 * Toast notification component with multiple skins and positions
 * Automatically renders based on config
 * @param {Object} props - Component props
 * @param {Object} props.toast - Toast data object
 * @example
 * <Toast toast={toastData} />
 */
const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Match CSS animation duration
  };

  // Toast skin configurations
  const skinConfig = {
    achievement: {
      bgClass: 'bg-warning',
      borderClass: 'border-warning',
      textClass: 'text-dark',
      icon: Icons.Trophy,
      defaultTitle: 'Achievement Unlocked'
    },
    success: {
      bgClass: 'bg-success',
      borderClass: 'border-success',
      textClass: 'text-light',
      icon: Icons.CheckCircle,
      defaultTitle: 'Success'
    },
    error: {
      bgClass: 'bg-danger',
      borderClass: 'border-danger',
      textClass: 'text-light',
      icon: Icons.AlertCircle,
      defaultTitle: 'Error'
    },
    warning: {
      bgClass: 'bg-warning',
      borderClass: 'border-warning',
      textClass: 'text-warning',
      icon: Icons.AlertTriangle,
      defaultTitle: 'Warning'
    },
    info: {
      bgClass: 'bg-info',
      borderClass: 'border-info',
      textClass: 'text-light',
      icon: Icons.Info,
      defaultTitle: 'Information'
    }
  };

  const config = skinConfig[toast.type] || skinConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`toast-wrapper ${isClosing ? 'toast-closing' : 'toast-showing'}`}
      role="alert"
      aria-live="polite"
    >
      <div className={`toast-box border ${config.bgClass} ${config.borderClass} ${config.textClass}`}>
        <div className="d-flex align-items-flex-start">
          {/* Icon */}
          <IconComponent size={24} className="me-3 flex-shrink-0 mt-1" />

          {/* Content */}
          <div className="flex-grow-1">
            <div className="toast-title fw-bold">
              {toast.title || config.defaultTitle}
            </div>
            {toast.message && (
              <div className="toast-message small mt-1">
                {toast.message}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            className="btn-close ms-2 flex-shrink-0"
            onClick={handleClose}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;