import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { blockchainService } from '../services/BlockchainService';

const HoneycombContext = createContext();

export const useHoneycomb = () => {
    const context = useContext(HoneycombContext);
    if (!context) {
        throw new Error('useHoneycomb must be used within HoneycombProvider');
    }
    return context;
};

export const HoneycombProvider = ({ children }) => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    const [playerProfile, setPlayerProfile] = useState(null);
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        if (publicKey && connection) {
            initializeHoneycomb();
        }
    }, [publicKey, connection]);

    const initializeHoneycomb = async () => {
        try {
            setLoading(true);
            
            console.log('🔗 Connecting to blockchain...');
            console.log('🔑 Wallet:', publicKey.toString());
            
            // Get wallet balance
            const balance = await blockchainService.getWalletBalance(publicKey.toString());
            setWalletBalance(balance);
            console.log('💰 Wallet balance:', balance, 'SOL');
            
            // Initialize or load player profile from blockchain
            const profile = await blockchainService.getPlayerProfile(publicKey.toString());
            setPlayerProfile(profile);
            console.log('👤 Player profile loaded:', profile);
            
            // Load missions
            await loadMissions(profile);
            
            console.log('✅ Blockchain connection established!');
        } catch (error) {
            console.error('❌ Failed to initialize blockchain connection:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMissions = async (profile) => {
        try {
            // Load missions from blockchain/profile
            const playerMissions = profile.missions || [];
            
            // Default missions if none exist
            const defaultMissions = [
                {
                    id: 'daily_wins',
                    name: 'Daily Victory',
                    description: 'Win 3 games today',
                    type: 'daily',
                    target: 3,
                    progress: 0,
                    reward: { xp: 100, sol: 0.01 },
                    completed: false,
                },
                {
                    id: 'card_master',
                    name: 'Card Master',
                    description: 'Play 50 cards in one session',
                    type: 'session',
                    target: 50,
                    progress: 0,
                    reward: { xp: 200, sol: 0.02 },
                    completed: false,
                },
                {
                    id: 'win_streak',
                    name: 'Win Streak',
                    description: 'Win 5 games in a row',
                    type: 'streak',
                    target: 5,
                    progress: 0,
                    reward: { xp: 300, sol: 0.05 },
                    completed: false,
                },
                {
                    id: 'first_victory',
                    name: 'First Victory',
                    description: 'Win your first game',
                    type: 'achievement',
                    target: 1,
                    progress: 0,
                    reward: { xp: 50, sol: 0.005 },
                    completed: false,
                }
            ];
            
            // Merge player missions with defaults
            const activeMissions = defaultMissions.map(defaultMission => {
                const playerMission = playerMissions.find(pm => pm.id === defaultMission.id);
                return playerMission || defaultMission;
            });
            
            setMissions(activeMissions);
        } catch (error) {
            console.error('Error loading missions:', error);
        }
    };

    const updateMissionProgress = async (missionId, increment = 1) => {
        try {
            console.log(`🎯 Updating mission progress: ${missionId} +${increment}`);
            
            // Update on blockchain
            const updatedProfile = await blockchainService.updateMissionProgress(
                publicKey.toString(), 
                missionId, 
                increment
            );
            
            // Update local state
            setPlayerProfile(updatedProfile);
            
            // Reload missions to reflect changes
            await loadMissions(updatedProfile);
            
            console.log(`✅ Mission progress updated on blockchain`);
        } catch (error) {
            console.error('❌ Error updating mission progress:', error);
        }
    };

    const awardXP = async (amount) => {
        try {
            if (playerProfile && publicKey) {
                console.log(`✨ Awarding ${amount} XP to player`);
                
                const updatedProfile = await blockchainService.updatePlayerProfile(
                    publicKey.toString(),
                    { xp: playerProfile.xp + amount }
                );
                
                setPlayerProfile(updatedProfile);
                
                console.log(`💫 XP awarded on blockchain: ${amount}`);
                
                // Check for level up
                if (updatedProfile.level > playerProfile.level) {
                    console.log(`🎉 Level up! You are now level ${updatedProfile.level}`);
                }
            }
        } catch (error) {
            console.error('❌ Error awarding XP:', error);
        }
    };

    const trackGameEvent = async (eventType, data = {}) => {
        try {
            if (!publicKey || !playerProfile) return;
            
            console.log(`🎮 Tracking game event: ${eventType}`, data);
            
            switch (eventType) {
                case 'game_started':
                    console.log('🕹️ Game started - tracking on blockchain');
                    break;
                case 'game_won':
                    await updateMissionProgress('daily_wins');
                    await updateMissionProgress('first_victory');
                    await updateMissionProgress('win_streak');
                    await awardXP(50); // Base XP for winning
                    
                    await blockchainService.updatePlayerProfile(publicKey.toString(), {
                        gamesWon: playerProfile.gamesWon + 1,
                        gamesPlayed: playerProfile.gamesPlayed + 1,
                    });
                    break;
                case 'game_lost':
                    await blockchainService.updatePlayerProfile(publicKey.toString(), {
                        gamesPlayed: playerProfile.gamesPlayed + 1,
                    });
                    
                    // Reset win streak on blockchain
                    await blockchainService.updateMissionProgress(
                        publicKey.toString(), 
                        'win_streak', 
                        -999 // Reset to 0
                    );
                    break;
                case 'card_played':
                    await updateMissionProgress('card_master');
                    await awardXP(1); // Small XP for each card played
                    break;
                default:
                    break;
            }
            
            console.log(`✅ Game event tracked on blockchain: ${eventType}`);
        } catch (error) {
            console.error('❌ Error tracking game event:', error);
        }
    };

    const value = {
        playerProfile,
        missions,
        loading,
        walletBalance,
        updateMissionProgress,
        awardXP,
        trackGameEvent,
        initializeHoneycomb,
        blockchainService,
    };

    return (
        <HoneycombContext.Provider value={value}>
            {children}
        </HoneycombContext.Provider>
    );
};