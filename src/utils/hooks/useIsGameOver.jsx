import { useSelector } from "react-redux";
import { useCallback } from "react";

function useIsGameOver() {
  const userCards = useSelector((state) => state.userCards || []);
  const opponentCards = useSelector((state) => state.opponentCards || []);

  const isGameOver = useCallback(() => {
    let answer = false;
    let winner = null;
    if (userCards.length === 0) {
      winner = "user";
      answer = true;
    }
    if (opponentCards.length === 0) {
      winner = "opponent";
      answer = true;
    }

    return { answer, winner };
  }, [userCards, opponentCards]);

  return isGameOver;
}

export default useIsGameOver;
