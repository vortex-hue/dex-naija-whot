import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { minipay } from 'minipay-wagmi-connector';

const config = createConfig({
    chains: [celo, celoAlfajores],
    connectors: [
        minipay(),
    ],
    transports: {
        [celo.id]: http(),
        [celoAlfajores.id]: http(),
    },
});

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
