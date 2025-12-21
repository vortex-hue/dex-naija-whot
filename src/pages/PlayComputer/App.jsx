import {
  UserCards,
  ComputerCards,
  CenterArea,
  InfoArea,
  GameOver,
  Preloader,
  AudioControls,
  MissionPanel,
} from "../../components";
import { Flipper } from "react-flip-toolkit";
import { useSelector } from "react-redux";



import "../../index.css";

function App() {
  const activeCard = useSelector((state) => state.activeCard || {});
  const userCards = useSelector((state) => state.userCards || []);
  const opponentCards = useSelector((state) => state.opponentCards || []);



  // Track game start


  return (
    <Flipper flipKey={[activeCard, ...userCards, ...opponentCards]}>
      <div className="App">

        <MissionPanel />
        <AudioControls />

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
