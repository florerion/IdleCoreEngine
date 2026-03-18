import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Reusable confirmation modal component
 * Replaces window.confirm with beautiful Bootstrap modal
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message/body
 * @param {string} [props.confirmText='Confirm'] - Confirm button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 * @param {string} [props.type='info'] - Modal type (info, warning, danger)
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 * @example
 * <ConfirmModal
 *   show={showModal}
 *   title="Restore Backup?"
 *   message="Are you sure?"
 *   type="warning"
 *   onConfirm={() => restoreBackup()}
 *   onCancel={() => setShowModal(false)}
 * />
 */
const ConfirmModal = ({
  show,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  onConfirm,
  onCancel
}) => {
  // Modal type configuration
  const typeConfig = {
    info: {
      icon: Icons.Info,
      bgClass: 'bg-info',
      buttonClass: 'btn-primary'
    },
    warning: {
      icon: Icons.AlertTriangle,
      bgClass: 'bg-warning',
      buttonClass: 'btn-warning'
    },
    danger: {
      icon: Icons.AlertCircle,
      bgClass: 'bg-danger',
      buttonClass: 'btn-danger'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ display: 'block' }}
      />

      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block' }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* Header */}
            <div className={`modal-header ${config.bgClass} bg-opacity-10 border-bottom`}>
              <div className="d-flex align-items-center gap-2">
                <IconComponent size={24} />
                <h5 className="modal-title mb-0">
                  {title}
                </h5>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onCancel}
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              {message}
            </div>

            {/* Footer */}
            <div className="modal-footer gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button 
                type="button" 
                className={`btn ${config.buttonClass}`}
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;