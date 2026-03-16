import React, { useState, useRef, useEffect } from 'react';

const ProgressButton = ({ label, duration, onFinish, clickValue }) => {
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState(false);
    const [clicks, setClicks] = useState([]);
    const requestRef = useRef();
    const startTimeRef = useRef();

    const animate = (time) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;
        const p = Math.min((elapsed / duration) * 100, 100);

        if (p < 100) {
            setProgress(p);
            requestRef.current = requestAnimationFrame(animate);
        } else {
            // KLUCZOWY FIX: Zerujemy wszystko przed zakończeniem
            cancelAnimationFrame(requestRef.current);
            startTimeRef.current = null; // To sprawi, że następne kliknięcie zacznie od 0
            
            setProgress(0);
            setActive(false);
            onFinish();
        }
    };

    const handleLocalClick = (e) => {
        if (active) return;

        // Resetujemy flagi przed startem
        startTimeRef.current = null; 
        setProgress(0);
        setActive(true);

        // Animacja cyferki
        const newClick = { id: Date.now(), x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        setClicks(prev => [...prev, newClick]);
        setTimeout(() => setClicks(prev => prev.filter(c => c.id !== newClick.id)), 800);

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => () => cancelAnimationFrame(requestRef.current), []);

    return (
        <div className="mb-3 position-relative"> {/* RELATIVE tutaj jest kluczowe */}
            
            {/* Kontener na animacje - teraz absolutny, więc nic nie przesunie */}
            <div className="floating-container">
            {clicks.map(c => (
                <span 
                key={c.id} 
                className="floating-number" 
                style={{ left: c.x, top: c.y }}
                >
                +{clickValue}
                </span>
            ))}
            </div>

            {/* PRZYCISK */}
            <button 
            className="btn btn-primary w-100 mb-2 py-2 fw-bold shadow-sm" 
            onClick={handleLocalClick} 
            disabled={active}
            style={{ minHeight: '50px' }} // Stała wysokość zapobiega "skakaniu"
            >
            {active ? 'Wydobywanie...' : label}
            </button>

            {/* PASEK POSTĘPU */}
            <div className="progress" style={{ height: '8px', background: '#e9ecef' }}>
            <div 
                className="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                style={{ width: `${progress}%`, transition: 'none' }}
            ></div>
            </div>
        </div>
    );


};

export default ProgressButton;
