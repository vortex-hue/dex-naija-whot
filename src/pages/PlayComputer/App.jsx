import {
  UserCards,
  ComputerCards,
  CenterArea,
  InfoArea,
  GameOver,
  Preloader,
  AudioControls,
  MissionPanel,
  BackButton,
} from "../../components";
import { Flipper } from "react-flip-toolkit";
import { useSelector } from "react-redux";



import "../../index.css";

import { useAccount } from 'wagmi';
import { getApiUrl } from '../../utils/apiUrl';
import React, { useState, useEffect } from 'react';

function App() {
  const activeCard = useSelector((state) => state.activeCard || {});
  const userCards = useSelector((state) => state.userCards || []);
  const opponentCards = useSelector((state) => state.opponentCards || []);

  const { address, isConnected } = useAccount();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetch(`${getApiUrl()}/api/user/${address}`)
        .then(res => res.json())
        .then(() => setCheckingStatus(false))
        .catch(() => setCheckingStatus(false));
    } else {
      setCheckingStatus(false);
    }
  }, [address, isConnected]);

  if (checkingStatus) return <Preloader />;


  // Track game start


  return (
    <Flipper flipKey={[activeCard, ...userCards, ...opponentCards]}>
      <div className="App">
        <BackButton style={{ top: '10px', left: '10px' }} />
        <MissionPanel />
        <AudioControls />

        <ComputerCards />
        <CenterArea />
        <UserCards />
        <InfoArea />
        <GameOver isComputer={true} />
        <Preloader />
      </div>
    </Flipper>
  );
}

export default App;
