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

import { useAccount } from 'wagmi';
import { usePay } from '../../utils/hooks/usePay';
import { useMiniPay } from '../../context/MiniPayContext';
import React, { useState, useEffect } from 'react';

function App() {
  const activeCard = useSelector((state) => state.activeCard || {});
  const userCards = useSelector((state) => state.userCards || []);
  const opponentCards = useSelector((state) => state.opponentCards || []);

  const { address, isConnected } = useAccount();
  const { isMiniPayUser } = useMiniPay();
  const { pay, isPaying } = usePay();
  const [isBlocked, setIsBlocked] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Only enforce rules if User is using MiniPay
    if (isConnected && address && isMiniPayUser) {
      fetch(`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080'}/api/user/${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.user?.last_match_status === 'LOST') {
            setIsBlocked(true);
          }
          setCheckingStatus(false);
        })
        .catch(() => setCheckingStatus(false));
    } else {
      // Free play for non-MiniPay users
      setCheckingStatus(false);
    }
  }, [address, isConnected, isMiniPayUser]);

  if (checkingStatus) return <Preloader />;

  if (isBlocked) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.85)', color: 'white', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#ff4444' }}>💔 You Lost!</h1>
        <p style={{ marginBottom: '30px', fontSize: '1.2rem' }}>Pay to challenge the computer again.</p>

        <button
          onClick={async () => {
            const success = await pay(0.1, 'computer_retry');
            if (success) setIsBlocked(false);
          }}
          disabled={isPaying}
          style={{
            background: '#4CAF50', color: 'white', padding: '15px 40px', fontSize: '1.2rem',
            border: 'none', borderRadius: '50px', cursor: 'pointer', marginBottom: '15px',
            boxShadow: '0 0 20px rgba(76, 175, 80, 0.4)'
          }}
        >
          {isPaying ? "Processing..." : "Retry ($0.10)"}
        </button>

        <button
          onClick={() => window.history.back()}
          style={{ background: 'transparent', border: '1px solid #666', color: '#888', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer' }}
        >
          Go Back
        </button>
      </div>
    );
  }

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
        <GameOver isComputer={true} />
        <Preloader />
      </div>
    </Flipper>
  );
}

export default App;
