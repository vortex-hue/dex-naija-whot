import {
  UserCards,
  ComputerCards,
  CenterArea,
  InfoArea,
  GameOver,
  Preloader,
  AudioControls,
  MissionPanel,
  BlockchainStatus,
} from "../../components";
import { Flipper } from "react-flip-toolkit";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useHoneycomb } from "../../contexts/HoneycombProvider";
import { WalletMultiButton } from "../../contexts/WalletProvider";
import "../../index.css";

function App() {
  const [activeCard, userCards, opponentCards, whoIsToPlay] = useSelector((state) => [
    state.activeCard,
    state.userCards,
    state.opponentCards,
    state.whoIsToPlay,
  ]);
  
  const { trackGameEvent } = useHoneycomb();

  // Track game start
  useEffect(() => {
    trackGameEvent('game_started');
  }, []);

  return (
    <Flipper flipKey={[activeCard, ...userCards, ...opponentCards]}>
      <div className="App">
        <div className="wallet-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }}>
          <WalletMultiButton />
        </div>
        <MissionPanel />
        <AudioControls />
        <BlockchainStatus />
        <ComputerCards />
        <CenterArea />
        <UserCards />
        <InfoArea />
        <GameOver />
        <Preloader />
      </div>
    </Flipper>
  );
}

export default App;
