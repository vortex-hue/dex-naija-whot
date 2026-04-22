# WhotChain — Naija Whot on Solana 🎮🏆

<br />

![Game play](./public/MultiplayerMockup.png)

<br />

WhotChain is a premium, high-fidelity Naija Whot card game powered by **Solana** and integrated with **[Torque Protocol](https://torque.so)** for growth incentives, leaderboards, and player rewards.

Play, earn points, climb the leaderboard, and win weekly SOL rewards — all with your Solana wallet.

🎮 **Live App**: [https://whot.xendex.com.ng](https://whot.xendex.com.ng)
⚙️ **Backend API**: [https://api.whot.xendex.com.ng](https://api.whot.xendex.com.ng)

## Key Features 🚀

- **Solana Wallet Integration**: Connect with Phantom, Solflare, Backpack, or any Solana wallet adapter-compatible wallet. Wallet stays connected across page refreshes.
- **Torque-Powered Growth**: Game events (`whot_game_won`, `whot_daily_login`, `whot_streak_7`, etc.) fire to [Torque's ingestion pipeline](https://ingest.torque.so/events), powering a weekly leaderboard incentive.
- **Points & Streaks System**: Earn 25 pts per win, 5 pts per loss, 10 pts daily login bonus, 100 pts for 7-day streaks, 500 pts for 30-day streaks.
- **Real-time Multiplayer**: Challenge friends or play in tournaments with low-latency Socket.io synchronization.
- **Tournament Management**: Support for 2, 4, and 8-player bracketed tournaments.
- **Infinite Market Flow**: The game automatically shuffles and replenishes the market from used cards — never run out.
- **Stability & Fairness**:
    - Manual Sync button to resolve occasional turn desyncs
    - Connection Watchdog for hanging connections
    - Server-Side authoritative winner determination
- **Smart Network Monitor**: Detects online/offline status with a 2-fail threshold — no false positives.

## Torque Integration 🔗

WhotChain uses Torque's custom events API to track player activity and power a **Weekly Leaderboard Incentive**:

| Event | When Fired | Points |
|---|---|---|
| `whot_game_won` | Player wins a game | +25 |
| `whot_game_played` | Player loses a game | +5 |
| `whot_daily_login` | First game of the day | +10 |
| `whot_pvp_won` | Player wins a PvP match | +50 |
| `whot_streak_7` | 7 consecutive daily logins | +100 |
| `whot_streak_30` | 30 consecutive daily logins | +500 |

Events are fired server-side to `https://ingest.torque.so/events` with the player's Solana `userPubkey`. The weekly leaderboard evaluates `whot_game_won` counts and distributes SOL rewards to top players.

## Tech Stack ⚙️

**Frontend:**
- React & Redux (State Management)
- `@solana/wallet-adapter` (Wallet Connection)
- Socket.io-client (Real-time Communication)
- React-flip-toolkit (Physics-based Animations)
- Vanilla CSS (Modern, Responsive Design)

**Backend:**
- Node.js & Express
- Socket.io (Server-side Authority)
- MongoDB / SQLite (Player Data)
- Torque Events API (Growth & Incentives)

## Running Locally 🚀

### Prerequisites
- Node.js v18+
- A Solana wallet (Phantom, Solflare, etc.)
- Backend server running (see [backend repo](https://github.com/vortex-hue/dex-naija-whot-backend))

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/vortex-hue/dex-naija-whot.git
   cd dex-naija-whot
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

3. **Start the dev server**
   ```bash
   npm start
   ```

4. **Connect your wallet** — The app requires a Solana wallet connection before accessing any content.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `REACT_APP_SOCKET_URL` | Backend WebSocket URL | `https://api.whot.xendex.com.ng` |

## Project Structure 📁

```
dex-naija-whot/
├── src/
│   ├── components/
│   │   ├── GameOver/          # Win/loss screen + Torque event reporting
│   │   ├── WalletHeader/      # Connected wallet display + disconnect
│   │   └── NetworkMonitor/    # Smart online/offline detection
│   ├── context/
│   │   └── Web3Provider.jsx   # Solana wallet adapter + WalletGate
│   ├── pages/
│   │   ├── PlayComputer/      # Solo gameplay
│   │   ├── Tournaments/       # PvP tournament system
│   │   ├── Rewards/           # Points dashboard
│   │   └── Donation/          # Support page
│   └── utils/
│       ├── hooks/
│       └── wagmiShim.js       # Legacy bridge (redirects to Solana adapter)
├── public/
└── package.json
```

## Contributing 💻

Contributions are welcome! Please feel free to submit Pull Requests or open issues for feature requests and bug reports.

## License 📄

This project is licensed under the MIT License.
