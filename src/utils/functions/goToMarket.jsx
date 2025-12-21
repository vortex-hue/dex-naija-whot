import randomCard from "./randomCard";
import { addUserCard, addOpponentCard } from "../../redux/actions";
import removeCardFromDeck from "../../redux/actions/removeCardFromDeck";

const goToMarket = (
  player,
  { market, dispatch, usedCards, opponentCards, userCards },
  number = 1,
  setOfUsedCards = [],
  numberOfMoves = 0
) => {
  // setOfUsedCards is for updating the cards as more are created inside the loop
  const card = randomCard(
    market.filter((card) => !setOfUsedCards.includes(card))
  );

  if (card && player === "user") {
    dispatch(addUserCard(card));
  } else if (card && player === "opponent") {
    dispatch(addOpponentCard(card));
  }

  if (card) {
    // CRITICAL FIX: Remove the card from the deck so it can't be picked again
    dispatch(removeCardFromDeck(card));
    setOfUsedCards.unshift(card);
  }

  numberOfMoves++;
  if (numberOfMoves === number) {
    return;
  }

  goToMarket(
    player,
    { market, dispatch, usedCards, opponentCards, userCards },
    number,
    setOfUsedCards,
    numberOfMoves
  );
};

export default goToMarket;
