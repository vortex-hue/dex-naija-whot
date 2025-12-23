import React from "react";
import style from "./index.module.css";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import confetti from "canvas-confetti";
import confettiAnimation from "../../utils/functions/confettiAnimation";
import { useEffect, useState } from "react";


import { useAccount } from 'wagmi';
import { usePay } from '../../utils/hooks/usePay';

function GameOver({ isTournament, tournamentData, currentMatchId, remoteGameOver, isComputer }) {
  const isGameOverHook = useIsGameOver();
  const [animationHasRun, setAnimationHasRun] = useState(false);
  const { pay, isPaying } = usePay();
  const { isConnected } = useAccount();

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

  const title = isUserWinner ? (isTournamentWin ? "TOURNAMENT CHAMPION! 🏆🇳🇬" : "YOU WIN 🏆🇳🇬") : "YOU LOST THIS TOURNAMENT 😔";

  const subtitle = isUserWinner
    ? (isTournamentWin
      ? `Congrats for winning tournament 🏆🇳🇬 "${tournamentData?.name || ''}", you were indeed exceptional!`
      : "Congrats! You won this round.")
    : "Sorry, just try again.";

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

  // Report Result to Backend (for XP and Payment Logic)
  useEffect(() => {
    if (!isTournament && gameOverState.answer) {
      const storedId = localStorage.getItem("storedId");
      // Only report if it looks like a wallet address (MiniPay user)
      if (storedId && storedId.startsWith("0x")) {
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
  }, [gameOverState.answer, isUserWinner, isTournament]);

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
              onClick={() => {
                window.location.href = "/";
              }}
              className={`${style.btn} ${style.lobby_btn}`}
            >
              BACK TO LOBBY
            </button>
          </div>
        ) : (
          <div className={style.friendly_controls}>

            {isComputer && !isUserWinner && isConnected ? (
              <button
                onClick={async () => {
                  const success = await pay(0.1, 'computer_retry');
                  if (success) {
                    window.location.reload();
                  }
                }}
                disabled={isPaying}
                className={style.btn}
                style={{ background: '#4CAF50', border: 'none', marginLeft: '10px' }}
              >
                {isPaying ? "PROCESSING..." : "RETRY WITH $0.10"}
              </button>
            ) : (
              (!isComputer || isUserWinner) && (
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className={style.btn}
                >
                  PLAY AGAIN
                </button>
              )
            )}
            <button
              onClick={() => {
                window.location.href = "/";
              }}
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
