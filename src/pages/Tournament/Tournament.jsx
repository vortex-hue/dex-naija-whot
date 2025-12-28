import React from 'react';
import { motion } from 'framer-motion';
import { TournamentSystem, Footer, BackButton } from '../../components';
import { Link } from 'react-router-dom';
import './Tournament.css';

const Tournament = () => {
    return (
        <div className="naija-theme-container tournament-page">
            <BackButton style={{ top: '20px', left: '20px' }} />
            <motion.div
                className="tournament-nav"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <div className="nav-content">
                    <h1>🇳🇬 Naija Whot Tournaments 🏆</h1>
                </div>
            </motion.div>

            <motion.div
                className="tournament-main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <TournamentSystem />
            </motion.div>

            <Footer />
        </div>
    );
};

export default Tournament;