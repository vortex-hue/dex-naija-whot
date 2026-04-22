import React, { useState, useEffect, useCallback, useRef } from 'react';

const NetworkMonitor = () => {
    const [status, setStatus] = useState('good'); // 'good' | 'slow' | 'offline'
    const [latency, setLatency] = useState(0);
    const [isHidden, setIsHidden] = useState(false);
    const failCount = useRef(0);

    const checkNetwork = useCallback(async () => {
        // 1. First check browser's own network status
        if (!navigator.onLine) {
            setStatus('offline');
            setLatency(0);
            failCount.current += 1;
            return;
        }

        // 2. Try to reach the backend
        const start = Date.now();
        try {
            const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(`${apiUrl}/api/health`, {
                method: 'GET',
                signal: controller.signal,
                cache: 'no-store',
            });
            clearTimeout(timeout);

            const duration = Date.now() - start;
            setLatency(duration);

            if (res.ok && duration < 5000) {
                setStatus('good');
                failCount.current = 0;
                if (isHidden) setIsHidden(false);
            } else if (duration >= 5000) {
                setStatus('slow');
                failCount.current += 1;
            } else {
                setStatus('good');
                failCount.current = 0;
            }
        } catch (err) {
            failCount.current += 1;
            if (failCount.current >= 2) {
                setStatus('offline');
            }
        }
    }, [isHidden]);

    useEffect(() => {
        // Initial check after a delay (give backend time to respond after page load)
        const initialTimer = setTimeout(checkNetwork, 3000);

        // Then check every 10 seconds (not 5 — less spammy)
        const interval = setInterval(checkNetwork, 10000);

        // Listen for browser online/offline events
        const handleOnline = () => {
            setStatus('good');
            failCount.current = 0;
            setIsHidden(false);
        };
        const handleOffline = () => {
            setStatus('offline');
            failCount.current += 1;
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkNetwork]);

    // Don't show anything if network is good or user dismissed
    if (status === 'good' || isHidden) return null;

    const message = status === 'offline'
        ? '⚠️ Connection Lost'
        : `⚠️ Slow Network (${latency}ms)`;

    const bgColor = status === 'offline'
        ? 'rgba(239, 68, 68, 0.92)'
        : 'rgba(245, 158, 11, 0.92)';

    return (
        <div style={{
            position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)',
            background: bgColor, color: 'white',
            textAlign: 'center', padding: '10px 20px', zIndex: 10000,
            fontWeight: 600, fontSize: '0.85rem',
            borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', gap: '12px',
            maxWidth: '90%', width: 'fit-content',
            backdropFilter: 'blur(8px)',
            fontFamily: "'Inter', sans-serif",
            animation: 'slideDown 0.3s ease',
        }}>
            <span>{message}</span>
            <button
                onClick={() => setIsHidden(true)}
                style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                    fontSize: '0.85rem', cursor: 'pointer', padding: '2px 8px',
                    fontWeight: 'bold', borderRadius: '10px',
                    display: 'flex', alignItems: 'center'
                }}
            >
                ✕
            </button>
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default NetworkMonitor;
