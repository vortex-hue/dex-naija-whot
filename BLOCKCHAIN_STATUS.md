# Blockchain & Torque Integration Status

## ✅ IMPLEMENTED & WORKING

### Solana Wallet
- Wallet connection via `@solana/wallet-adapter` (Phantom, Solflare, Backpack, etc.)
- Persistent sessions via `autoConnect` — wallet stays connected across page refreshes
- `WalletGate` enforces connection before any content is shown
- `WalletHeader` displays truncated address, copy button, and disconnect option

### Torque Protocol Integration
- **6 custom events** created, attached to WhotChain project, and confirmed `query-ready`:
  - `whot_game_won` — fired on every game win
  - `whot_game_played` — fired on every game loss
  - `whot_daily_login` — fired on first game of the day
  - `whot_pvp_won` — fired on PvP match wins
  - `whot_streak_7` — fired when player reaches 7-day streak
  - `whot_streak_30` — fired when player reaches 30-day streak
- Events fire via `POST https://ingest.torque.so/events` with `userPubkey`, `timestamp`, `eventName`, and `data`
- All events return `202 ACCEPTED` from Torque's ingestion pipeline
- **Weekly WhotChain Leaderboard** incentive created (type: leaderboard, interval: WEEKLY, emission: SOL)

### Points System
- Server-side points tracking in MongoDB/SQLite
- Address validator supports both Solana (base58) and EVM (0x) addresses
- Points awarded: 25 (win), 5 (loss), 10 (daily login), 50 (PvP win), 100 (7-day streak), 500 (30-day streak)
- Streak tracking with daily date comparison

### Network Monitoring
- Smart online/offline detection using `GET /api/health`
- 2+ consecutive failure threshold before showing "Offline"
- Browser `online`/`offline` events for instant detection

## ❌ REMOVED (Legacy)
- ~~Celo/MiniPay integration~~ — Fully replaced by Solana
- ~~wagmi/viem~~ — Replaced by `@solana/wallet-adapter` (wagmiShim.js exists as bridge)
- ~~Honeycomb Protocol~~ — Removed
- ~~Solana Pay QR~~ — Removed
- ~~Pay-to-retry ($0.10)~~ — All games are free
- ~~MiniPayContext~~ — Deleted
- ~~usePay hook~~ — Stripped of payment logic

## 🔧 ENVIRONMENT VARIABLES

### Frontend (.env)
```
REACT_APP_SOCKET_URL=http://localhost:8080
```

### Backend (.env)
```
MONGODB_URI=<your MongoDB connection string>
TORQUE_INGEST_API_KEY=<your Torque API key>
TORQUE_API_KEY=<your Torque MCP auth token>
TORQUE_WHOTCHAIN_PROJECT_ID=cmo9mdh4300t8l91i8fhhbhna
TORQUE_EVENT_GAME_WON=cmo9mc7j600swl91ixv8psgyh
TORQUE_EVENT_GAME_PLAYED=cmo9mck0p00syl91i3qscyo88
TORQUE_EVENT_DAILY_LOGIN=cmo9mckl300t0l91i7nqtxmm9
TORQUE_EVENT_PVP_WON=cmo9mcksu00t2l91i4dxvpbt6
TORQUE_EVENT_STREAK_7=cmo9mcl0d00t4l91iegk8xj0x
TORQUE_EVENT_STREAK_30=cmo9mcl8k00t6l91ic5mae816
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```