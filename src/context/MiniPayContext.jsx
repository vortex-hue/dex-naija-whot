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
        try {
            // Detect MiniPay environment safely
            const isMiniPay = !!(window.ethereum && (window.ethereum.isMiniPay || window.ethereum.isOpera));
            console.log("🔍 MiniPay Detection:", isMiniPay);

            if (isMiniPay) {
                setIsMiniPayUser(true);
                if (!isConnected) {
                    console.log("⚡ Auto-connecting MiniPay...");
                    connect({ connector: minipay() });
                }
            }
        } catch (error) {
            console.error("🔥 Error detecting MiniPay:", error);
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
