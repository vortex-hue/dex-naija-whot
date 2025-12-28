import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Provider";
import { MiniPayProvider } from "./context/MiniPayContext";
import WalletObserver from "./components/WalletObserver";
import { PlayComputer, Home, CopyLink, PlayFriend, Tournament, TournamentGame, Leaderboard, Donation } from "./pages";


import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { NetworkMonitor } from "./components";

console.log("🚀 App initializing...");
console.log("🌐 Ethereum Provider present:", !!window.ethereum);
const root = ReactDOM.createRoot(document.getElementById("root"));

window.addEventListener('error', (event) => {
  console.error("🔥 GLOBAL UNCAUGHT ERROR:", event.error);
  alert("App Error: " + (event.error ? event.error.message : "Unknown error"));
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", event.reason);
  alert("Promise Error: " + event.reason);
});

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Web3Provider>
        <MiniPayProvider>
          <WalletObserver />
          <NetworkMonitor />
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
              <Route path="/donation" exact element={<Donation />} />
            </Routes>
          </Router>
        </MiniPayProvider>
      </Web3Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
