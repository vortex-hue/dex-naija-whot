import React, { useState, useEffect } from 'react';

const NetworkMonitor = () => {
    const [latency, setLatency] = useState(0);
    const [isTooSlow, setIsTooSlow] = useState(false);

    useEffect(() => {
        const checkSpeed = async () => {
            const start = Date.now();
            try {
                const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
                await fetch(`${apiUrl}/api/health`, { method: 'HEAD' }); // Lightweight request
                const end = Date.now();
                const duration = end - start;
                setLatency(duration);
                setIsTooSlow(duration > 3000); // Alert if > 3 seconds latency
            } catch (e) {
                setIsTooSlow(true); // Assume offline/terrible if fetch fails
            }
        };

        const interval = setInterval(checkSpeed, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, []);

    const [isHidden, setIsHidden] = useState(false);

    if (!isTooSlow || isHidden) return null;

    return (
        <div style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255, 68, 68, 0.95)', color: 'white',
            textAlign: 'center', padding: '12px 25px', zIndex: 10000,
            fontWeight: 'bold', fontSize: '0.9rem',
            borderRadius: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '15px',
            maxWidth: '90%', width: 'fit-content'
        }}>
            <span>⚠️ Weak Network ({latency > 0 ? `${latency}ms` : 'Offline'})</span>
            <button
                onClick={() => setIsHidden(true)}
                style={{
                    background: 'none', border: 'none', color: 'white',
                    fontSize: '1.2rem', cursor: 'pointer', padding: '0 5px',
                    fontWeight: 'bold', display: 'flex', alignItems: 'center'
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default NetworkMonitor;
