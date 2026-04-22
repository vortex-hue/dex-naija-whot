import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './WalletHeader.module.css';

const WalletHeader = () => {
    const { publicKey, disconnect, wallet } = useWallet();
    const [copied, setCopied] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const address = publicKey?.toBase58() || '';
    const truncated = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const handleDisconnect = () => {
        disconnect();
        setShowDropdown(false);
        localStorage.removeItem('storedId');
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!publicKey) return null;

    return (
        <div className={styles.headerBar}>
            <div className={styles.left}>
                <span className={styles.logo}>🃏</span>
                <span className={styles.appName}>Naija Whot</span>
            </div>

            <div className={styles.right} ref={dropdownRef}>
                <button
                    className={styles.walletBtn}
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    {wallet?.adapter?.icon && (
                        <img
                            src={wallet.adapter.icon}
                            alt=""
                            className={styles.walletIcon}
                        />
                    )}
                    <span className={styles.address}>{truncated}</span>
                    <button
                        className={styles.copyBtn}
                        onClick={handleCopy}
                        title="Copy address"
                    >
                        {copied ? '✓' : '📋'}
                    </button>
                    <span className={styles.chevron}>▾</span>
                </button>

                {showDropdown && (
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <span className={styles.dropdownLabel}>Connected via {wallet?.adapter?.name}</span>
                        </div>
                        <div className={styles.fullAddress}>
                            {address}
                        </div>
                        <button className={styles.copyFullBtn} onClick={handleCopy}>
                            {copied ? '✓ Copied!' : '📋 Copy Address'}
                        </button>
                        <hr className={styles.divider} />
                        <button className={styles.disconnectBtn} onClick={handleDisconnect}>
                            🔌 Disconnect Wallet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletHeader;
