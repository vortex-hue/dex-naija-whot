/**
 * Script to set up a real Honeycomb Protocol project
 * Run this with: node scripts/setup-honeycomb.js
 */

const { Connection, Keypair, clusterApiUrl } = require('@solana/web3.js');
const { HiveControl } = require('@honeycomb-protocol/hive-control');
const fs = require('fs');
const path = require('path');

async function setupHoneycombProject() {
  console.log('🐝 Setting up Honeycomb Protocol project...');

  // Connect to Solana devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
  // Generate a new keypair for the project (you can also use existing wallet)
  const projectKeypair = Keypair.generate();
  
  console.log('📋 Project Details:');
  console.log('Public Key:', projectKeypair.publicKey.toString());
  console.log('Private Key:', Buffer.from(projectKeypair.secretKey).toString('base64'));
  
  try {
    // Initialize Hive Control
    const hive = new HiveControl({
      connection,
      wallet: {
        publicKey: projectKeypair.publicKey,
        signTransaction: async (tx) => {
          tx.sign(projectKeypair);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.sign(projectKeypair));
          return txs;
        },
      },
      cluster: 'devnet',
    });

    // Request airdrop for project setup (devnet only)
    console.log('💰 Requesting SOL airdrop for project setup...');
    const airdropSignature = await connection.requestAirdrop(
      projectKeypair.publicKey,
      2000000000 // 2 SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log('✅ Airdrop successful!');

    // Create the project
    console.log('🏗️ Creating Honeycomb project...');
    const projectData = {
      name: 'Naija Whot Game',
      authority: projectKeypair.publicKey,
      delegateAuthority: null,
      services: [
        'missions',
        'character_model',
        'staking',
        'currency_manager',
      ],
      metadata: {
        name: 'Naija Whot',
        description: 'A blockchain-powered Nigerian card game with missions, traits, and tournaments',
        image: 'https://your-domain.com/logo.png',
        external_url: 'https://your-domain.com',
      },
    };

    // Note: This is pseudo-code. Actual Honeycomb project creation
    // requires specific API calls to their project creation service
    console.log('📝 Project configuration:');
    console.log(JSON.stringify(projectData, null, 2));

    // Save project configuration
    const configPath = path.join(__dirname, '..', 'src', 'config', 'honeycomb-config.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const config = {
      projectAddress: projectKeypair.publicKey.toString(),
      network: 'devnet',
      authority: projectKeypair.publicKey.toString(),
      services: projectData.services,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved to: ${configPath}`);

    // Save keypair securely (for development only)
    const keypairPath = path.join(__dirname, '..', 'src', 'config', 'project-keypair.json');
    fs.writeFileSync(keypairPath, JSON.stringify({
      publicKey: projectKeypair.publicKey.toString(),
      secretKey: Array.from(projectKeypair.secretKey),
    }, null, 2));
    console.log(`🔐 Keypair saved to: ${keypairPath}`);
    
    console.log('\n🎉 Honeycomb project setup complete!');
    console.log('\n⚠️  IMPORTANT: In production, never commit private keys to git!');
    console.log('Add project-keypair.json to .gitignore');

  } catch (error) {
    console.error('❌ Error setting up Honeycomb project:', error);
  }
}

// Run the setup
setupHoneycombProject().catch(console.error);