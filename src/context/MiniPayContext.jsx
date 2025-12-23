import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { minipay } from 'minipay-wagmi-connector';

const MiniPayContext = createContext();

export const useMiniPay = () => useContext(MiniPayContext);

export const MiniPayProvider = ({ children }) => {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const [isMiniPayUser, setIsMiniPayUser] = useState(false);

    useEffect(() => {
        // Detect MiniPay environment
        const isMiniPay = window.ethereum && window.ethereum.isMiniPay;

        if (isMiniPay) {
            setIsMiniPayUser(true);
            if (!isConnected) {
                connect({ connector: minipay() });
            }
        }
    }, [isConnected, connect]);

    // Side effect: Sync address to localStorage for game logic
    useEffect(() => {
        if (isConnected && address && isMiniPayUser) {
            localStorage.setItem("storedId", address);

            // Sync with backend
            const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
            fetch(`${apiUrl}/api/user/${address}`)
                .catch(err => console.error("Registration check failed", err));
        }
    }, [address, isConnected, isMiniPayUser]);

    return (
        <MiniPayContext.Provider value={{ isMiniPayUser, address }}>
            {children}
        </MiniPayContext.Provider>
    );
};
