import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { BackButton } from '../../components';
import styles from './Rewards.module.css';
import { getApiUrl } from '../../utils/apiUrl';

const API_URL = getApiUrl();

const SCORING_TABLE = [
    { action: 'First game of the day', points: '+10', icon: '☀️' },
    { action: 'Win a solo game', points: '+25', icon: '🎮' },
    { action: 'Lose a game (participation)', points: '+5', icon: '💪' },
    { action: 'Win a PvP match', points: '+50', icon: '⚔️' },
    { action: '7-day streak bonus', points: '+100', icon: '🔥' },
    { action: '30-day streak bonus', points: '+500', icon: '🔥🔥' },
];

const Rewards = () => {
    const { publicKey, connected } = useWallet();
    const address = publicKey?.toBase58();
    const isConnected = connected;
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [solanaInput, setSolanaInput] = useState('');
    const [linkStatus, setLinkStatus] = useState('');

    useEffect(() => {
        if (isConnected && address) {
            fetch(`${API_URL}/api/user/${address}/points`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setStats(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isConnected, address]);

    const handleLinkSolana = async () => {
        if (!solanaInput || solanaInput.length < 32) {
            setLinkStatus('Please enter a valid Solana address');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/link-solana`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, solanaAddress: solanaInput })
            });
            const data = await res.json();
            if (data.success) {
                setLinkStatus('✅ Solana wallet linked!');
                setStats(prev => ({ ...prev, solana_address: solanaInput }));
            } else {
                setLinkStatus('❌ ' + data.message);
            }
        } catch (err) {
            setLinkStatus('❌ Network error');
        }
    };

    // Calculate next Sunday midnight UTC
    const now = new Date();
    const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
    nextSunday.setUTCHours(0, 0, 0, 0);
    const hoursLeft = Math.max(0, Math.floor((nextSunday - now) / (1000 * 60 * 60)));
    const daysLeft = Math.floor(hoursLeft / 24);

    // Build streak calendar (last 30 days)
    const streakDays = [];
    if (stats) {
        const lastPlayed = stats.last_played_date ? new Date(stats.last_played_date) : null;
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const isActive = lastPlayed && stats.streak_count > 0 && i < stats.streak_count;
            streakDays.push({ date: dateStr, day: d.getDate(), active: isActive });
        }
    }

    return (
        <div className={styles.container}>
            <BackButton style={{ top: '20px', left: '20px', position: 'absolute' }} />

            <motion.div
                className={styles.content}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className={styles.title}>🏆 Rewards</h1>
                <p className={styles.subtitle}>Earn points by playing, convert to USDC weekly</p>

                {!isConnected ? (
                    <div className={styles.connectPrompt}>
                        Connect your wallet to see your rewards
                    </div>
                ) : loading ? (
                    <div className={styles.loading}>Loading your stats...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>⭐</span>
                                <span className={styles.statNum}>{stats?.points || 0}</span>
                                <span className={styles.statDesc}>Total Points</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>📈</span>
                                <span className={styles.statNum}>{stats?.weekly_points || 0}</span>
                                <span className={styles.statDesc}>This Week</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>🔥</span>
                                <span className={styles.statNum}>{stats?.streak_count || 0}</span>
                                <span className={styles.statDesc}>Day Streak</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statEmoji}>⏱️</span>
                                <span className={styles.statNum}>{daysLeft}d {hoursLeft % 24}h</span>
                                <span className={styles.statDesc}>Next Payout</span>
                            </div>
                        </div>

                        {/* Streak Calendar */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>🗓️ Streak Calendar</h2>
                            <div className={styles.calendar}>
                                {streakDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.calDay} ${day.active ? styles.calActive : ''}`}
                                        title={day.date}
                                    >
                                        {day.day}
                                    </div>
                                ))}
                            </div>
                            <p className={styles.calHint}>
                                {stats?.streak_count >= 7
                                    ? `🔥 Amazing! ${stats.streak_count}-day streak! ${stats.streak_count >= 30 ? '🎉 30-day bonus earned!' : `${30 - stats.streak_count} more days for 500pt bonus!`}`
                                    : stats?.streak_count > 0
                                    ? `Keep it up! ${7 - stats.streak_count} more days for 100pt bonus!`
                                    : 'Play today to start your streak!'}
                            </p>
                        </div>

                        {/* How Points Work */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>📊 How Points Work</h2>
                            <div className={styles.scoringTable}>
                                {SCORING_TABLE.map((item, i) => (
                                    <div key={i} className={styles.scoringRow}>
                                        <span className={styles.scoringIcon}>{item.icon}</span>
                                        <span className={styles.scoringAction}>{item.action}</span>
                                        <span className={styles.scoringPoints}>{item.points}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Link Solana Wallet */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>🔗 Solana Wallet</h2>
                            {stats?.solana_address ? (
                                <div className={styles.linkedWallet}>
                                    <span>✅ Linked: </span>
                                    <span className={styles.walletAddr}>
                                        {stats.solana_address.slice(0, 8)}...{stats.solana_address.slice(-6)}
                                    </span>
                                </div>
                            ) : (
                                <div className={styles.linkForm}>
                                    <p className={styles.linkHint}>Link a Solana wallet to receive USDC rewards</p>
                                    <div className={styles.linkInputRow}>
                                        <input
                                            type="text"
                                            placeholder="Enter Solana wallet address..."
                                            value={solanaInput}
                                            onChange={e => setSolanaInput(e.target.value)}
                                            className={styles.linkInput}
                                        />
                                        <button onClick={handleLinkSolana} className={styles.linkBtn}>
                                            Link
                                        </button>
                                    </div>
                                    {linkStatus && <p className={styles.linkStatus}>{linkStatus}</p>}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default Rewards;
