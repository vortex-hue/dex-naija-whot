import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BackButton } from '../../components';
import { usePay } from '../../utils/hooks/usePay';
import { useMiniPay } from '../../context/MiniPayContext';
import { useAccount } from 'wagmi';
import confetti from 'canvas-confetti';
import '../../styles/home.css';

const Donation = () => {
    const { pay, isPaying } = usePay();
    const { isConnected } = useAccount();
    const { isMiniPayUser } = useMiniPay();
    const [customAmount, setCustomAmount] = useState('');
    const [selectedAmount, setSelectedAmount] = useState(null);

    const presets = [0.5, 1, 2, 5, 10, 20];

    const handleDonate = async () => {
        const amount = selectedAmount || parseFloat(customAmount);
        if (!amount || amount <= 0) {
            alert("Please select or enter a valid amount!");
            return;
        }

        if (!isConnected) {
            alert("Please connect your wallet first (MiniPay or external).");
            return;
        }

        const success = await pay(amount, 'donation');
        if (success) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#008751', '#FFFFFF']
            });
            alert(`Thank you for your generosity! ❤️ ($${amount})`);
            setCustomAmount('');
            setSelectedAmount(null);
        }
    };

    // Fallback for Non-MiniPay Users (Flutterwave)
    if (!isMiniPayUser) {
        return (
            <div className="naija-theme-container" style={{ padding: '20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <BackButton style={{ top: '20px', left: '20px' }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        background: 'white',
                        padding: '20px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        textAlign: 'center'
                    }}
                >
                    <h2 style={{ color: '#008751', marginBottom: '20px' }}>Support Naija Whot ❤️</h2>

                    <div style={{
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: '15px',
                        marginBottom: '25px',
                        border: '1px solid #eee'
                    }}>
                        <img
                            src="/Flutterwave - Decal-2_Page_1_Image_0001.jpg"
                            alt="Donate via Flutterwave"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <p style={{ color: '#555', marginBottom: '25px', lineHeight: '1.5' }}>
                        We accept donations via Flutterwave for easy bank transfers and card payments.
                    </p>

                    <a
                        href="https://flutterwave.com/donate/lr7iyppmmq76"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '100%',
                                padding: '18px',
                                background: '#FB9129', // Flutterwave Orange-ish
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 5px 20px rgba(251, 145, 41, 0.4)'
                            }}
                        >
                            Donate Securely 💳
                        </motion.button>
                    </a>
                </motion.div>
            </div>
        );
    }

    // MiniPay / Crypto Donation View
    return (
        <div className="naija-theme-container" style={{ padding: '20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <BackButton style={{ top: '20px', left: '20px' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <span style={{ fontSize: '4rem' }}>❤️</span>
                    <h1 style={{ color: '#008751', margin: '10px 0', fontSize: '2rem' }}>Support Naija Whot</h1>
                    <p style={{ color: '#555' }}>
                        We made this game free for everyone. If you enjoy playing, please consider supporting the servers and development!
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                    {presets.map(amt => (
                        <motion.button
                            key={amt}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                            style={{
                                padding: '15px',
                                border: selectedAmount === amt ? '2px solid #008751' : '1px solid #ddd',
                                background: selectedAmount === amt ? '#e8f5e9' : 'white',
                                borderRadius: '12px',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: selectedAmount === amt ? '#008751' : '#333',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            ${amt}
                        </motion.button>
                    ))}
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <input
                        type="number"
                        placeholder="Custom Amount ($)"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                        style={{
                            width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ccc', fontSize: '1.1rem', outline: 'none'
                        }}
                    />
                </div>

                <motion.button
                    onClick={handleDonate}
                    disabled={isPaying}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: isPaying ? '#999' : 'linear-gradient(45deg, #008751, #00a86b)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px',
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        cursor: isPaying ? 'not-allowed' : 'pointer',
                        boxShadow: '0 5px 20px rgba(0, 135, 81, 0.4)'
                    }}
                >
                    {isPaying ? "Processing Donation..." : `Donate ${selectedAmount || customAmount ? '$' + (selectedAmount || customAmount) : ''}`}
                </motion.button>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#888' }}>
                    Payments are securely processed via MiniPay / Celo Blockchain.
                </p>
            </motion.div>
        </div>
    );
};

export default Donation;
