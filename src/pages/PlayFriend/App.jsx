import {
  UserCards,
  OpponentCards,
  CenterArea,
  InfoArea,
  GameOver,
  Preloader,
  ErrorPage,
  OnlineIndicators,
  ConnectionLoader,
  AudioControls,
  MissionPanel,
} from "../../components";
import Chat from "../../components/Chat/Chat";
import { Flipper } from "react-flip-toolkit";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import "../../index.css";
import { useParams } from "react-router-dom";
import socket from "../../socket/socket";
import { generateRandomCode } from "../../utils/functions/generateRandomCode";
import useIsGameOver from "../../utils/hooks/useIsGameOver";



function App() {
  const { room_id } = useParams();
  const isGameOver = useIsGameOver();
  const [errorText, setErrorText] = useState("");
  const [onlineState, setOnlineState] = useState({
    userIsOnline: false,
    opponentIsOnline: false,
  });
  const [remoteGameOver, setRemoteGameOver] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [connectionHanged, setConnectionHanged] = useState(false);



  const userCards = useSelector((state) => state.userCards || []);
  const opponentCards = useSelector((state) => state.opponentCards || []);
  const stateHasBeenInitialized = useSelector((state) => state.stateHasBeenInitialized || false);

  const dispatch = useDispatch();

  useEffect(() => {
    let storedId = localStorage.getItem("storedId");
    if (!storedId) {
      storedId = generateRandomCode(10);
      localStorage.setItem("storedId", storedId);
    }

    const handleDispatch = (action) => {
      action.isFromServer = true;
      dispatch(action);
    };

    const handleError = (errorText) => {
      setErrorText(errorText);
    };

    const handleDisconnect = () => {
      setOnlineState((prevState) => ({ ...prevState, userIsOnline: false }));
    };

    const handleConnect = () => {
      setOnlineState((prevState) => ({ ...prevState, userIsOnline: true }));
      // Re-join room on reconnect
      if (room_id && storedId) {
        console.log("Reconnecting to room:", room_id);
        socket.emit("join_room", { room_id, storedId });
      }
    };

    const handleOpponentOnlineState = (opponentIsOnline) => {
      setOnlineState((prevState) => ({ ...prevState, opponentIsOnline }));
    };

    const handleConfirmOnlineState = () => {
      socket.emit("confirmOnlineState", storedId, room_id);
    };

    const handleMatchOver = ({ winnerStoredId }) => {
      console.log("🏁 Match officially over. Winner:", winnerStoredId);
      setRemoteGameOver(winnerStoredId);
    };

    const handleTimerUpdate = ({ timeLeft: seconds }) => {
      setTimeLeft(seconds);
    };

    const syncGame = () => {
      console.log("🔄 Manual Sync Requested");
      socket.emit("join_room", { room_id, storedId });
    };

    window.syncWhotGame = syncGame;

    socket.emit("join_room", { room_id, storedId });
    socket.on("dispatch", handleDispatch);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    socket.on("opponentOnlineStateChanged", handleOpponentOnlineState);
    socket.on("confirmOnlineState", handleConfirmOnlineState);
    socket.on("match_over", handleMatchOver);
    socket.on("timer_update", handleTimerUpdate);

    // SAFETY: If after 10 seconds we are still 'Connecting', show an error or try to re-join
    const connectionTimer = setTimeout(() => {
      if (!stateHasBeenInitialized) {
        console.warn("⌛ Connection hanging... attempting force-sync");
        socket.emit("join_room", { room_id, storedId });
        setConnectionHanged(true);
      }
    }, 10000);

    return () => {
      socket.off("dispatch", handleDispatch);
      socket.off("error", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socket.off("opponentOnlineStateChanged", handleOpponentOnlineState);
      socket.off("confirmOnlineState", handleConfirmOnlineState);
      socket.off("match_over", handleMatchOver);
      socket.off("timer_update", handleTimerUpdate);
      clearTimeout(connectionTimer);
    };
  }, [dispatch, room_id, stateHasBeenInitialized]);

  useEffect(() => {
    const gameOverState = isGameOver();
    if (gameOverState.answer && stateHasBeenInitialized) {
      let storedId = localStorage.getItem("storedId");
      // If I am the winner, I can claim it. Or we just send the winner 'user' or 'opponent'
      // Ideally we send the storedId of the winner.
      // If winner is 'user', storedId is mine.
      // If winner is 'opponent', we don't know their storedId easily without looking at state, 
      // but simpler: just say "I lost" or "I won".

      // Actually, let's just send the raw info and let backend decide.
      // But purely client-side logic is risky. 
      // Let's send { room_id, winner: gameOverState.winner, reporterStoredId: storedId }
      socket.emit("game_over", { room_id, winner: gameOverState.winner, reporterStoredId: storedId });
    }
  }, [isGameOver, room_id, stateHasBeenInitialized]);

  if (errorText) return <ErrorPage errorText={errorText} />;

  if (!stateHasBeenInitialized) {
    return <ConnectionLoader />;
  }

  const flipKey = (userCards || []).filter(Boolean).map(c => `${c?.shape || 'none'}-${c?.number || '0'}`).join('') +
    (opponentCards || []).filter(Boolean).map(c => `${c?.shape || 'none'}-${c?.number || '0'}`).join('');

  return (
    <Flipper flipKey={flipKey}>
      <div className="App">
        {timeLeft !== null && timeLeft <= 30 && timeLeft > 0 && (
          <div className="round-timer-overlay">
            <div className="timer-content">
              <span>ROUND ENDING IN:</span>
              <span className={`timer-seconds ${timeLeft <= 10 ? 'urgent' : ''}`}>{timeLeft}s</span>
            </div>
          </div>
        )}

        {connectionHanged && !stateHasBeenInitialized && (
          <div className="connection-error-overlay">
            <p>Taking longer than usual...</p>
            <button onClick={() => window.location.reload()}>Refresh Page</button>
          </div>
        )}

        <MissionPanel />
        <AudioControls />
        <OpponentCards />
        <CenterArea />
        <UserCards />
        <InfoArea />

        <div className="game-controls-overlay">
          <button className="sync-btn" onClick={() => window.syncWhotGame()}>
            <span className="sync-icon">🔄</span> STUCK? SYNC
          </button>
        </div>

        <GameOver remoteGameOver={remoteGameOver} />
        <Preloader />
        <OnlineIndicators onlineState={onlineState} />
        {room_id && <Chat roomId={room_id} storedId={localStorage.getItem("storedId")} />}
      </div>
    </Flipper>
  );
}

export default App;
