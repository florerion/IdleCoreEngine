import React, { useState, useRef, useEffect } from 'react';

/**
 * A click-triggered progress button that animates a progress bar over a set duration
 * before calling the `onFinish` callback. Prevents rapid re-clicking by disabling
 * itself while the animation is running.
 * Floating "+N" indicators are spawned at the click coordinates on each activation.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.label - Content rendered inside the button when idle
 * @param {number} props.duration - Animation duration in milliseconds
 * @param {Function} props.onFinish - Callback invoked once the progress bar completes
 * @param {number|string} [props.clickValue] - Value shown in the floating indicator (e.g. click power)
 */
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
            // Reset all animation state before invoking the callback
            cancelAnimationFrame(requestRef.current);
            startTimeRef.current = null; // Ensures the next click starts from 0
            
            setProgress(0);
            setActive(false);
            onFinish();
        }
    };

    const handleLocalClick = (e) => {
        if (active) return;

        // Reset flags before starting the animation loop
        startTimeRef.current = null; 
        setProgress(0);
        setActive(true);

        // Spawn a floating indicator at the click position
        const newClick = { id: Date.now(), x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        setClicks(prev => [...prev, newClick]);
        setTimeout(() => setClicks(prev => prev.filter(c => c.id !== newClick.id)), 800);

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => () => cancelAnimationFrame(requestRef.current), []);

    return (
        <div className="mb-3 position-relative"> {/* Relative positioning anchors the floating container */}
            
            {/* Absolute container for floating indicators — does not affect layout flow */}
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

            {/* Button */}
            <button 
            className="btn btn-primary w-100 mb-2 py-2 fw-bold shadow-sm" 
            onClick={handleLocalClick} 
            disabled={active}
            style={{ minHeight: '50px' }} // Fixed height prevents layout shift during state changes
            >
            {active ? 'Wydobywanie...' : label}
            </button>

            {/* Progress bar */}
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
