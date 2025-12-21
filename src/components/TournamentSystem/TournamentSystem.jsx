import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import socket from '../../socket/socket';
import { useNavigate } from 'react-router-dom';
import './TournamentSystem.css';
import { generateRandomCode } from '../../utils/functions/generateRandomCode';

const TournamentSystem = () => {
    const navigate = useNavigate();

    // State
    const [tournaments, setTournaments] = useState([]);
    const [activeTournament, setActiveTournament] = useState(null);
    const [userStoredId] = useState(() => {
        let stored = localStorage.getItem('storedId');
        if (!stored || stored === 'none' || stored === 'None') {
            stored = generateRandomCode(10);
            localStorage.setItem('storedId', stored);
        }
        return stored;
    });

    console.log("DEBUG: TournamentSystem Render. Current userStoredId:", userStoredId);

    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);

    // Use refs to access latest state in stable socket listeners
    const activeTournamentRef = React.useRef(activeTournament);
    const tournamentsRef = React.useRef(tournaments);

    useEffect(() => {
        activeTournamentRef.current = activeTournament;
        tournamentsRef.current = tournaments;
    }, [activeTournament, tournaments]);

    useEffect(() => {
        // Initial load
        socket.emit('get_tournaments');

        const onTournamentsList = (data) => {
            console.log("RAW SOCKET DATA (tournaments_list):", data);
            if (!Array.isArray(data)) return;
            setTournaments(data);

            const currentActive = activeTournamentRef.current;
            if (currentActive) {
                const updated = data.find(t => t.id === currentActive.id);
                if (updated) setActiveTournament(updated);
            }
        };

        const onTournamentJoined = (tournament) => {
            setActiveTournament(tournament);
            setStatusMessage('Joined tournament! Waiting for players...');
        };

        const onTournamentUpdate = (tournament) => {
            // console.log(`DEBUG: Update for ${tournament.id}`);
            const currentActive = activeTournamentRef.current;

            if (currentActive && currentActive.id === tournament.id) {
                setActiveTournament(tournament);
                if (tournament.status === 'active') {
                    setStatusMessage('Tournament started! Check the bracket.');
                }
                if (tournament.status === 'completed' && currentActive.status !== 'completed') {
                    setStatusMessage(`Tournament Over! Winner: ${tournament.winner?.name}`);
                    setShowCelebration(true);
                    launchConfetti();
                }
            }
            setTournaments(prev => prev.map(t => t.id === tournament.id ? tournament : t));
        };

        const onMatchReady = ({ roomId, matchId, opponent, tournamentId }) => {
            setStatusMessage(`Match ready vs ${opponent}! Redirecting...`);
            setTimeout(() => {
                navigate(`/play-tournament/${roomId}`, {
                    state: {
                        isTournament: true,
                        matchId,
                        tournamentId
                    }
                });
            }, 1500);
        };

        const onError = (msg) => setError(msg);

        // Socket listeners
        socket.on('tournaments_list', onTournamentsList);
        socket.on('tournament_joined', onTournamentJoined);
        socket.on('tournament_update', onTournamentUpdate);
        socket.on('tournament_match_ready', onMatchReady);
        socket.on('error', onError);

        return () => {
            socket.off('tournaments_list', onTournamentsList);
            socket.off('tournament_joined', onTournamentJoined);
            socket.off('tournament_update', onTournamentUpdate);
            socket.off('tournament_match_ready', onMatchReady);
            socket.off('error', onError);
        };
    }, [navigate]);

    const createTournament = (size) => {
        socket.emit('create_tournament', { size, name: `Tournament ${Math.floor(Math.random() * 1000)}` });
    };

    const joinTournament = (id) => {
        if (!userStoredId) return;
        socket.emit('join_tournament', { tournamentId: id, storedId: userStoredId, name: `Player ${userStoredId.substr(0, 4)}` });
    };

    const renderBracket = (tournament) => {
        if (!tournament || !tournament.matches) return null;

        const rounds = [];
        const matches = tournament.matches || [];
        const size = parseInt(tournament.size);
        if (!size || size <= 0) return null;

        const totalRounds = Math.log2(size);

        for (let i = 1; i <= totalRounds; i++) {
            const roundMatches = matches.filter(m => m && m.round === i);
            rounds.push(
                <motion.div
                    key={i}
                    className="bracket-round"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                >
                    <h4>Round {i}</h4>
                    {roundMatches.map(m => (
                        <motion.div
                            key={m.id || `match-${i}-${index}`}
                            className="bracket-match"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className={`player ${m.winner?.name && m.p1?.name && m.winner.name === m.p1.name ? 'winner' : ''}`}>
                                {m.p1?.name ? m.p1.name : 'Waiting...'}
                            </div>
                            <div className="vs">vs</div>
                            <div className={`player ${m.winner?.name && m.p2?.name && m.winner.name === m.p2.name ? 'winner' : ''}`}>
                                {m.p2?.name ? m.p2.name : 'Waiting...'}
                            </div>
                        </motion.div>
                    ))}
                    {roundMatches.length === 0 && <p className="placeholder">Matches TBD</p>}
                </motion.div>
            );
        }

        return <div className="bracket-container">{rounds}</div>;
    };

    const launchConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // Naija colors: Green (#008751) and White (#FFFFFF)
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#008751', '#FFFFFF', '#FFD700'] }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#008751', '#FFFFFF', '#FFD700'] }));
        }, 250);
    };



    const ChampionModal = ({ winner, onClose }) => (
        <motion.div
            className="winner-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="winner-modal-content"
                initial={{ scale: 0.5, y: 100, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
            >
                <motion.div
                    className="trophy-icon"
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    🏆
                </motion.div>
                <div className="celebration-text">
                    <h2>CHAMPION!</h2>
                    <motion.div
                        className="winner-name"
                        animate={{ scale: [1, 1.1, 1], color: ['#FFD700', '#FFF', '#FFD700'] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        {winner.name}
                    </motion.div>
                    <p>Undisputed Naija Whot Master</p>
                </div>
                <button className="close-victory-btn" onClick={onClose}>Close Celebration</button>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="tournament-system">
            {/* ... existing header ... */}
            <motion.h2
                className="section-title"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                🏆 Tournaments
            </motion.h2>

            <AnimatePresence>
                {/* ... existing error/status ... */}
                {error && (
                    <motion.div
                        className="error-message"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {error}
                    </motion.div>
                )}
                {statusMessage && (
                    <motion.div
                        className="status-message"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {statusMessage}
                    </motion.div>
                )}

                {/* Winner Modal */}
                {showCelebration && activeTournament?.winner && (
                    <ChampionModal winner={activeTournament.winner} onClose={() => setShowCelebration(false)} />
                )}
            </AnimatePresence>

            {!activeTournament ? (
                // ... Lobby ... 
                <div className="tournament-lobby">
                    <div className="lobby-header-info">
                        <span className="player-id-badge">My ID: {userStoredId}</span>
                    </div>
                    <motion.div
                        className="create-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3>Create New Tournament</h3>
                        <div className="button-group">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => createTournament(2)}>1v1 (2 Players)</motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => createTournament(4)}>Bracket (4 Players)</motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => createTournament(8)}>Bracket (8 Players)</motion.button>
                        </div>
                    </motion.div>

                    <div className="tournament-list">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Available Tournaments</h3>
                            <button onClick={() => socket.emit('get_tournaments')} className="view-btn" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Manual Refresh</button>
                        </div>
                        {tournaments.length === 0 ? (
                            <p className="no-data">No active tournaments. Create one!</p>
                        ) : (
                            <div className="list-grid">
                                {tournaments.map((t, index) => {
                                    // Fallback: Check matches if participants array is missing or empty
                                    const matchParticipants = new Set();
                                    t.matches?.forEach(m => {
                                        if (m.p1?.storedId) matchParticipants.add(m.p1.storedId);
                                        if (m.p2?.storedId) matchParticipants.add(m.p2.storedId);
                                    });

                                    const isParticipant = (t.participants || t.pids || []).includes(userStoredId) || matchParticipants.has(userStoredId);

                                    if (index === 0) console.log(`DEBUG: Tournament ${t.id} - User: ${userStoredId} | Participants:`, t.participants || t.pids, "Match Based IDs:", Array.from(matchParticipants));

                                    return (
                                        <motion.div
                                            key={t.id}
                                            className="tournament-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -5 }}
                                        >
                                            <h4>{t.name}</h4>
                                            <p>Players: {t.playersCount || 0} / {t.size}</p>
                                            <p>Status: {t.status}</p>
                                            <div className="debug-ids" style={{ fontSize: '0.65rem', color: '#00FF00', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', margin: '5px 0' }}>
                                                IDs: {t.participants ? t.participants.join(', ') : (t.pids ? t.pids.join(', ') : 'None')}
                                                <br />
                                                <span style={{ fontSize: '0.5rem', opacity: 0.7 }}>Keys: {Object.keys(t).join(', ')}</span>
                                            </div>
                                            {t.status === 'completed' && t.winner && (
                                                <p className="winner-text">🏆 Winner: {t.winner.name}</p>
                                            )}
                                            {t.status === 'waiting' && (
                                                <motion.button
                                                    onClick={() => joinTournament(t.id)}
                                                    className="join-btn"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Join
                                                </motion.button>
                                            )}
                                            {t.status !== 'waiting' && (
                                                <button
                                                    onClick={() => {
                                                        if (isParticipant) {
                                                            socket.emit('reconnect_tournament', { tournamentId: t.id, storedId: userStoredId });
                                                        }
                                                        setActiveTournament(t);
                                                    }}
                                                    className={isParticipant ? "re-entry-btn" : "view-btn"}
                                                >
                                                    {isParticipant ? "RE-ENTER" : "View"}
                                                </button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="active-tournament-view">
                    <div className="tournament-header">
                        <h3>{activeTournament.name}</h3>
                        <button onClick={() => setActiveTournament(null)} className="back-btn">Back to Lobby</button>
                    </div>

                    {/* Action Area for Active Players */}
                    {(() => {
                        const myMatch = (activeTournament.matches || []).find(m =>
                            m.round === activeTournament.currentRound &&
                            !m.winner &&
                            ((m.p1 && m.p1.storedId === userStoredId) || (m.p2 && m.p2.storedId === userStoredId))
                        );

                        if (myMatch && activeTournament.status === 'active') {
                            return (
                                <motion.div
                                    className="match-ready-alert"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <h3>Round {activeTournament.currentRound} Match Ready!</h3>
                                    <p>{myMatch.p1?.name} vs {myMatch.p2?.name}</p>
                                    <button
                                        className="join-match-btn"
                                        onClick={() => {
                                            // We need to request the match room ID again or just emit an event to get it
                                            // But notifyMatchReady sends it. We can't easily get it here without backend support to "get_my_match"
                                            // OR we can make the button trigger a 'reconnect_match' socket event.
                                            socket.emit('request_match_info', { tournamentId: activeTournament.id, matchId: myMatch.id });
                                        }}
                                    >
                                        ENTER MATCH
                                    </button>
                                </motion.div>
                            );
                        }
                    })()}

                    {renderBracket(activeTournament)}

                    {activeTournament.status === 'completed' && activeTournament.winner && (
                        <motion.div
                            className="persistent-winner-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="winner-badge">🏆 TOURNAMENT COMPLETED</div>
                            <h3>Winner: <span className="highlight">{activeTournament.winner.name}</span></h3>
                            <p>Player ID: {activeTournament.winner.storedId || 'N/A'}</p>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TournamentSystem;