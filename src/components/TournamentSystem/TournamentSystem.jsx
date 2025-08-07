import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createQR, encodeURL } from '@solana/pay';
import QRCode from 'qrcode';
import { useHoneycomb } from '../../contexts/HoneycombProvider';
import { BLOCKCHAIN_CONFIG } from '../../config/blockchain-config';
import './TournamentSystem.css';

const TournamentSystem = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { playerProfile, trackGameEvent, blockchainService, walletBalance } = useHoneycomb();
    const [tournaments, setTournaments] = useState([]);
    const [activeTournament, setActiveTournament] = useState(null);
    const [paymentQR, setPaymentQR] = useState(null);
    const [loading, setLoading] = useState(false);

    // Real tournament wallet from blockchain config
    const TOURNAMENT_WALLET = BLOCKCHAIN_CONFIG.TREASURY_WALLET;

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = () => {
        const mockTournaments = [
            {
                id: 'daily_blitz',
                name: 'Daily Blitz Tournament',
                description: 'Quick 5-minute rounds, winner takes all',
                entryFee: 0.1, // SOL
                prizePool: 0.8, // SOL (80% of entry fees)
                participants: 3,
                maxParticipants: 8,
                startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                duration: 30, // minutes
                status: 'open',
                type: 'elimination',
            },
            {
                id: 'weekly_championship',
                name: 'Weekly Championship',
                description: 'Best of 3 matches, high stakes tournament',
                entryFee: 0.5, // SOL
                prizePool: 3.5, // SOL
                participants: 1,
                maxParticipants: 4,
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                duration: 120, // minutes
                status: 'open',
                type: 'round_robin',
            },
            {
                id: 'beginners_cup',
                name: 'Beginners Cup',
                description: 'For players level 5 and below',
                entryFee: 0.05, // SOL
                prizePool: 0.3, // SOL
                participants: 7,
                maxParticipants: 10,
                startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
                duration: 45, // minutes
                status: 'open',
                type: 'swiss',
                levelRequirement: { max: 5 },
            },
            {
                id: 'masters_league',
                name: 'Masters League',
                description: 'Elite tournament for level 10+ players',
                entryFee: 1.0, // SOL
                prizePool: 7.0, // SOL
                participants: 0,
                maxParticipants: 6,
                startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
                duration: 180, // minutes
                status: 'open',
                type: 'elimination',
                levelRequirement: { min: 10 },
            }
        ];
        
        setTournaments(mockTournaments);
    };

    const canJoinTournament = (tournament) => {
        if (!playerProfile) return false;
        if (tournament.participants >= tournament.maxParticipants) return false;
        
        if (tournament.levelRequirement) {
            if (tournament.levelRequirement.min && playerProfile.level < tournament.levelRequirement.min) {
                return false;
            }
            if (tournament.levelRequirement.max && playerProfile.level > tournament.levelRequirement.max) {
                return false;
            }
        }
        
        return true;
    };

    const generatePaymentQR = async (tournament) => {
        try {
            const transferFields = {
                recipient: TOURNAMENT_WALLET,
                amount: tournament.entryFee,
                reference: new PublicKey(publicKey), // Use player's wallet as reference
                label: `Whot Tournament: ${tournament.name}`,
                message: `Entry fee for ${tournament.name}`,
            };

            const url = encodeURL(transferFields);
            
            // Generate QR code as data URL
            const qrDataURL = await QRCode.toDataURL(url.toString(), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            return qrDataURL;
        } catch (error) {
            console.error('Error generating payment QR:', error);
            return null;
        }
    };

    const joinTournament = async (tournament) => {
        if (!publicKey || !canJoinTournament(tournament)) return;

        setLoading(true);
        try {
            console.log(`🏆 Joining tournament: ${tournament.name}`);
            console.log(`💰 Entry fee: ${tournament.entryFee} SOL`);
            console.log(`💳 Player balance: ${walletBalance} SOL`);
            
            // Check if player has enough SOL
            if (walletBalance < tournament.entryFee) {
                alert(`Insufficient balance. You need ${tournament.entryFee} SOL but only have ${walletBalance.toFixed(3)} SOL`);
                setLoading(false);
                return;
            }

            // Generate QR code for payment
            const qr = await generatePaymentQR(tournament);
            setPaymentQR(qr);
            setActiveTournament(tournament);

            // Create blockchain transaction for tournament entry
            const transaction = await blockchainService.createTournamentEntry(
                publicKey.toString(),
                tournament.id,
                tournament.entryFee
            );

            console.log('🔗 Sending tournament entry transaction...');
            const signature = await sendTransaction(transaction, connection);
            console.log('📝 Transaction signature:', signature);

            // Verify payment on blockchain
            const isVerified = await blockchainService.verifyTournamentPayment(signature);
            
            if (isVerified) {
                // Update tournament participants
                setTournaments(prev => prev.map(t => 
                    t.id === tournament.id 
                        ? { ...t, participants: t.participants + 1 }
                        : t
                ));
                
                // Track tournament entry on blockchain
                await trackGameEvent('tournament_joined', { 
                    tournamentId: tournament.id,
                    entryFee: tournament.entryFee,
                    signature 
                });
                
                alert(`✅ Successfully joined ${tournament.name}!\nTransaction: ${signature}`);
                console.log(`🎉 Tournament entry successful: ${signature}`);
            } else {
                throw new Error('Payment verification failed');
            }

            setPaymentQR(null);
            setActiveTournament(null);

        } catch (error) {
            console.error('❌ Error joining tournament:', error);
            alert(`Failed to join tournament: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getTournamentStatusBadge = (tournament) => {
        const now = new Date();
        if (tournament.startTime <= now) {
            return <span className="status-badge live">🔴 LIVE</span>;
        } else if (tournament.participants >= tournament.maxParticipants) {
            return <span className="status-badge full">FULL</span>;
        } else {
            return <span className="status-badge open">OPEN</span>;
        }
    };

    const formatTimeUntilStart = (startTime) => {
        const now = new Date();
        const diff = startTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const getPrizeDistribution = (tournament) => {
        const total = tournament.prizePool;
        switch (tournament.type) {
            case 'elimination':
                return {
                    '1st': (total * 0.7).toFixed(3),
                    '2nd': (total * 0.2).toFixed(3),
                    '3rd': (total * 0.1).toFixed(3),
                };
            case 'round_robin':
                return {
                    '1st': (total * 0.5).toFixed(3),
                    '2nd': (total * 0.3).toFixed(3),
                    '3rd': (total * 0.2).toFixed(3),
                };
            default:
                return { '1st': total.toFixed(3) };
        }
    };

    if (!publicKey) {
        return (
            <div className="tournament-system">
                <div className="wallet-required">
                    <h3>🔒 Wallet Required</h3>
                    <p>Connect your Solana wallet to participate in tournaments</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tournament-system">
            <div className="tournament-header">
                <h2>🏆 Tournament Arena</h2>
                <p>Compete for SOL prizes in exciting tournaments</p>
            </div>

            <div className="tournaments-grid">
                {tournaments.map(tournament => {
                    const prizeDistribution = getPrizeDistribution(tournament);
                    const canJoin = canJoinTournament(tournament);
                    
                    return (
                        <div key={tournament.id} className={`tournament-card ${!canJoin ? 'disabled' : ''}`}>
                            <div className="tournament-header-card">
                                <h3>{tournament.name}</h3>
                                {getTournamentStatusBadge(tournament)}
                            </div>
                            
                            <p className="tournament-description">{tournament.description}</p>
                            
                            <div className="tournament-details">
                                <div className="detail-row">
                                    <span className="label">Entry Fee:</span>
                                    <span className="value">{tournament.entryFee} SOL</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Prize Pool:</span>
                                    <span className="value prize">{tournament.prizePool} SOL</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Players:</span>
                                    <span className="value">{tournament.participants}/{tournament.maxParticipants}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Starts in:</span>
                                    <span className="value">{formatTimeUntilStart(tournament.startTime)}</span>
                                </div>
                                {tournament.levelRequirement && (
                                    <div className="detail-row">
                                        <span className="label">Level Req:</span>
                                        <span className="value">
                                            {tournament.levelRequirement.min && `${tournament.levelRequirement.min}+`}
                                            {tournament.levelRequirement.max && `≤${tournament.levelRequirement.max}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="prize-breakdown">
                                <h4>Prize Distribution</h4>
                                <div className="prizes">
                                    {Object.entries(prizeDistribution).map(([place, amount]) => (
                                        <div key={place} className="prize-item">
                                            <span className="place">{place}:</span>
                                            <span className="amount">{amount} SOL</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                className={`join-btn ${!canJoin ? 'disabled' : ''}`}
                                onClick={() => joinTournament(tournament)}
                                disabled={!canJoin || loading}
                            >
                                {loading && activeTournament?.id === tournament.id ? (
                                    'Processing...'
                                ) : !canJoin ? (
                                    tournament.participants >= tournament.maxParticipants ? 'Full' : 'Requirements not met'
                                ) : (
                                    `Join for ${tournament.entryFee} SOL`
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {paymentQR && activeTournament && (
                <div className="payment-modal">
                    <div className="payment-content">
                        <button 
                            className="close-btn"
                            onClick={() => {
                                setPaymentQR(null);
                                setActiveTournament(null);
                                setLoading(false);
                            }}
                        >
                            ×
                        </button>
                        <h3>Tournament Entry Payment</h3>
                        <p>Scan QR code to pay {activeTournament.entryFee} SOL</p>
                        <div className="qr-container">
                            {paymentQR && <img src={paymentQR} alt="Payment QR Code" />}
                        </div>
                        <p className="payment-instructions">
                            Use any Solana-compatible wallet to scan and pay
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentSystem;