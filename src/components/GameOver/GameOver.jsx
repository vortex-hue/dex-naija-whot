import React from "react";
import style from "./index.module.css";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import confetti from "canvas-confetti";
import confettiAnimation from "../../utils/functions/confettiAnimation";
import { useEffect, useState } from "react";

function GameOver({ isTournament, tournamentData, currentMatchId, remoteGameOver, isComputer }) {
  const isGameOverHook = useIsGameOver();
  const [animationHasRun, setAnimationHasRun] = useState(false);

  const localGameOver = isGameOverHook();

  // Create final state: follow server signal if present, otherwise follow local cards
  const gameOverState = remoteGameOver
    ? { answer: true, winner: remoteGameOver === localStorage.getItem("storedId") ? "user" : "opponent" }
    : localGameOver;

  const isUserWinner = gameOverState.winner === "user";

  // Detect if this is the final round
  const maxRounds = tournamentData ? Math.log2(tournamentData.size) : 0;
  const match = tournamentData?.matches?.find(m => m.id === currentMatchId);
  const isFinalMatch = tournamentData && (match?.round === maxRounds || tournamentData.currentRound === maxRounds);

  // Determine if tournament is won overall
  const isTournamentWin = isTournament && isUserWinner && isFinalMatch;

  const title = isUserWinner
    ? (isTournamentWin ? "TOURNAMENT CHAMPION! 🏆🇳🇬" : "YOU WIN 🏆🇳🇬")
    : (isTournament ? "You Lost 😔" : "You Lost 😔");

  const subtitle = isUserWinner
    ? (isTournamentWin
      ? `Congrats for winning tournament 🏆🇳🇬 "${tournamentData?.name || ''}", you were indeed exceptional!`
      : "Congrats! You won this round.")
    : "Better luck next time!";

  useEffect(() => {
    let cleanup;
    if (isUserWinner && !animationHasRun) {
      // Trigger confetti for any win
      cleanup = confettiAnimation(confetti);
      setAnimationHasRun(true);

      if (isTournamentWin) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FFFFFF']
          });
        }, 1000);
      }
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [isUserWinner, animationHasRun, isTournamentWin]);

  // Report Result to Backend (for points & Torque events)
  useEffect(() => {
    if (gameOverState.answer) {
      const storedId = localStorage.getItem("storedId");
      if (storedId) {
        const result = isUserWinner ? 'WIN' : 'LOSS';
        const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
        console.log(`📝 Reporting Match Result: ${result} for ${storedId}`);

        fetch(`${apiUrl}/api/report-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: storedId, result })
        }).catch(err => console.error("❌ Failed to report match:", err));
      }
    }
  }, [gameOverState.answer, isUserWinner]);

  return (
    <div
      className={`${style.game_over} ${!gameOverState.answer && style.hidden}`}
    >
      <div className={style.inner}>
        <p className={style.title}>{title}</p>
        <p>{subtitle}</p>
        {isTournament ? (
          <div className={style.tournament_controls}>
            <p className={style.tournament_msg}>
              {isUserWinner
                ? (isTournamentWin ? "Ultimate Victory! Returning to lobby..." : "Match Won! Proceeding to next round...")
                : "Eliminated. Returning to lobby..."}
            </p>
            <button
              onClick={() => { window.location.href = "/"; }}
              className={`${style.btn} ${style.lobby_btn}`}
            >
              BACK TO LOBBY
            </button>
          </div>
        ) : (
          <div className={style.friendly_controls}>
            <button
              onClick={() => { window.location.reload(); }}
              className={style.btn}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className={`${style.btn} ${style.lobby_btn}`}
            >
              BACK TO LOBBY
            </button>
          </div>
        )}
      </div>
    </div >
  );
}

export default GameOver;
