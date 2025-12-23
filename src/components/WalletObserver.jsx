import { useEffect } from 'react';
import { useAccount } from 'wagmi';

const WalletObserver = () => {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (isConnected && address) {
            console.log("🔗 Wallet Connected:", address);
            // Override storedId with wallet address
            localStorage.setItem("storedId", address);

            // Register user in backend (idempotent)
            const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
            fetch(`${apiUrl}/api/user/${address}`)
                .then(res => res.json())
                .then(data => console.log("✅ User registered:", data))
                .catch(err => console.error("❌ Failed to register user:", err));
        }
    }, [address, isConnected]);

    return null;
};

export default WalletObserver;
