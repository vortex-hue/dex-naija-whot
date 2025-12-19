import React from 'react';
import { motion } from 'framer-motion';
import { TournamentSystem, Footer } from '../../components';
import { Link } from 'react-router-dom';
import './Tournament.css';

const Tournament = () => {
    return (
        <div className="naija-theme-container tournament-page">
            <motion.div
                className="tournament-nav"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <div className="nav-content">
                    <Link to="/" className="nav-home-link">
                        <span role="img" aria-label="home">🏠</span> Home
                    </Link>
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