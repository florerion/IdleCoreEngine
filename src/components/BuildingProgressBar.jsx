import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';

const BuildingProgressBar = ({ interval = 1000 }) => {
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState([]);
  const lastTickRef = useRef(0);
  const requestRef = useRef();

  // 1. Definicja funkcji tworzącej monetę
  const spawnCoin = () => {
    const id = Date.now();
    const offset = (Math.random() * 20 - 10) + 'px'; // Lekki rozrzut lewo/prawo
    
    setParticles(prev => [...prev, { id, offset }]);
    
    // Usuwamy monetę po zakończeniu animacji (1.2s zgodnie z nowym CSS)
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      
      // Obliczamy aktualny cykl (np. ile sekund minęło od początku działania strony)
      const currentCycle = Math.floor(now / interval);
      
      // Obliczamy procent postępu (0-100)
      const p = ((now % interval) / interval) * 100;
      
      // --- TUTAJ WYWOŁUJEMY spawnCoin ---
      // Jeśli numer cyklu się zmienił, oznacza to, że minęła kolejna sekunda (tick)
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
      {/* Renderowanie cząsteczek monet */}
      {particles.map(p => (
        <div 
          key={p.id} 
          className="coin-particle" 
          style={{ 
            left: `calc(50% + ${p.offset})`, 
            top: '-15px' // Wypchnięcie w górę, aby startowało z ikony
          }}
        >
          <Icons.Coins size={14} />
        </div>
      ))}
      
      {/* Pasek postępu */}
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
