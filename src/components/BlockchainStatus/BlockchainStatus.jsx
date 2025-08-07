import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useHoneycomb } from '../../contexts/HoneycombProvider';
import { BLOCKCHAIN_CONFIG } from '../../config/blockchain-config';
import './BlockchainStatus.css';

const BlockchainStatus = () => {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const { playerProfile, walletBalance, blockchainService } = useHoneycomb();
    const [networkStats, setNetworkStats] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        checkConnection();
        if (connected && publicKey) {
            loadNetworkStats();
            const interval = setInterval(loadNetworkStats, 30000); // Update every 30 seconds
            return () => clearInterval(interval);
        }
    }, [connected, publicKey]);

    const checkConnection = async () => {
        try {
            const slot = await connection.getSlot();
            setIsConnected(slot > 0);
        } catch (error) {
            setIsConnected(false);
        }
    };

    const loadNetworkStats = async () => {
        try {
            const stats = await blockchainService.getRealtimeGameStats();
            setNetworkStats(stats);
        } catch (error) {
            console.error('Error loading network stats:', error);
        }
    };

    if (!connected || !publicKey) {
        return (
            <div className="blockchain-status disconnected">
                <div className="status-indicator">
                    <span className="status-dot offline"></span>
                    <span>Connect Wallet for Blockchain Features</span>
                </div>
            </div>
        );
    }

    return (
        <div className="blockchain-status connected">
            <div className="status-header">
                <div className="status-indicator">
                    <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                    <span>Blockchain: {isConnected ? 'Connected' : 'Connecting...'}</span>
                </div>
                <div className="network-info">
                    Solana {BLOCKCHAIN_CONFIG.network}
                </div>
            </div>
            
            {playerProfile && (
                <div className="player-blockchain-info">
                    <div className="wallet-info">
                        <div className="wallet-address">
                            {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
                        </div>
                        <div className="wallet-balance">
                            {walletBalance?.toFixed(4) || '0.0000'} SOL
                        </div>
                    </div>
                    
                    <div className="blockchain-data">
                        <div className="data-item">
                            <span className="label">XP (On-Chain):</span>
                            <span className="value">{playerProfile.xp}</span>
                        </div>
                        <div className="data-item">
                            <span className="label">Level:</span>
                            <span className="value">{playerProfile.level}</span>
                        </div>
                        <div className="data-item">
                            <span className="label">Games Won:</span>
                            <span className="value">{playerProfile.gamesWon}</span>
                        </div>
                    </div>
                </div>
            )}

            {networkStats && (
                <div className="network-stats">
                    <h4>🌐 Global Stats</h4>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{networkStats.totalPlayers?.toLocaleString()}</span>
                            <span className="stat-label">Players</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{networkStats.totalGamesPlayed?.toLocaleString()}</span>
                            <span className="stat-label">Games Played</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{networkStats.totalRewardsDistributed}</span>
                            <span className="stat-label">SOL Distributed</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{networkStats.activeTournaments}</span>
                            <span className="stat-label">Active Tournaments</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="blockchain-features">
                <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <span>Missions: On-Chain</span>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">💰</span>
                    <span>Payments: Solana Pay</span>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">🏆</span>
                    <span>Tournaments: Live</span>
                </div>
                <div className="feature-item">
                    <span className="feature-icon">⭐</span>
                    <span>Traits: Blockchain</span>
                </div>
            </div>
        </div>
    );
};

export default BlockchainStatus;