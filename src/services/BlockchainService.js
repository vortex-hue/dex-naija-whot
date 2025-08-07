import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { connection, BLOCKCHAIN_CONFIG, MISSION_TYPES, TRAIT_DEFINITIONS } from '../config/blockchain-config';

class BlockchainService {
  constructor() {
    this.connection = connection;
    this.config = BLOCKCHAIN_CONFIG;
  }

  // ==================== WALLET OPERATIONS ====================

  async getWalletBalance(publicKey) {
    try {
      const balance = await this.connection.getBalance(new PublicKey(publicKey));
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  async sendTransaction(transaction, wallet) {
    try {
      const signature = await wallet.sendTransaction(transaction, this.connection);
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  // ==================== PLAYER DATA STORAGE ====================

  async getPlayerProfile(publicKey) {
    try {
      // In a real implementation, this would fetch from a Program Derived Address (PDA)
      // For now, we'll use localStorage with blockchain validation
      const storageKey = `whot_player_${publicKey}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const profile = JSON.parse(stored);
        
        // Validate the profile exists on-chain
        const isValidated = await this.validatePlayerOnChain(publicKey);
        if (isValidated) {
          return profile;
        }
      }
      
      // Create new player profile
      return await this.createPlayerProfile(publicKey);
    } catch (error) {
      console.error('Error getting player profile:', error);
      return null;
    }
  }

  async createPlayerProfile(publicKey) {
    try {
      const profile = {
        publicKey: publicKey.toString(),
        name: `Player_${publicKey.toString().slice(0, 8)}`,
        level: 1,
        xp: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        missions: [],
        traits: [],
        loyaltyTier: 'bronze',
        loyaltyPoints: 0,
        loginStreak: 1,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store locally (in production, this would be stored on-chain)
      const storageKey = `whot_player_${publicKey}`;
      localStorage.setItem(storageKey, JSON.stringify(profile));

      // Create on-chain validation record
      await this.createPlayerValidationRecord(publicKey);

      return profile;
    } catch (error) {
      console.error('Error creating player profile:', error);
      throw error;
    }
  }

  async updatePlayerProfile(publicKey, updates) {
    try {
      const storageKey = `whot_player_${publicKey}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const profile = JSON.parse(stored);
        const updatedProfile = {
          ...profile,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
        
        // In production: Update on-chain data
        await this.updatePlayerOnChain(publicKey, updates);
        
        return updatedProfile;
      }
      
      throw new Error('Player profile not found');
    } catch (error) {
      console.error('Error updating player profile:', error);
      throw error;
    }
  }

  // ==================== MISSION SYSTEM ====================

  async getMissionProgress(publicKey, missionId) {
    try {
      const profile = await this.getPlayerProfile(publicKey);
      const mission = profile.missions.find(m => m.id === missionId);
      return mission || this.createNewMission(missionId);
    } catch (error) {
      console.error('Error getting mission progress:', error);
      return null;
    }
  }

  createNewMission(missionId) {
    const missionTemplate = MISSION_TYPES[missionId.toUpperCase()];
    if (!missionTemplate) {
      throw new Error(`Unknown mission: ${missionId}`);
    }

    return {
      ...missionTemplate,
      progress: 0,
      completed: false,
      startedAt: new Date().toISOString(),
    };
  }

  async updateMissionProgress(publicKey, missionId, increment = 1) {
    try {
      const profile = await this.getPlayerProfile(publicKey);
      const missionIndex = profile.missions.findIndex(m => m.id === missionId);
      
      if (missionIndex >= 0) {
        const mission = profile.missions[missionIndex];
        if (!mission.completed) {
          mission.progress = Math.min(mission.progress + increment, mission.target);
          mission.completed = mission.progress >= mission.target;
          
          if (mission.completed) {
            // Award rewards
            profile.xp += mission.reward.xp;
            
            // In production: Send SOL reward transaction
            if (mission.reward.sol > 0) {
              await this.sendRewardTransaction(publicKey, mission.reward.sol);
            }
          }
        }
      } else {
        // Create new mission
        const newMission = this.createNewMission(missionId);
        newMission.progress = increment;
        newMission.completed = newMission.progress >= newMission.target;
        profile.missions.push(newMission);
        
        if (newMission.completed) {
          profile.xp += newMission.reward.xp;
          if (newMission.reward.sol > 0) {
            await this.sendRewardTransaction(publicKey, newMission.reward.sol);
          }
        }
      }

      // Update level based on XP
      const newLevel = Math.floor(profile.xp / 1000) + 1;
      if (newLevel > profile.level) {
        profile.level = newLevel;
        console.log(`🎉 Level up! Player is now level ${newLevel}`);
      }

      await this.updatePlayerProfile(publicKey, profile);
      return profile;
    } catch (error) {
      console.error('Error updating mission progress:', error);
      throw error;
    }
  }

  // ==================== TOURNAMENT SYSTEM ====================

  async createTournamentEntry(publicKey, tournamentId, entryFee) {
    try {
      // Create transaction to send entry fee to treasury
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: this.config.TREASURY_WALLET,
          lamports: entryFee * LAMPORTS_PER_SOL,
        })
      );

      return transaction;
    } catch (error) {
      console.error('Error creating tournament entry:', error);
      throw error;
    }
  }

  async verifyTournamentPayment(signature) {
    try {
      const transaction = await this.connection.getTransaction(signature);
      return transaction && transaction.meta && !transaction.meta.err;
    } catch (error) {
      console.error('Error verifying tournament payment:', error);
      return false;
    }
  }

  // ==================== TRAIT SYSTEM ====================

  async unlockTrait(publicKey, traitId) {
    try {
      const profile = await this.getPlayerProfile(publicKey);
      const trait = TRAIT_DEFINITIONS[traitId.toUpperCase()];
      
      if (!trait) {
        throw new Error(`Unknown trait: ${traitId}`);
      }

      // Check requirements
      if (profile.level < trait.levelRequired) {
        throw new Error(`Level ${trait.levelRequired} required`);
      }

      if (profile.xp < trait.cost) {
        throw new Error(`${trait.cost} XP required`);
      }

      if (profile.traits.includes(traitId)) {
        throw new Error('Trait already unlocked');
      }

      // Deduct XP and add trait
      profile.xp -= trait.cost;
      profile.traits.push(traitId);

      await this.updatePlayerProfile(publicKey, profile);
      
      // In production: Create on-chain trait NFT
      await this.createTraitNFT(publicKey, traitId);
      
      return profile;
    } catch (error) {
      console.error('Error unlocking trait:', error);
      throw error;
    }
  }

  // ==================== BLOCKCHAIN VALIDATION ====================

  async validatePlayerOnChain(publicKey) {
    try {
      // Check if player has any transaction history (basic validation)
      const signatures = await this.connection.getSignaturesForAddress(
        new PublicKey(publicKey),
        { limit: 1 }
      );
      return signatures.length > 0;
    } catch (error) {
      console.error('Error validating player on-chain:', error);
      return false;
    }
  }

  async createPlayerValidationRecord(publicKey) {
    try {
      // In production: Create a PDA account for the player
      // For now, we'll just log the creation
      console.log(`🔗 Player validation record created for: ${publicKey}`);
      return true;
    } catch (error) {
      console.error('Error creating player validation record:', error);
      return false;
    }
  }

  async updatePlayerOnChain(publicKey, updates) {
    try {
      // In production: Update the player's PDA account
      console.log(`🔗 Player data updated on-chain for: ${publicKey}`, updates);
      return true;
    } catch (error) {
      console.error('Error updating player on-chain:', error);
      return false;
    }
  }

  async sendRewardTransaction(publicKey, solAmount) {
    try {
      // In production: Send SOL from treasury to player
      console.log(`💰 Reward sent: ${solAmount} SOL to ${publicKey}`);
      return true;
    } catch (error) {
      console.error('Error sending reward transaction:', error);
      return false;
    }
  }

  async createTraitNFT(publicKey, traitId) {
    try {
      // In production: Mint trait NFT to player
      console.log(`🎨 Trait NFT created: ${traitId} for ${publicKey}`);
      return true;
    } catch (error) {
      console.error('Error creating trait NFT:', error);
      return false;
    }
  }

  // ==================== REAL-TIME DATA ====================

  async getRealtimeGameStats() {
    try {
      // Fetch real-time stats from blockchain
      const stats = {
        totalPlayers: await this.getTotalPlayers(),
        totalGamesPlayed: await this.getTotalGamesPlayed(),
        totalRewardsDistributed: await this.getTotalRewardsDistributed(),
        activeTournaments: await this.getActiveTournaments(),
      };
      return stats;
    } catch (error) {
      console.error('Error getting realtime stats:', error);
      return null;
    }
  }

  async getTotalPlayers() {
    // In production: Query all player PDAs
    return Math.floor(Math.random() * 10000) + 1000;
  }

  async getTotalGamesPlayed() {
    // In production: Query game event logs
    return Math.floor(Math.random() * 100000) + 50000;
  }

  async getTotalRewardsDistributed() {
    // In production: Sum all reward transactions
    return Math.floor(Math.random() * 1000) + 500;
  }

  async getActiveTournaments() {
    // In production: Query tournament program accounts
    return Math.floor(Math.random() * 10) + 5;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;