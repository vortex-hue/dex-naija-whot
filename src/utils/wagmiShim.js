/**
 * wagmi compatibility shim — maps Solana wallet adapter to wagmi's useAccount interface.
 * This lets existing components continue using `import { useAccount } from 'wagmi'`
 * without needing to rewrite every component.
 */
import { useWallet } from '@solana/wallet-adapter-react';

export function useAccount() {
    const { publicKey, connected } = useWallet();
    return {
        address: publicKey ? publicKey.toBase58() : undefined,
        isConnected: connected,
        isConnecting: false,
        isDisconnected: !connected,
    };
}

export function useConnect() {
    return { connect: () => {}, connectors: [] };
}

export function useDisconnect() {
    const { disconnect } = useWallet();
    return { disconnect };
}

// No-ops for unused wagmi exports
export function useChainId() { return 1; }
export function useWriteContract() { return {}; }
export function usePublicClient() { return null; }

// Re-export as a fake WagmiProvider (noop wrapper)
export const WagmiProvider = ({ children }) => children;
export function createConfig() { return {}; }
export function http() { return ''; }
