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

    if (!isTooSlow) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%',
            background: 'rgba(255, 0, 0, 0.9)', color: 'white',
            textAlign: 'center', padding: '10px', zIndex: 10000,
            fontWeight: 'bold', fontSize: '0.9rem'
        }}>
            ⚠️ Weak Network Detected ({latency > 0 ? `${latency}ms` : 'Offline'}) - Gameplay may be affected.
        </div>
    );
};

export default NetworkMonitor;
