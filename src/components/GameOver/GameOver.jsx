import React from "react";
import style from "./index.module.css";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import confetti from "canvas-confetti";
import confettiAnimation from "../../utils/functions/confettiAnimation";
import { useEffect, useState } from "react";
import { useHoneycomb } from "../../contexts/HoneycombProvider";

function GameOver() {
  const isGameOver = useIsGameOver();
  const [animationHasRun, setAnimationHasRun] = useState(false);
  const [gameTracked, setGameTracked] = useState(false);
  const { trackGameEvent } = useHoneycomb();

  const title = isGameOver().winner === "user" ? "YOU WIN" : "YOU LOST😔";
  const subtitle =
    isGameOver().winner === "user"
      ? "Congrats! You won this round."
      : "Sorry, just try again.";

  useEffect(() => {
    if (isGameOver().answer && !gameTracked) {
      // Track game outcome
      if (isGameOver().winner === "user") {
        trackGameEvent('game_won');
      } else {
        trackGameEvent('game_lost');
      }
      setGameTracked(true);
    }
    
    if (isGameOver().winner === "user" && !animationHasRun) {
      confettiAnimation(confetti);
      setAnimationHasRun(true);
    }
  }, [isGameOver, gameTracked, animationHasRun, trackGameEvent]);

  return (
    <div
      className={`${style.game_over} ${!isGameOver().answer && style.hidden}`}
    >
      <div className={style.inner}>
        <p className={style.title}>{title}</p>
        <p>{subtitle}</p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className={style.btn}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default GameOver;
