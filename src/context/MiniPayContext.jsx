import React, { createContext, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const MiniPayContext = createContext();

export const useMiniPay = () => useContext(MiniPayContext);

/**
 * MiniPay is Celo-specific and no longer used.
 * This is a noop wrapper that preserves the provider shape
 * so existing components don't break.
 */
export const MiniPayProvider = ({ children }) => {
    const { publicKey, connected } = useWallet();
    const address = connected && publicKey ? publicKey.toBase58() : null;

    return (
        <MiniPayContext.Provider value={{ isMiniPayUser: false, address }}>
            {children}
        </MiniPayContext.Provider>
    );
};
