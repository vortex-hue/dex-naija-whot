import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BackButton } from '../../components';
import '../../styles/home.css';

const Donation = () => {
    const [isSuccess, setIsSuccess] = useState(false);

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
            ) : (
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
            )}

        </div>
    );
};

export default Donation;
