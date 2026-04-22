import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './WalletHeader.module.css';

const NAV_LINKS = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/play-computer', label: 'Play', icon: '🎮' },
    { path: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '📊' },
    { path: '/rewards', label: 'Rewards', icon: '💰' },
];

const WalletHeader = () => {
    const { publicKey, disconnect, wallet } = useWallet();
    const [copied, setCopied] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

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

    const handleNavClick = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
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
        <>
            <div className={styles.headerBar}>
                {/* Logo */}
                <div className={styles.left} onClick={() => navigate('/')}>
                    <span className={styles.logo}>🃏</span>
                    <span className={styles.appName}>WhotChain</span>
                </div>

                {/* Desktop Nav */}
                <nav className={styles.nav}>
                    {NAV_LINKS.map(link => (
                        <button
                            key={link.path}
                            className={`${styles.navLink} ${location.pathname === link.path ? styles.navLinkActive : ''}`}
                            onClick={() => handleNavClick(link.path)}
                        >
                            <span className={styles.navIcon}>{link.icon}</span>
                            <span className={styles.navLabel}>{link.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Wallet + Mobile Menu Toggle */}
                <div className={styles.right}>
                    {/* Wallet button */}
                    <div ref={dropdownRef} className={styles.walletWrapper}>
                        <button
                            className={styles.walletBtn}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {wallet?.adapter?.icon && (
                                <img src={wallet.adapter.icon} alt="" className={styles.walletIcon} />
                            )}
                            <span className={styles.address}>{truncated}</span>
                            <span className={styles.chevron}>▾</span>
                        </button>

                        {showDropdown && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <span className={styles.dropdownLabel}>Connected via {wallet?.adapter?.name}</span>
                                </div>
                                <div className={styles.fullAddress}>{address}</div>
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

                    {/* Mobile hamburger */}
                    <button
                        className={styles.hamburger}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Drawer */}
            {mobileMenuOpen && (
                <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
                    <nav className={styles.mobileNav} onClick={(e) => e.stopPropagation()}>
                        {NAV_LINKS.map(link => (
                            <button
                                key={link.path}
                                className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.mobileNavLinkActive : ''}`}
                                onClick={() => handleNavClick(link.path)}
                            >
                                <span className={styles.mobileNavIcon}>{link.icon}</span>
                                <span>{link.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Spacer so content isn't hidden behind fixed header */}
            <div className={styles.headerSpacer} />
        </>
    );
};

export default WalletHeader;
