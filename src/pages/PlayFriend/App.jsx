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
        socket.emit("join_room", { room_id, storedId });
      }
    };

    const handleOpponentOnlineState = (opponentIsOnline) => {
      setOnlineState((prevState) => ({ ...prevState, opponentIsOnline }));
    };

    const handleConfirmOnlineState = () => {
      socket.emit("confirmOnlineState", storedId, room_id);
    };

    socket.emit("join_room", { room_id, storedId });
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
  }, [dispatch, room_id]);

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

  return (
    <Flipper flipKey={[...userCards, ...opponentCards]}>
      <div className="App">

        <MissionPanel />
        <AudioControls />
        <OpponentCards />
        <CenterArea />
        <UserCards />
        <InfoArea />
        <GameOver />
        <Preloader />
        <Preloader />
        <OnlineIndicators onlineState={onlineState} />
        {room_id && <Chat roomId={room_id} storedId={localStorage.getItem("storedId")} />}
      </div>
    </Flipper>
  );
}

export default App;
