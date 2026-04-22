import React, { useState, useEffect } from 'react';
import styles from './Leaderboard.module.css';

import { BackButton } from '../../components';

const API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';

const Leaderboard = () => {
    const [allTimeBoard, setAllTimeBoard] = useState([]);
    const [weeklyBoard, setWeeklyBoard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('weekly');

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/leaderboard`).then(r => r.json()),
            fetch(`${API_URL}/api/weekly-leaderboard`).then(r => r.json())
        ])
        .then(([allTime, weekly]) => {
            if (allTime.success) setAllTimeBoard(allTime.leaderboard);
            if (weekly.success) setWeeklyBoard(weekly.leaderboard);
            setLoading(false);
        })
        .catch(err => {
            console.error("Failed to load leaderboard:", err);
            setLoading(false);
        });
    }, []);

    const board = activeTab === 'weekly' ? weeklyBoard : allTimeBoard;

    return (
        <div className={styles.container}>
            <BackButton style={{ top: '20px', left: '20px', position: 'absolute' }} />
            <div className={styles.header}>
                <h1>🏆 Leaderboard</h1>
            </div>

            {/* Tab Switcher */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'weekly' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('weekly')}
                >
                    📅 This Week
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'alltime' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('alltime')}
                >
                    🌟 All Time
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading rankings...</div>
            ) : (
                <div className={styles.list}>
                    {board.length === 0 ? (
                        <div className={styles.empty}>
                            {activeTab === 'weekly' ? 'No games played this week yet!' : 'No games played yet!'}
                        </div>
                    ) : (
                        board.map((user, index) => (
                            <div key={user.address} className={styles.row}>
                                <div className={styles.rank}>#{index + 1}</div>
                                <div className={styles.address}>
                                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                </div>
                                <div className={styles.stats}>
                                    {activeTab === 'weekly' ? (
                                        <>
                                            <span className={styles.xp}>{user.weekly_points} pts</span>
                                            {user.streak_count > 0 && (
                                                <span className={styles.streak}>🔥{user.streak_count}</span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span className={styles.xp}>{user.points || user.xp} pts</span>
                                            <span className={styles.wins}>{user.wins} W</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
