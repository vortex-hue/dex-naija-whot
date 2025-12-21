import React from "react";
import CardComponent from "../CardComponent/CardComponent";
import { useSelector, useDispatch } from "react-redux";
import useMarket from "../../utils/hooks/useMarket";
import { useEffect, useMemo } from "react";
import goToMarket from "../../utils/functions/goToMarket";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
import { setInfoText, setWhoIsToPlay } from "../../redux/actions";
import infoTextValues from "../../constants/infoTextValues";

function ComputerCards() {
  const opponentCards = useSelector((state) => state.opponentCards || []);
  const whoIsToPlay = useSelector((state) => state.whoIsToPlay || "user");
  const activeCard = useSelector((state) => state.activeCard || {});
  const usedCards = useSelector((state) => state.usedCards || []);
  const userCards = useSelector((state) => state.userCards || []);

  const dispatch = useDispatch();
  const { market } = useMarket();

  const marketConfig = useMemo(() => ({
    market,
    dispatch,
    usedCards,
    userCards,
    opponentCards,
    activeCard,
  }), [market, dispatch, usedCards, userCards, opponentCards, activeCard]);

  const isGameOver = useIsGameOver();

  let cardArray = [];
  let isPlayed = false;
  let isPlayedSet = false;
  // I'm using isPlayedSet to make sure isPlayed is only true for one card
  opponentCards.forEach((card) => {
    if (!isPlayedSet) {
      isPlayed =
        whoIsToPlay === "opponent" &&
        (card.number === activeCard.number || card.shape === activeCard.shape);
    } else {
      isPlayed = false;
    }

    if (isPlayed) {
      isPlayedSet = true;
    }

    cardArray.push(
      <CardComponent
        shape={card.shape}
        number={card.number}
        isMine={false}
        isShown={false}
        key={card.shape + card.number}
        isPlayed={isPlayed}
      />
    );
  });

  useEffect(() => {
    if (isPlayedSet === false && whoIsToPlay === "opponent") {
      if (isGameOver().answer) return;

      let delay = 500;
      setTimeout(() => {
        goToMarket("opponent", marketConfig);
        dispatch(setWhoIsToPlay("user"));
        dispatch(setInfoText(infoTextValues.usersTurn));
      }, delay);
    }
  }, [whoIsToPlay, userCards, opponentCards, isPlayedSet, dispatch, isGameOver, marketConfig]);

  return (
    <div className="scroll-container">
      <div className="grid">{cardArray}</div>
    </div>
  );
}

export default ComputerCards;
