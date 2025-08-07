import React, { useState } from 'react';
import { useHoneycomb } from '../../contexts/HoneycombProvider';
import './PlayerTraits.css';

const PlayerTraits = () => {
    const { playerProfile, awardXP } = useHoneycomb();
    const [selectedTrait, setSelectedTrait] = useState(null);

    const availableTraits = [
        {
            id: 'card_master',
            name: 'Card Master',
            description: 'Gain 50% more XP for each card played',
            icon: '🃏',
            levelRequired: 5,
            cost: 100,
            effect: 'card_xp_boost',
            multiplier: 1.5,
            unlocked: false,
        },
        {
            id: 'victory_rush',
            name: 'Victory Rush',
            description: 'Gain double XP for winning games',
            icon: '🏆',
            levelRequired: 3,
            cost: 150,
            effect: 'win_xp_boost',
            multiplier: 2.0,
            unlocked: false,
        },
        {
            id: 'strategic_mind',
            name: 'Strategic Mind',
            description: 'See opponent\'s next card (computer games only)',
            icon: '🧠',
            levelRequired: 8,
            cost: 300,
            effect: 'card_preview',
            unlocked: false,
        },
        {
            id: 'lucky_charm',
            name: 'Lucky Charm',
            description: 'Higher chance of drawing favorable cards',
            icon: '🍀',
            levelRequired: 6,
            cost: 200,
            effect: 'card_luck',
            unlocked: false,
        },
        {
            id: 'whot_legend',
            name: 'Whot Legend',
            description: 'All XP bonuses are doubled',
            icon: '👑',
            levelRequired: 15,
            cost: 500,
            effect: 'legend_status',
            multiplier: 2.0,
            unlocked: false,
        },
        {
            id: 'speed_player',
            name: 'Speed Player',
            description: 'Bonus XP for quick moves (under 5 seconds)',
            icon: '⚡',
            levelRequired: 4,
            cost: 120,
            effect: 'speed_bonus',
            unlocked: false,
        }
    ];

    const getPlayerTraits = () => {
        if (!playerProfile || !playerProfile.traits) return [];
        return playerProfile.traits;
    };

    const canUnlockTrait = (trait) => {
        if (!playerProfile) return false;
        return (
            playerProfile.level >= trait.levelRequired &&
            playerProfile.xp >= trait.cost &&
            !getPlayerTraits().includes(trait.id)
        );
    };

    const isTraitUnlocked = (traitId) => {
        return getPlayerTraits().includes(traitId);
    };

    const unlockTrait = async (trait) => {
        if (!canUnlockTrait(trait)) return;

        try {
            // Deduct XP cost and add trait
            await awardXP(-trait.cost);
            
            // In a real implementation, this would update the blockchain
            console.log(`Trait "${trait.name}" unlocked!`);
            
            // Update local state (in real app, this would come from blockchain)
            if (playerProfile) {
                playerProfile.traits = [...(playerProfile.traits || []), trait.id];
            }
            
        } catch (error) {
            console.error('Error unlocking trait:', error);
        }
    };

    const getTraitEffect = (traitId) => {
        const trait = availableTraits.find(t => t.id === traitId);
        return trait ? trait.effect : null;
    };

    const getXPMultiplier = (context = 'general') => {
        const playerTraits = getPlayerTraits();
        let multiplier = 1.0;

        playerTraits.forEach(traitId => {
            const trait = availableTraits.find(t => t.id === traitId);
            if (!trait) return;

            switch (trait.effect) {
                case 'card_xp_boost':
                    if (context === 'card_played') {
                        multiplier *= trait.multiplier;
                    }
                    break;
                case 'win_xp_boost':
                    if (context === 'game_won') {
                        multiplier *= trait.multiplier;
                    }
                    break;
                case 'legend_status':
                    multiplier *= trait.multiplier;
                    break;
                default:
                    break;
            }
        });

        return multiplier;
    };

    if (!playerProfile) return null;

    return (
        <div className="player-traits">
            <h3>Player Traits</h3>
            <div className="traits-grid">
                {availableTraits.map(trait => {
                    const unlocked = isTraitUnlocked(trait.id);
                    const canUnlock = canUnlockTrait(trait);
                    const levelLocked = playerProfile.level < trait.levelRequired;

                    return (
                        <div 
                            key={trait.id} 
                            className={`trait-card ${unlocked ? 'unlocked' : ''} ${canUnlock ? 'available' : ''} ${levelLocked ? 'level-locked' : ''}`}
                            onClick={() => setSelectedTrait(trait)}
                        >
                            <div className="trait-icon">{trait.icon}</div>
                            <div className="trait-info">
                                <h4>{trait.name}</h4>
                                <p>{trait.description}</p>
                                <div className="trait-requirements">
                                    <span className="level-req">
                                        Level {trait.levelRequired}
                                        {levelLocked && ' 🔒'}
                                    </span>
                                    {!unlocked && (
                                        <span className="cost">
                                            {trait.cost} XP
                                        </span>
                                    )}
                                </div>
                            </div>
                            {unlocked && (
                                <div className="unlocked-badge">✅</div>
                            )}
                            {canUnlock && !unlocked && (
                                <button 
                                    className="unlock-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        unlockTrait(trait);
                                    }}
                                >
                                    Unlock
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedTrait && (
                <div className="trait-modal" onClick={() => setSelectedTrait(null)}>
                    <div className="trait-modal-content" onClick={e => e.stopPropagation()}>
                        <button 
                            className="close-btn"
                            onClick={() => setSelectedTrait(null)}
                        >
                            ×
                        </button>
                        <div className="trait-detail">
                            <div className="trait-header">
                                <span className="trait-icon-large">{selectedTrait.icon}</span>
                                <h2>{selectedTrait.name}</h2>
                            </div>
                            <p className="trait-description">{selectedTrait.description}</p>
                            <div className="trait-stats">
                                <div className="stat">
                                    <label>Level Required:</label>
                                    <span>{selectedTrait.levelRequired}</span>
                                </div>
                                <div className="stat">
                                    <label>XP Cost:</label>
                                    <span>{selectedTrait.cost}</span>
                                </div>
                                {selectedTrait.multiplier && (
                                    <div className="stat">
                                        <label>Multiplier:</label>
                                        <span>{selectedTrait.multiplier}x</span>
                                    </div>
                                )}
                            </div>
                            {canUnlockTrait(selectedTrait) && !isTraitUnlocked(selectedTrait.id) && (
                                <button 
                                    className="unlock-btn-large"
                                    onClick={() => {
                                        unlockTrait(selectedTrait);
                                        setSelectedTrait(null);
                                    }}
                                >
                                    Unlock Trait
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Export XP multiplier function for use by other components */}
            <script>
                {`window.getXPMultiplier = ${getXPMultiplier.toString()};`}
            </script>
        </div>
    );
};

export default PlayerTraits;
export { PlayerTraits };