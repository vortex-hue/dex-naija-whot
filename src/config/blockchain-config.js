import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

// Real Solana Configuration
export const BLOCKCHAIN_CONFIG = {
  // Network configuration
  network: 'devnet', // Change to 'mainnet-beta' for production
  rpcUrl: clusterApiUrl('devnet'),
  
  // Real wallet addresses (replace with your actual addresses)
  TREASURY_WALLET: new PublicKey('11111111111111111111111111111112'), // System program as placeholder
  PROJECT_MINT: new PublicKey('So11111111111111111111111111111111111111112'), // Native SOL
  
  // Game configuration
  GAME_SETTINGS: {
    XP_PER_CARD: 1,
    XP_PER_WIN: 50,
    XP_PER_LOSS: 10,
    MISSION_XP_MULTIPLIER: 2,
    LOYALTY_TIER_THRESHOLD: 1000,
  },
  
  // Tournament configuration
  TOURNAMENT_SETTINGS: {
    MIN_ENTRY_FEE: 0.01, // SOL
    MAX_ENTRY_FEE: 1.0,  // SOL
    PLATFORM_FEE: 0.05,  // 5%
    PRIZE_DISTRIBUTION: {
      FIRST: 0.7,   // 70%
      SECOND: 0.2,  // 20%
      THIRD: 0.1,   // 10%
    }
  }
};

// Initialize Solana connection
export const connection = new Connection(BLOCKCHAIN_CONFIG.rpcUrl, 'confirmed');

// Player account structure for blockchain storage
export const PLAYER_ACCOUNT_SCHEMA = {
  publicKey: 'string',
  name: 'string',
  level: 'number',
  xp: 'number',
  gamesPlayed: 'number',
  gamesWon: 'number',
  missions: 'array',
  traits: 'array',
  loyaltyTier: 'string',
  loyaltyPoints: 'number',
  loginStreak: 'number',
  lastLogin: 'string',
  createdAt: 'string',
  updatedAt: 'string',
};

// Mission types that can be stored on-chain
export const MISSION_TYPES = {
  DAILY_WINS: {
    id: 'daily_wins',
    name: 'Daily Victory',
    description: 'Win 3 games today',
    target: 3,
    reward: { xp: 100, sol: 0.01 },
    type: 'daily',
    resetPeriod: '24h'
  },
  CARD_MASTER: {
    id: 'card_master',
    name: 'Card Master',
    description: 'Play 50 cards in one session',
    target: 50,
    reward: { xp: 200, sol: 0.02 },
    type: 'session',
    resetPeriod: 'session'
  },
  WIN_STREAK: {
    id: 'win_streak',
    name: 'Win Streak',
    description: 'Win 5 games in a row',
    target: 5,
    reward: { xp: 300, sol: 0.05 },
    type: 'streak',
    resetPeriod: 'continuous'
  }
};

// Trait definitions for blockchain storage
export const TRAIT_DEFINITIONS = {
  CARD_MASTER: {
    id: 'card_master',
    name: 'Card Master',
    description: 'Gain 50% more XP for each card played',
    levelRequired: 5,
    cost: 100,
    effect: 'card_xp_boost',
    multiplier: 1.5,
  },
  VICTORY_RUSH: {
    id: 'victory_rush',
    name: 'Victory Rush',
    description: 'Gain double XP for winning games',
    levelRequired: 3,
    cost: 150,
    effect: 'win_xp_boost',
    multiplier: 2.0,
  },
  STRATEGIC_MIND: {
    id: 'strategic_mind',
    name: 'Strategic Mind',
    description: 'See opponent\'s next card (computer games only)',
    levelRequired: 8,
    cost: 300,
    effect: 'card_preview',
  }
};

export default BLOCKCHAIN_CONFIG;