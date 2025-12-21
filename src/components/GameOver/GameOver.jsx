import React from "react";
import style from "./index.module.css";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import confetti from "canvas-confetti";
import confettiAnimation from "../../utils/functions/confettiAnimation";
import { useEffect, useState } from "react";


function GameOver({ isTournament, tournamentData, currentMatchId }) {
  const isGameOver = useIsGameOver();
  const [animationHasRun, setAnimationHasRun] = useState(false);

  const gameOverState = isGameOver();
  const isUserWinner = gameOverState.winner === "user";

  // Detect if this is the final round
  const maxRounds = tournamentData ? Math.log2(tournamentData.size) : 0;
  const match = tournamentData?.matches?.find(m => m.id === currentMatchId);
  const isFinalMatch = tournamentData && (match?.round === maxRounds || tournamentData.currentRound === maxRounds);

  // Determine if tournament is won overall
  const isTournamentWin = isTournament && isUserWinner && isFinalMatch;

  const title = isUserWinner ? (isTournamentWin ? "TOURNAMENT CHAMPION! 🏆" : "YOU WIN") : "YOU LOST😔";

  const subtitle = isUserWinner
    ? (isTournamentWin
      ? `Congrats for winning tournament "${tournamentData?.name || ''}", you were indeed exceptional!`
      : "Congrats! You won this round.")
    : "Sorry, just try again.";

  useEffect(() => {
    let cleanup;
    if (isUserWinner && !animationHasRun) {
      // Trigger confetti for any win, but maybe more for tournament?
      cleanup = confettiAnimation(confetti);
      setAnimationHasRun(true);

      if (isTournamentWin) {
        // Extra blast for tournament winner
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

  return (
    <div
      className={`${style.game_over} ${!gameOverState.answer && style.hidden}`}
    >
      <div className={style.inner}>
        <p className={style.title}>{title}</p>
        <p>{subtitle}</p>
        {!isTournament ? (
          <button
            onClick={() => {
              window.location.reload();
            }}
            className={style.btn}
          >
            PLAY AGAIN
          </button>
        ) : (
          <p className={style.tournament_msg}>
            {isUserWinner
              ? (isTournamentWin ? "Ultimate Victory! Returning to lobby..." : "Match Won! Proceeding to next round...")
              : "Eliminated. Returning to lobby..."}
          </p>
        )}
      </div>
    </div>
  );
}

export default GameOver;
