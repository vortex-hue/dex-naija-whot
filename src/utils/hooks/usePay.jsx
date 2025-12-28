import { useAccount, useChainId, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits, erc20Abi } from 'viem';
import { useState } from 'react';

const CUSD_ADDRESS = {
    44787: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // Alfajores
    42220: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Mainnet
};

export function usePay() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient(); // Access viem public client
    const [isPaying, setIsPaying] = useState(false);

    const pay = async (amountUSD, type) => {
        if (!isConnected) {
            alert("Please connect MiniPay first!");
            return false;
        }

        if (!publicClient) {
            alert("System Error: Blockchain client not initialized. Try reloading.");
            return false;
        }

        setIsPaying(true);
        try {
            const tokenAddress = CUSD_ADDRESS[chainId] || CUSD_ADDRESS[44787]; // Default to Testnet
            const amount = parseUnits(amountUSD.toString(), 18);
            const treasury = process.env.REACT_APP_TREASURY_ADDRESS || address; // Fallback to self

            console.log(`💸 Paying ${amountUSD} cUSD to ${treasury}`);

            const txHash = await writeContractAsync({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [treasury, amount],
            });

            console.log("✅ Payment Sent. Tx Hash:", txHash);
            // alert(`Payment sent! Waiting for confirmation...`); // Optional: Feedback to user

            // WAIT for transaction to be mined
            console.log("⏳ Waiting for receipt...");
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 1
            });

            console.log("🧱 Transaction Mined!", receipt);

            // Verify with backend
            const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
            const res = await fetch(`${apiUrl}/api/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    userAddress: address,
                    amount: amountUSD,
                    type
                })
            });

            const data = await res.json();
            console.log("📡 Backend Verification Result:", data);

            setIsPaying(false);
            return data.success;

        } catch (error) {
            console.error("❌ Payment Failed:", error);

            // Extract meaningful error message
            let msg = error.message || "Unknown error";
            if (msg.includes("User rejected")) msg = "User cancelled payment.";

            alert("Payment Failed: " + msg);
            setIsPaying(false);
            return false;
        }
    };

    return { pay, isPaying };
}
