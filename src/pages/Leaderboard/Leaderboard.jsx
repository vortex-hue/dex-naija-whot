import React, { useState, useEffect } from 'react';
import styles from './Leaderboard.module.css';

import { BackButton } from '../../components';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080'}/api/leaderboard`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLeaderboard(data.leaderboard);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load leaderboard:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className={styles.container}>
            <BackButton style={{ top: '20px', left: '20px', position: 'absolute' }} />
            <div className={styles.header}>
                <h1>🏆 Leaderboard</h1>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading rankings...</div>
            ) : (
                <div className={styles.list}>
                    {leaderboard.length === 0 ? (
                        <div className={styles.empty}>No games played yet!</div>
                    ) : (
                        leaderboard.map((user, index) => (
                            <div key={user.address} className={styles.row}>
                                <div className={styles.rank}>#{index + 1}</div>
                                <div className={styles.address}>
                                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                </div>
                                <div className={styles.stats}>
                                    <span className={styles.xp}>{user.xp} XP</span>
                                    <span className={styles.wins}>{user.wins} Wins</span>
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
