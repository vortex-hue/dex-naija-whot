import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Provider";
import { PlayComputer, Home, CopyLink, PlayFriend, Tournament, TournamentGame, Leaderboard, Donation, Rewards } from "./pages";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { NetworkMonitor } from "./components";

console.log("🚀 App initializing...");
const root = ReactDOM.createRoot(document.getElementById("root"));

window.addEventListener('error', (event) => {
  console.error("🔥 GLOBAL UNCAUGHT ERROR:", event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", event.reason);
});

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Web3Provider>
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
            <Route path="/rewards" exact element={<Rewards />} />
            <Route path="/donation" exact element={<Donation />} />
          </Routes>
        </Router>
      </Web3Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
