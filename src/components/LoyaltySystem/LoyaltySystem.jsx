import React, { useState, useEffect } from 'react';
import { useHoneycomb } from '../../contexts/HoneycombProvider';
import './LoyaltySystem.css';

const LoyaltySystem = () => {
    const { playerProfile, awardXP } = useHoneycomb();
    const [loyaltyData, setLoyaltyData] = useState(null);
    const [streak, setStreak] = useState(0);
    const [lastLoginDate, setLastLoginDate] = useState(null);

    const loyaltyTiers = [
        {
            id: 'bronze',
            name: 'Bronze',
            minPoints: 0,
            maxPoints: 999,
            color: '#CD7F32',
            icon: '🥉',
            benefits: [
                '1.1x XP multiplier',
                'Daily login bonus: 5 XP',
                'Basic player badge'
            ],
            multiplier: 1.1,
            dailyBonus: 5,
        },
        {
            id: 'silver',
            name: 'Silver',
            minPoints: 1000,
            maxPoints: 2999,
            color: '#C0C0C0',
            icon: '🥈',
            benefits: [
                '1.25x XP multiplier',
                'Daily login bonus: 10 XP',
                'Silver player badge',
                'Access to silver tournaments'
            ],
            multiplier: 1.25,
            dailyBonus: 10,
        },
        {
            id: 'gold',
            name: 'Gold',
            minPoints: 3000,
            maxPoints: 6999,
            color: '#FFD700',
            icon: '🥇',
            benefits: [
                '1.5x XP multiplier',
                'Daily login bonus: 20 XP',
                'Gold player badge',
                'Priority tournament entry',
                'Exclusive gold tournaments'
            ],
            multiplier: 1.5,
            dailyBonus: 20,
        },
        {
            id: 'platinum',
            name: 'Platinum',
            minPoints: 7000,
            maxPoints: 14999,
            color: '#E5E4E2',
            icon: '💎',
            benefits: [
                '2.0x XP multiplier',
                'Daily login bonus: 35 XP',
                'Platinum player badge',
                'VIP tournament access',
                'Custom card backs',
                'Priority customer support'
            ],
            multiplier: 2.0,
            dailyBonus: 35,
        },
        {
            id: 'diamond',
            name: 'Diamond',
            minPoints: 15000,
            maxPoints: Infinity,
            color: '#B9F2FF',
            icon: '💍',
            benefits: [
                '3.0x XP multiplier',
                'Daily login bonus: 50 XP',
                'Diamond player badge',
                'Exclusive diamond tournaments',
                'Custom emotes and animations',
                'Direct line to developers',
                'Special tournament invitations'
            ],
            multiplier: 3.0,
            dailyBonus: 50,
        }
    ];

    useEffect(() => {
        if (playerProfile) {
            initializeLoyaltyData();
            checkDailyLogin();
        }
    }, [playerProfile]);

    const initializeLoyaltyData = () => {
        const loyaltyPoints = calculateLoyaltyPoints();
        const currentTier = getCurrentTier(loyaltyPoints);
        
        setLoyaltyData({
            points: loyaltyPoints,
            tier: currentTier,
            streakCount: getStreakCount(),
            totalLogins: getTotalLogins(),
            lastLogin: getLastLogin(),
        });
    };

    const calculateLoyaltyPoints = () => {
        if (!playerProfile) return 0;
        
        // Base points from XP and games played
        const xpPoints = Math.floor(playerProfile.xp / 10);
        const gamePoints = playerProfile.gamesPlayed * 5;
        const winPoints = playerProfile.gamesWon * 10;
        
        // Bonus points from streaks and consistency
        const streakBonus = Math.floor(streak / 7) * 50; // 50 points per week streak
        
        return xpPoints + gamePoints + winPoints + streakBonus;
    };

    const getCurrentTier = (points) => {
        return loyaltyTiers.find(tier => 
            points >= tier.minPoints && points <= tier.maxPoints
        ) || loyaltyTiers[0];
    };

    const getNextTier = (currentTier) => {
        const currentIndex = loyaltyTiers.findIndex(tier => tier.id === currentTier.id);
        return currentIndex < loyaltyTiers.length - 1 ? loyaltyTiers[currentIndex + 1] : null;
    };

    const getStreakCount = () => {
        const storedStreak = localStorage.getItem('whot_login_streak');
        return storedStreak ? parseInt(storedStreak) : 0;
    };

    const getTotalLogins = () => {
        const storedLogins = localStorage.getItem('whot_total_logins');
        return storedLogins ? parseInt(storedLogins) : 1;
    };

    const getLastLogin = () => {
        const storedDate = localStorage.getItem('whot_last_login');
        return storedDate ? new Date(storedDate) : new Date();
    };

    const checkDailyLogin = () => {
        const today = new Date();
        const lastLogin = getLastLogin();
        const currentStreak = getStreakCount();
        
        // Check if it's a new day
        const isNewDay = today.toDateString() !== lastLogin.toDateString();
        
        if (isNewDay) {
            const daysDifference = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
            
            let newStreak = currentStreak;
            if (daysDifference === 1) {
                // Consecutive day - increment streak
                newStreak = currentStreak + 1;
            } else if (daysDifference > 1) {
                // Missed days - reset streak
                newStreak = 1;
            }
            
            // Update storage
            localStorage.setItem('whot_login_streak', newStreak.toString());
            localStorage.setItem('whot_last_login', today.toISOString());
            localStorage.setItem('whot_total_logins', (getTotalLogins() + 1).toString());
            
            // Award daily bonus
            const currentTier = getCurrentTier(calculateLoyaltyPoints());
            awardDailyBonus(currentTier, newStreak);
            
            setStreak(newStreak);
            setLastLoginDate(today);
        } else {
            setStreak(currentStreak);
            setLastLoginDate(lastLogin);
        }
    };

    const awardDailyBonus = (tier, streakCount) => {
        let bonusXP = tier.dailyBonus;
        
        // Streak multipliers
        if (streakCount >= 30) bonusXP *= 3; // Monthly streak
        else if (streakCount >= 14) bonusXP *= 2; // Bi-weekly streak
        else if (streakCount >= 7) bonusXP *= 1.5; // Weekly streak
        
        awardXP(bonusXP);
        
        // Show notification
        console.log(`Daily bonus awarded: ${bonusXP} XP (${streakCount} day streak)`);
    };

    const getProgressToNextTier = () => {
        if (!loyaltyData) return 0;
        
        const nextTier = getNextTier(loyaltyData.tier);
        if (!nextTier) return 100; // Max tier reached
        
        const currentPoints = loyaltyData.points;
        const currentTierMin = loyaltyData.tier.minPoints;
        const nextTierMin = nextTier.minPoints;
        
        const progress = ((currentPoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100;
        return Math.min(progress, 100);
    };

    const getStreakBonus = () => {
        if (streak < 7) return 'none';
        if (streak < 14) return 'weekly';
        if (streak < 30) return 'biweekly';
        return 'monthly';
    };

    const getStreakBonusMultiplier = () => {
        const bonus = getStreakBonus();
        switch (bonus) {
            case 'weekly': return 1.5;
            case 'biweekly': return 2.0;
            case 'monthly': return 3.0;
            default: return 1.0;
        }
    };

    if (!playerProfile || !loyaltyData) {
        return <div className="loyalty-loading">Loading loyalty data...</div>;
    }

    const nextTier = getNextTier(loyaltyData.tier);
    const progressPercent = getProgressToNextTier();

    return (
        <div className="loyalty-system">
            <div className="loyalty-header">
                <h3>🔰 Loyalty Status</h3>
            </div>

            <div className="current-tier">
                <div className="tier-badge" style={{ background: loyaltyData.tier.color }}>
                    <span className="tier-icon">{loyaltyData.tier.icon}</span>
                    <span className="tier-name">{loyaltyData.tier.name}</span>
                </div>
                <div className="tier-points">
                    {loyaltyData.points.toLocaleString()} points
                </div>
            </div>

            {nextTier && (
                <div className="tier-progress">
                    <div className="progress-header">
                        <span>Progress to {nextTier.name}</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ 
                                width: `${progressPercent}%`,
                                background: nextTier.color 
                            }}
                        ></div>
                    </div>
                    <div className="progress-text">
                        {nextTier.minPoints - loyaltyData.points} points to go
                    </div>
                </div>
            )}

            <div className="streak-info">
                <div className="streak-display">
                    <span className="streak-icon">🔥</span>
                    <div className="streak-details">
                        <span className="streak-count">{streak} Day Streak</span>
                        <span className="streak-bonus">
                            {getStreakBonusMultiplier()}x daily bonus
                        </span>
                    </div>
                </div>
            </div>

            <div className="tier-benefits">
                <h4>Current Benefits</h4>
                <ul>
                    {loyaltyData.tier.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                    ))}
                </ul>
            </div>

            <div className="loyalty-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Logins</span>
                    <span className="stat-value">{loyaltyData.totalLogins}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">XP Multiplier</span>
                    <span className="stat-value">{loyaltyData.tier.multiplier}x</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Daily Bonus</span>
                    <span className="stat-value">{loyaltyData.tier.dailyBonus} XP</span>
                </div>
            </div>
        </div>
    );
};

export default LoyaltySystem;