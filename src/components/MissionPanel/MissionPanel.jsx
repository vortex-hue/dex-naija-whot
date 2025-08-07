import React, { useState } from 'react';
import { useHoneycomb } from '../../contexts/HoneycombProvider';
import PlayerTraits from '../PlayerTraits/PlayerTraits';
import LoyaltySystem from '../LoyaltySystem/LoyaltySystem';
import './MissionPanel.css';

const MissionPanel = () => {
    const { playerProfile, missions, loading } = useHoneycomb();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('missions');

    const getMissionTypeIcon = (type) => {
        switch (type) {
            case 'daily': return '📅';
            case 'session': return '⏱️';
            case 'streak': return '🔥';
            case 'achievement': return '🏆';
            default: return '⭐';
        }
    };

    const getProgressPercentage = (mission) => {
        return Math.min((mission.progress / mission.target) * 100, 100);
    };

    if (!playerProfile) return null;

    return (
        <div className={`mission-panel ${isOpen ? 'open' : ''}`}>
            <button 
                className="mission-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title="Missions & Progress"
            >
                🎯 Missions
            </button>
            
            {isOpen && (
                <div className="mission-content">
                    <div className="tab-nav">
                        <button 
                            className={`tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('missions')}
                        >
                            🎯 Missions
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'traits' ? 'active' : ''}`}
                            onClick={() => setActiveTab('traits')}
                        >
                            ⭐ Traits
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'loyalty' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loyalty')}
                        >
                            🔰 Loyalty
                        </button>
                    </div>
                    
                    {activeTab === 'missions' && (
                        <>
                    <div className="player-stats">
                        <div className="profile-header">
                            <h3>{playerProfile.name}</h3>
                            <div className="level-badge">
                                Level {playerProfile.level}
                            </div>
                        </div>
                        
                        <div className="xp-progress">
                            <div className="xp-bar">
                                <div 
                                    className="xp-fill"
                                    style={{ 
                                        width: `${((playerProfile.xp % 1000) / 1000) * 100}%` 
                                    }}
                                ></div>
                            </div>
                            <span className="xp-text">
                                {playerProfile.xp % 1000}/1000 XP
                            </span>
                        </div>
                        
                        <div className="game-stats">
                            <div className="stat">
                                <span className="stat-label">Games Won</span>
                                <span className="stat-value">{playerProfile.gamesWon}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Total Games</span>
                                <span className="stat-value">{playerProfile.gamesPlayed}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Win Rate</span>
                                <span className="stat-value">
                                    {playerProfile.gamesPlayed > 0 
                                        ? Math.round((playerProfile.gamesWon / playerProfile.gamesPlayed) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="missions-list">
                        <h4>Active Missions</h4>
                        {loading ? (
                            <div className="loading">Loading missions...</div>
                        ) : (
                            missions.map(mission => (
                                <div 
                                    key={mission.id} 
                                    className={`mission-item ${mission.completed ? 'completed' : ''}`}
                                >
                                    <div className="mission-header">
                                        <span className="mission-icon">
                                            {getMissionTypeIcon(mission.type)}
                                        </span>
                                        <div className="mission-info">
                                            <h5>{mission.name}</h5>
                                            <p>{mission.description}</p>
                                        </div>
                                        <div className="mission-rewards">
                                            <span className="xp-reward">+{mission.reward.xp} XP</span>
                                            <span className="sol-reward">+{mission.reward.sol} SOL</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mission-progress">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ width: `${getProgressPercentage(mission)}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">
                                            {mission.progress}/{mission.target}
                                        </span>
                                    </div>
                                    
                                    {mission.completed && (
                                        <div className="completed-badge">
                                            ✅ Completed!
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                        </>
                    )}
                    
                    {activeTab === 'traits' && (
                        <PlayerTraits />
                    )}
                    
                    {activeTab === 'loyalty' && (
                        <LoyaltySystem />
                    )}
                </div>
            )}
        </div>
    );
};

export default MissionPanel;