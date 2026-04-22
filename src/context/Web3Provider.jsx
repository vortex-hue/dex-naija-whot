import React, { useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import WalletModal from '../components/WalletModal/WalletModal';

const SOLANA_RPC = process.env.REACT_APP_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

/**
 * WalletGate — Enforces wallet connection.
 * Shows the connect modal if no wallet is connected.
 */
const WalletGate = ({ children }) => {
    const { connected, publicKey } = useWallet();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Show modal automatically if not connected (after a short delay to allow autoConnect)
        const timer = setTimeout(() => {
            if (!connected) setShowModal(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, [connected]);

    // Sync wallet to localStorage for game logic
    useEffect(() => {
        if (connected && publicKey) {
            const addr = publicKey.toBase58();
            localStorage.setItem('storedId', addr);
            console.log('🔗 Solana Wallet Connected:', addr);

            // Register user in backend
            const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
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

    return (
        <>
            {children}
            <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
            {!connected && (
                <ConnectWalletButton onClick={() => setShowModal(true)} />
            )}
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
