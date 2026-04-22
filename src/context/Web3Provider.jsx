import React, { useState, useEffect, useRef } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import WalletModal from '../components/WalletModal/WalletModal';
import WalletHeader from '../components/WalletHeader/WalletHeader';
import { getApiUrl } from '../utils/apiUrl';

const SOLANA_RPC = process.env.REACT_APP_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

/**
 * WalletGate — Enforces wallet connection.
 * Shows the connect modal if no wallet is connected.
 */
const WalletGate = ({ children }) => {
    const { connected, publicKey, wallet } = useWallet();
    const [showModal, setShowModal] = useState(false);
    const isReady = useRef(false);
    const hasAutoConnected = useRef(false);

    // Wait for autoConnect attempt — run ONCE on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            isReady.current = true;
            if (!hasAutoConnected.current) {
                setShowModal(true);
            }
        }, 2500); // Give autoConnect 2.5s to complete
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Track when wallet connects (including autoConnect)
    useEffect(() => {
        if (connected && publicKey) {
            hasAutoConnected.current = true;
            setShowModal(false);
        }
    }, [connected, publicKey]);

    // Re-show modal if user disconnects AFTER initial load
    useEffect(() => {
        if (isReady.current && !connected && hasAutoConnected.current) {
            // User was connected but disconnected
            setShowModal(true);
        } else if (isReady.current && !connected && !wallet) {
            // No wallet ever connected and ready period elapsed
            setShowModal(true);
        }
    }, [connected, wallet]);

    // Sync wallet to localStorage for game logic
    useEffect(() => {
        if (connected && publicKey) {
            const addr = publicKey.toBase58();
            localStorage.setItem('storedId', addr);
            console.log('🔗 Solana Wallet Connected:', addr);

            // Register user in backend
            const apiUrl = getApiUrl();
            fetch(`${apiUrl}/api/user/${addr}`)
                .then(res => res.json())
                .then(data => console.log('✅ User registered:', data))
                .catch(err => console.error('❌ Failed to register user:', err));

            // Also link as Solana address for Torque
            fetch(`${apiUrl}/api/link-solana`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: addr, solanaAddress: addr })
            }).catch(() => {});
        }
    }, [connected, publicKey]);

    // Block all content until wallet is connected
    if (!connected) {
        return (
            <>
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: '#0a0b0e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9990,
                }}>
                    {!showModal && (
                        <div style={{ textAlign: 'center', color: '#888' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🃏</div>
                            <h2 style={{ color: '#fff', marginBottom: '8px' }}>Naija Whot</h2>
                            <p>Connecting wallet...</p>
                        </div>
                    )}
                </div>
                <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
                <ConnectWalletButton onClick={() => setShowModal(true)} />
            </>
        );
    }

    return (
        <>
            <WalletHeader />
            {children}
            <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
};

/**
 * Floating connect wallet button (shown when disconnected)
 */
const ConnectWalletButton = ({ onClick }) => (
    <button
        onClick={onClick}
        style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 9998,
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            fontFamily: "'Inter', sans-serif",
        }}
    >
        🔗 Connect Wallet
    </button>
);

/**
 * Web3Provider — Wraps the app with Solana wallet context.
 * Also provides a WalletGate to enforce connection.
 */
export const Web3Provider = ({ children }) => {
    const wallets = React.useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new CoinbaseWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={SOLANA_RPC}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletGate>
                    {children}
                </WalletGate>
            </WalletProvider>
        </ConnectionProvider>
    );
};
