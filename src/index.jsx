import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Provider";
import { MiniPayProvider } from "./context/MiniPayContext";
import WalletObserver from "./components/WalletObserver";
import { PlayComputer, Home, CopyLink, PlayFriend, Tournament, TournamentGame, Leaderboard } from "./pages";


import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root"));

window.addEventListener('error', (event) => {
  console.error("🔥 GLOBAL UNCAUGHT ERROR:", event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", event.reason);
});

root.render(
  <React.StrictMode>
    <Web3Provider>
      <MiniPayProvider>
        <WalletObserver />
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/" exact element={<Home />} />
              <Route path="/play-computer" exact element={<PlayComputer />} />
              <Route path="/copylink" exact element={<CopyLink />} />
              <Route path="/play-friend" exact element={<PlayFriend />} />
              <Route path="/play-friend/:room_id" exact element={<PlayFriend />} />
              <Route path="/play-tournament/:room_id" exact element={<TournamentGame />} />
              <Route path="/tournaments" exact element={<Tournament />} />
              <Route path="/leaderboard" exact element={<Leaderboard />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </MiniPayProvider>
    </Web3Provider>
  </React.StrictMode>
);
