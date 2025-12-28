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

    const [isSuccess, setIsSuccess] = useState(false);

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

        console.log("💰 Initiating donation of $", amount);
        const success = await pay(amount, 'donation');
        console.log("📡 Donation result:", success);

        if (success) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#008751', '#FFFFFF']
            });
            setIsSuccess(true);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="naija-theme-container" style={{ padding: '20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Improved Back Button Visibility */}
            <BackButton style={{ top: '20px', left: '20px', color: '#008751', background: 'white', border: '2px solid #008751', zIndex: 10001 }} />

            {isSuccess ? (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '25px',
                        textAlign: 'center',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        zIndex: 10
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                        style={{ fontSize: '6rem', marginBottom: '20px' }}
                    >
                        🎉
                    </motion.div>

                    <h1 style={{ color: '#008751', marginBottom: '15px', fontSize: '2.5rem' }}>Success!</h1>

                    <p style={{ fontSize: '1.2rem', color: '#333', marginBottom: '35px', lineHeight: '1.6' }}>
                        Thank you so much for your donation! ❤️ <br /><br />
                        Your contribution will go a long way in supporting the servers and future updates for Naija Whot. 🇳🇬
                    </p>

                    <a href="/" style={{ textDecoration: 'none', display: 'block' }}>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,135,81,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '100%',
                                padding: '18px',
                                background: '#008751',
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Return Home 🏠
                        </motion.button>
                    </a>
                </motion.div>
            ) : !isMiniPayUser ? (
                /* Fallback for Non-MiniPay Users (Flutterwave) */
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        background: 'white',
                        padding: '25px',
                        borderRadius: '25px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        textAlign: 'center'
                    }}
                >
                    <h2 style={{ color: '#008751', marginBottom: '20px', fontSize: '1.8rem' }}>Become a Supporter ❤️</h2>

                    <div style={{
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: '20px',
                        marginBottom: '25px',
                        border: '1px solid #eee',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                    }}>
                        <img
                            src="/Flutterwave - Decal-2_Page_1_Image_0001.jpg"
                            alt="Donate via Flutterwave"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <p style={{ color: '#555', marginBottom: '25px', lineHeight: '1.6', fontSize: '1.05rem' }}>
                        We accept cards and bank transfers via Flutterwave to support the project.
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
                                padding: '20px',
                                background: '#FB9129',
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '1.4rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(251, 145, 41, 0.4)'
                            }}
                        >
                            Donate Securely 💳
                        </motion.button>
                    </a>
                </motion.div>
            ) : (
                /* MiniPay / Crypto Donation View */
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.98)', padding: '35px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                        <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '10px' }}>❤️</span>
                        <h1 style={{ color: '#008751', margin: '10px 0', fontSize: '2.2rem' }}>Support Us</h1>
                        <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>
                            Love Naija Whot? Help us keep the servers running and the game free for all!
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                        {presets.map(amt => (
                            <motion.button
                                key={amt}
                                whileHover={{ scale: 1.05, border: '2px solid #008751' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                                style={{
                                    padding: '18px 5px',
                                    border: selectedAmount === amt ? '2px solid #008751' : '1px solid #e0e0e0',
                                    background: selectedAmount === amt ? '#e8f5e9' : 'white',
                                    borderRadius: '16px',
                                    fontSize: '1.3rem',
                                    fontWeight: 'bold',
                                    color: selectedAmount === amt ? '#008751' : '#444',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                ${amt}
                            </motion.button>
                        ))}
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <input
                            type="number"
                            placeholder="Or enter custom amount ($)"
                            value={customAmount}
                            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                            style={{
                                width: '100%', padding: '18px', borderRadius: '16px', border: '1px solid #ddd', fontSize: '1.2rem', outline: 'none', background: '#f9f9f9', transition: 'border 0.2s', textAlign: 'center'
                            }}
                            onFocus={(e) => e.target.style.border = '1px solid #008751'}
                            onBlur={(e) => e.target.style.border = '1px solid #ddd'}
                        />
                    </div>

                    <motion.button
                        onClick={handleDonate}
                        disabled={isPaying}
                        whileHover={!isPaying ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
                        whileTap={!isPaying ? { scale: 0.98 } : {}}
                        style={{
                            width: '100%',
                            padding: '22px',
                            background: isPaying ? '#d1d1d1' : 'linear-gradient(135deg, #008751 0%, #00b36b 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '18px',
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            cursor: isPaying ? 'not-allowed' : 'pointer',
                            boxShadow: isPaying ? 'none' : '0 10px 30px rgba(0, 135, 81, 0.4)',
                            transition: 'all 0.3s'
                        }}
                    >
                        {isPaying ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                                />
                                Verifying...
                            </div>
                        ) : (
                            `Donate ${selectedAmount || customAmount ? '$' + (selectedAmount || customAmount) : ''}`
                        )}
                    </motion.button>

                    <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#999' }}>
                        Secured via MiniPay / Celo Blockchain
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default Donation;
