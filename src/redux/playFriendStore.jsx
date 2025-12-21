import { applyMiddleware, createStore } from "redux";
import combinedReducer from "./reducers/playFriendCombinedReducer";
import socket from "../socket/socket";



const enhancedReducer = (state, action) => {
  try {
    if (action.type === "INITIALIZE_DECK") {
      if (!action.payload || typeof action.payload !== 'object') {
        console.warn("Redux: Invalid INITIALIZE_DECK payload", action.payload);
        return state;
      }
      return action.payload;
    }

    if (action.type === "UPDATE_STATE") {
      if (!action.payload) {
        console.warn("Redux: Missing payload for UPDATE_STATE");
        return state;
      }
      const { playerOneState, playerTwoState } = action.payload;
      if (!playerOneState || !playerTwoState) {
        console.warn("Redux: Incomplete payload for UPDATE_STATE", action.payload);
        return state;
      }
      let newState = state.player === "one" ? playerOneState : playerTwoState;
      // Preserve local UI state that server doesn't know about
      return { ...newState, infoShown: state.infoShown || false };
    }

    return combinedReducer(state, action);
  } catch (error) {
    console.error("Redux Reducer Crash:", error, action);
    return state; // Return previous state on crash to prevent white screen
  }
};

let syncTimeout = null;

const getUpdatedState = ({ getState }) => {
  return (next) => (action) => {
    const returnValue = next(action);

    const updatedState = getState();
    if (
      !action.isFromServer &&
      action.type !== "UPDATE_STATE" &&
      action.type !== "TOGGLE_INFO_SHOWN" &&
      action.type !== "INITIALIZE_DECK"
    ) {
      if (syncTimeout) clearTimeout(syncTimeout);

      syncTimeout = setTimeout(() => {
        let pathname = window.location.pathname;
        let room_id = pathname.slice(pathname.length - 4, pathname.length);
        console.log("📡 Syncing state to server after batching...", action.type);
        socket.emit("sendUpdatedState", updatedState, room_id);
        syncTimeout = null;
      }, 100); // 100ms debounce to batch multiple rapid actions (e.g. removeCard + updateActiveCard)
    }

    return returnValue;
  };
};

const store = createStore(enhancedReducer, applyMiddleware(getUpdatedState));

export default store;
