import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';

/**
 * A compact progress bar that visually represents one production cycle for a building.
 * Fills from 0% to 100% over the given interval (in ms), then resets and spawns
 * a floating coin particle animation to signal a completed production tick.
 * Uses `requestAnimationFrame` for smooth, frame-accurate updates.
 *
 * @param {Object} props
 * @param {number} [props.interval=1000] - Duration of one production cycle in milliseconds
 */
const BuildingProgressBar = ({ interval = 1000 }) => {
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState([]);
  const lastTickRef = useRef(0);
  const requestRef = useRef();

  // Spawns a coin particle with a slight random horizontal offset
  const spawnCoin = () => {
    const id = Date.now();
    const offset = (Math.random() * 20 - 10) + 'px'; // Slight left/right spread
    
    setParticles(prev => [...prev, { id, offset }]);
    
    // Remove the coin after its CSS animation completes (1.2s)
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      
      // Derive the current cycle index from wall-clock time so all bars stay in sync
      const currentCycle = Math.floor(now / interval);
      
      // Progress percentage within the current cycle (0–100)
      const p = ((now % interval) / interval) * 100;
      
      // When the cycle index advances, a new production tick has completed
      if (currentCycle > lastTickRef.current) {
        spawnCoin();
        lastTickRef.current = currentCycle;
      }
      
      setProgress(p);
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [interval]);

  return (
    <div className="position-relative" style={{ height: '3px', width: '100%' }}>
      {/* Coin particles emitted on each production tick */}
      {particles.map(p => (
        <div 
          key={p.id} 
          className="coin-particle" 
          style={{ 
            left: `calc(50% + ${p.offset})`, 
            top: '-15px' // Start above the icon
          }}
        >
          <Icons.Coins size={14} />
        </div>
      ))}
      
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
