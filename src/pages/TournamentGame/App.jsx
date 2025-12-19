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
import { useLocation, useParams } from "react-router-dom";
import socket from "../../socket/socket";
import { generateRandomCode } from "../../utils/functions/generateRandomCode";
import useIsGameOver from "../../utils/hooks/useIsGameOver";
// ... existing imports

function App() {
  const { room_id } = useParams();
  const location = useLocation();
  const { isTournament, matchId, tournamentId } = location.state || {};

  const isGameOver = useIsGameOver();
  const [errorText, setErrorText] = useState("");
  const [onlineState, setOnlineState] = useState({
    userIsOnline: false,
    opponentIsOnline: false,
  });
  // ... existing state
  const [userCards, opponentCards, stateHasBeenInitialized] =
    useSelector((state) => [
      state.userCards,
      state.opponentCards,
      state.stateHasBeenInitialized,
    ]);

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
        socket.emit("join_room", { room_id, storedId, isTournament, matchId, tournamentId });
      }
    };

    const handleOpponentOnlineState = (opponentIsOnline) => {
      setOnlineState((prevState) => ({ ...prevState, opponentIsOnline }));
    };

    const handleConfirmOnlineState = () => {
      socket.emit("confirmOnlineState", storedId, room_id);
    };

    socket.emit("join_room", { room_id, storedId, isTournament, matchId, tournamentId });
    socket.on("dispatch", handleDispatch);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    socket.on("opponentOnlineStateChanged", handleOpponentOnlineState);
    socket.on("confirmOnlineState", handleConfirmOnlineState);

    return () => {
      socket.off("dispatch", handleDispatch);
      socket.off("error", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socket.off("opponentOnlineStateChanged", handleOpponentOnlineState);
      socket.off("confirmOnlineState", handleConfirmOnlineState);
    };
  }, [dispatch, room_id, isTournament, matchId, tournamentId]);

  useEffect(() => {
    // Voice Instructions Integration
    if (stateHasBeenInitialized) {
      // We can hook into redux state changes here if needed, 
      // OR rely on the existing components triggering events.
      // But since we want to toggle it, AudioControls handles the 'on/off' state.
      // We need to trigger the *events*.
      // Ideally, the game logic (redux/sagas) triggers these. 
      // As a quick implementation, we can watch props.
    }
  }, [stateHasBeenInitialized]);

  useEffect(() => {
    const gameOverState = isGameOver();
    if (gameOverState.answer && stateHasBeenInitialized) {
      let storedId = localStorage.getItem("storedId");

      // Emit specific tournament win event
      socket.emit("tournament_match_win", {
        room_id,
        winnerStoredId: gameOverState.winner === 'user' ? storedId : 'opponent_id_placeholder',
        tournamentId,
        matchId
      });
      // Fallback: The standard game_over might be enough if backend is smart.
      // But let's stick to the plan: redirect.

      // Play Game Over Sound
      if (window.playWhotInstruction) {
        window.playWhotInstruction(gameOverState.winner === 'user' ? 'victory' : 'defeat');
      }

      const timer = setTimeout(() => {
        // Redirect back to main tournament page
        window.location.href = '/';
      }, 5000); // 5 seconds to see celebration

      return () => clearTimeout(timer);
    }
  }, [isGameOver, room_id, stateHasBeenInitialized, matchId, tournamentId]);

  if (errorText) return <ErrorPage errorText={errorText} />;

  if (!stateHasBeenInitialized) {
    return <ConnectionLoader />;
  }

  return (
    <Flipper flipKey={[...userCards, ...opponentCards]}>
      <div className="App tournament-mode">
        <div className="tournament-header-badge">🏆 TOURNAMENT MATCH</div>
        <MissionPanel />
        <AudioControls />
        <OpponentCards />
        <CenterArea />
        <UserCards />
        <InfoArea />
        <GameOver isTournament={true} />
        <Preloader />
        <Preloader />
        <OnlineIndicators onlineState={onlineState} />
        {room_id && <Chat roomId={room_id} storedId={localStorage.getItem("storedId")} />}
      </div>
    </Flipper>
  );
}

export default App;
