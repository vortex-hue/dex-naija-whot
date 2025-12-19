const deckReducer = (state = [], action) => {
  if (action.type === "REMOVE_CARD_FROM_DECK") {
    return state.filter((card) => card !== action.payload);
  }
  return state;
};

export default deckReducer;
