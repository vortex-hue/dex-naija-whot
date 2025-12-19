import React from "react";
import style from "./index.module.css";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import confetti from "canvas-confetti";
import confettiAnimation from "../../utils/functions/confettiAnimation";
import { useEffect, useState } from "react";


function GameOver({ isTournament }) {
  const isGameOver = useIsGameOver();
  const [animationHasRun, setAnimationHasRun] = useState(false);


  const title = isGameOver().winner === "user" ? "YOU WIN" : "YOU LOST😔";
  const subtitle =
    isGameOver().winner === "user"
      ? "Congrats! You won this round."
      : "Sorry, just try again.";

  useEffect(() => {


    if (isGameOver().winner === "user" && !animationHasRun) {
      confettiAnimation(confetti);
      setAnimationHasRun(true);
    }
  }, [isGameOver, animationHasRun]);

  return (
    <div
      className={`${style.game_over} ${!isGameOver().answer && style.hidden}`}
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
            {isGameOver().winner === "user"
              ? "Victory! Proceeding to next round..."
              : "Eliminated. Returning to lobby..."}
          </p>
        )}
      </div>
    </div>
  );
}

export default GameOver;
