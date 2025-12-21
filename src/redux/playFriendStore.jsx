import { applyMiddleware, createStore } from "redux";
import combinedReducer from "./reducers/playFriendCombinedReducer";
import socket from "../socket/socket";



export const sanitizeState = (state) => {
  if (!state || typeof state !== 'object') return state;

  let hasChanged = false;
  const sanitized = { ...state };
  const cardArrays = ['userCards', 'opponentCards', 'deck', 'usedCards'];

  cardArrays.forEach(key => {
    const originalArray = state[key];
    if (Array.isArray(originalArray)) {
      const filtered = originalArray.filter(card =>
        card && typeof card === 'object' && card.shape && card.number
      );

      // Only update if filter actually removed something
      if (filtered.length !== originalArray.length) {
        sanitized[key] = filtered;
        hasChanged = true;
      }
    } else if (originalArray === undefined || originalArray === null) {
      sanitized[key] = [];
      hasChanged = true;
    }
  });

  const isValidCard = (c) => c && typeof c === 'object' && c.shape && c.number;

  if (!isValidCard(state.activeCard)) {
    sanitized.activeCard = {};
    hasChanged = true;
  }

  return hasChanged ? sanitized : state;
};

const enhancedReducer = (state, action) => {
  try {
    let result;
    if (action.type === "INITIALIZE_DECK") {
      if (!action.payload || typeof action.payload !== 'object') {
        console.warn("Redux: Invalid INITIALIZE_DECK payload", action.payload);
        return state;
      }
      result = action.payload;
    } else if (action.type === "UPDATE_STATE") {
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
      result = { ...newState, infoShown: state.infoShown || false };
    } else {
      result = combinedReducer(state, action);
    }

    return sanitizeState(result);
  } catch (error) {
    console.error("Redux Reducer Crash Fix Applied:", error, action);
    // Attempt rescue with sanitized previous state
    return sanitizeState(state);
  }
};

let syncTimeout = null;

const getUpdatedState = ({ getState }) => {
  return (next) => (action) => {
    // Capture state BEFORE the action to check turn permission
    const stateBefore = getState();
    const wasToPlay = stateBefore.whoIsToPlay === "user";

    const returnValue = next(action);

    const updatedState = getState();

    // Safety check: Don't sync if this was a server action, or a known local-only action
    const isSyncableAction = !action.isFromServer &&
      action.type !== "UPDATE_STATE" &&
      action.type !== "TOGGLE_INFO_SHOWN" &&
      action.type !== "INITIALIZE_DECK";

    if (isSyncableAction) {
      // CRITICAL FIX: Only sync if it was our turn. 
      // This prevents the opponent's browser from pushing stale state 
      // back to the server due to background effects or re-renders.
      if (!wasToPlay) {
        console.log("🚫 [Sync] Blocked sync from non-active player for action:", action.type);
        return returnValue;
      }

      if (syncTimeout) clearTimeout(syncTimeout);

      syncTimeout = setTimeout(() => {
        let pathname = window.location.pathname;
        // More robust room_id extraction
        const parts = pathname.split('/');
        let room_id = parts[parts.length - 1];

        // Ensure room_id is valid (fallback for some URL structures)
        if (room_id.length !== 4) {
          room_id = pathname.slice(pathname.length - 4);
        }

        console.log("📡 [Sync] Emitting bached state to server...", action.type);
        socket.emit("sendUpdatedState", updatedState, room_id);
        syncTimeout = null;
      }, 50); // Reduced to 50ms for better responsiveness
    }

    return returnValue;
  };
};

const store = createStore(enhancedReducer, applyMiddleware(getUpdatedState));

export default store;
