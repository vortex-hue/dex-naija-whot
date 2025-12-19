const removeCardFromDeck = (card) => {
    return { type: "REMOVE_CARD_FROM_DECK", payload: card };
};

export default removeCardFromDeck;
