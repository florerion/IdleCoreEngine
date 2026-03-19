import React from 'react';

/**
 * A compact progress bar that visually represents one production cycle for a building.
 * It renders externally computed cycle progress (0-100).
 *
 * @param {Object} props
 * @param {number} [props.progressPercent=0] - Current cycle progress in percent (0-100)
 */
const BuildingProgressBar = ({ progressPercent = 0 }) => {
  const progress = Math.max(0, Math.min(100, progressPercent));

  return (
    <div className="position-relative" style={{ height: '3px', width: '100%' }}>
      {/* Progress bar */}
      <div className="progress" style={{ height: '100%', backgroundColor: '#f0f0f0' }}>
        <div 
          className="progress-bar bg-info" 
          style={{ width: `${progress}%`, transition: 'none' }}
        />
      </div>
    </div>
  );
};

export default BuildingProgressBar;
