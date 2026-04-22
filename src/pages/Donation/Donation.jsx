import React from 'react';
import { motion } from 'framer-motion';
import { BackButton } from '../../components';
import '../../styles/home.css';

const Donation = () => {
    return (
        <div className="naija-theme-container" style={{ padding: '20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Improved Back Button Visibility */}
            <BackButton style={{ top: '20px', left: '20px', color: '#008751', background: 'white', border: '2px solid #008751', zIndex: 10001 }} />

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
        </div>
    );
};

export default Donation;
