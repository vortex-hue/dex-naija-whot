import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './WalletModal.module.css';

const WALLET_ICONS = {
    'Phantom': 'https://raw.githubusercontent.com/nicholasgasior/phantom-wallet-brand-assets/main/assets/icons/icon-purple.svg',
    'Solflare': 'https://solflare.com/favicon.svg',
    'Backpack': 'https://backpack.exchange/icon.png',
};

const WalletModal = ({ isOpen, onClose }) => {
    const { wallets, select, connecting, connected, publicKey } = useWallet();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSelectWallet = useCallback(async (walletName) => {
        try {
            select(walletName);
        } catch (err) {
            console.error('Wallet connection error:', err);
        }
    }, [select]);

    useEffect(() => {
        if (connected && publicKey) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [connected, publicKey, onClose]);

    if (!isOpen) return null;

    const allWallets = wallets.length > 0 ? wallets : [];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Success State */}
                {showSuccess ? (
                    <div className={styles.successView}>
                        <div className={styles.successIcon}>🎉</div>
                        <h2 className={styles.successTitle}>Wallet Linked Successfully</h2>
                        <p className={styles.successSub}>Welcome to Naija Whot.</p>
                        <p className={styles.successAddr}>
                            {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-6)}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Left: Wallet Selector */}
                        <div className={styles.leftPanel}>
                            <h2 className={styles.title}>Connect Your Wallet</h2>
                            <p className={styles.subtitle}>Select your preferred Solana wallet to start earning.</p>

                            <div className={styles.walletList}>
                                {allWallets.map((wallet, i) => {
                                    const isDetected = wallet.readyState === 'Installed';
                                    const name = wallet.adapter.name;
                                    return (
                                        <button
                                            key={name}
                                            className={`${styles.walletBtn} ${connecting ? styles.walletBtnDisabled : ''}`}
                                            onClick={() => handleSelectWallet(name)}
                                            disabled={connecting}
                                        >
                                            <img
                                                src={WALLET_ICONS[name] || wallet.adapter.icon}
                                                alt={name}
                                                className={styles.walletIcon}
                                            />
                                            <span className={styles.walletName}>{name}</span>
                                            {i === 0 && <span className={styles.popularBadge}>POPULAR</span>}
                                            {isDetected && <span className={styles.detectedDot}></span>}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.newToSolana}>
                                <span className={styles.infoIcon}>ℹ️</span>
                                <span>New to Solana? </span>
                                <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className={styles.getWalletLink}>
                                    Get a wallet
                                </a>
                            </div>
                        </div>

                        {/* Right: Security Info */}
                        <div className={styles.rightPanel}>
                            <button className={styles.closeBtn} onClick={onClose}>✕</button>

                            <div className={styles.section}>
                                <h3 className={styles.sectionLabel}>PRECISION GUARANTEE</h3>
                                <div className={styles.guaranteeItem}>
                                    <span className={styles.checkIcon}>✅</span>
                                    <div>
                                        <strong>Quest Tracking</strong>
                                        <p>We automatically verify your on-chain activity to reward your progress.</p>
                                    </div>
                                </div>
                                <div className={styles.guaranteeItem}>
                                    <span className={styles.checkIcon}>✅</span>
                                    <div>
                                        <strong>Secure Connection</strong>
                                        <p>Uses standardized Solana Wallet Adapter protocols.</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3 className={styles.sectionLabel}>SECURITY PROTOCOL</h3>
                                <div className={styles.guaranteeItem}>
                                    <span className={styles.cancelIcon}>🚫</span>
                                    <div>
                                        <strong>No Private Keys</strong>
                                        <p>We never ask for or store your secret recovery phrases.</p>
                                    </div>
                                </div>
                                <div className={styles.guaranteeItem}>
                                    <span className={styles.cancelIcon}>🚫</span>
                                    <div>
                                        <strong>No Auto-TX</strong>
                                        <p>Transactions require your explicit approval in your wallet.</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.networkBanner}>
                                <div className={styles.networkDot}></div>
                                <div>
                                    <span className={styles.networkLabel}>SOLANA NETWORK</span>
                                    <span className={styles.networkStatus}>Mainnet</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WalletModal;
