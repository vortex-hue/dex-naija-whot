/* global BigInt */
import { useAccount, useChainId, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits, erc20Abi, formatUnits } from 'viem';
import { useState } from 'react';

const TOKENS = {
    44787: [ // Alfajores Testnet
        { symbol: "cUSD", address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" }
    ],
    42220: [ // Celo Mainnet
        { symbol: "cUSD", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" },
        { symbol: "USDT", address: "0x48065fbBE25f71C9282dd522D51915b942201f09" },
        { symbol: "USDC", address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" }
    ]
};

export function usePay() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
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
            const chainTokens = TOKENS[chainId] || TOKENS[44787]; // Default to Testnet
            const treasury = process.env.REACT_APP_TREASURY_ADDRESS || address; // Fallback to self

            // 1. Find Token with Balance
            let selectedToken = null;
            let amountBigInt = BigInt(0);

            console.log("� Scanning balances...");

            for (const token of chainTokens) {
                try {
                    const balance = await publicClient.readContract({
                        address: token.address,
                        abi: erc20Abi,
                        functionName: 'balanceOf',
                        args: [address]
                    });

                    // Assuming 18 decimals for cUSD and 6 for USDT/USDC usually?
                    // Celo cUSD is 18. USDT on Celo is 6? USDC is 6?
                    // Let's check. Standard Celo cUSD is 18.
                    // USDT (Tether) on Celo: 6 decimals?
                    // USDC (Circle) on Celo: 6 decimals?
                    // To be safe, we should read 'decimals' too, but for now I'll assume 18 for cUSD and check others.
                    // Actually, let's normalize.

                    const decimals = await publicClient.readContract({
                        address: token.address,
                        abi: erc20Abi,
                        functionName: 'decimals'
                    });

                    const requiredAmount = parseUnits(amountUSD.toString(), decimals);

                    console.log(`💰 ${token.symbol}: ${formatUnits(balance, decimals)} (Need: ${amountUSD})`);

                    if (balance >= requiredAmount) {
                        selectedToken = token;
                        amountBigInt = requiredAmount;
                        break; // Found one!
                    }
                } catch (e) {
                    console.warn(`Failed to check ${token.symbol}`, e);
                }
            }

            if (!selectedToken) {
                alert(`Insufficient funds. You need ${amountUSD} in cUSD, USDT, or USDC.`);
                setIsPaying(false);
                return false;
            }

            console.log(`✅ Using ${selectedToken.symbol} for payment`);

            // 2. Pay
            const txHash = await writeContractAsync({
                address: selectedToken.address,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [treasury, amountBigInt],
            });

            console.log("✅ Payment Sent. Tx Hash:", txHash);
            // alert("Payment Sent! Verifying..."); // Optional feedback

            // 3. Verify with Backend (IMMEDIATELY - let server wait for mining)
            const apiUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
            const res = await fetch(`${apiUrl}/api/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash,
                    userAddress: address,
                    amount: amountUSD,
                    type,
                    tokenSymbol: selectedToken.symbol
                })
            });

            const data = await res.json();
            console.log("📡 Backend Verification Result:", data);

            if (!data.success) {
                alert("Verification Failed: " + (data.message || "Unknown error"));
            }

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
